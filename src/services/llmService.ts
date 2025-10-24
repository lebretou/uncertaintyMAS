import OpenAI from 'openai';
import { ModelType } from '@/types/pipeline';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: For production, use a backend proxy
});

export interface LLMCallParams {
  model: ModelType;
  systemPrompt: string;
  userMessage: string;
  temperature: number;
  maxRetries?: number;
}

export interface LLMResponse {
  content: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  executionTime: number;
  model: string;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 2000, // 2 seconds
  maxDelay: 8000, // 8 seconds
};

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, config.maxDelay);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    // Retry on rate limit, timeout, and server errors
    return (
      error.status === 429 || // Rate limit
      error.status === 408 || // Request timeout
      error.status === 503 || // Service unavailable
      error.status === 504 || // Gateway timeout
      (error.status !== undefined && error.status >= 500) // Server errors
    );
  }
  return false;
}

/**
 * Call OpenAI API with retry logic and exponential backoff
 */
export async function callLLM(params: LLMCallParams): Promise<LLMResponse> {
  const {
    model,
    systemPrompt,
    userMessage,
    temperature,
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
  } = params;

  const config: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    maxRetries,
  };

  let lastError: unknown;
  const startTime = Date.now();

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Add jitter to prevent thundering herd
      if (attempt > 0) {
        const baseDelay = getBackoffDelay(attempt - 1, config);
        const jitter = Math.random() * 1000; // 0-1 second jitter
        const delay = baseDelay + jitter;

        console.log(
          `Retrying LLM call (attempt ${attempt}/${config.maxRetries}) after ${Math.round(delay)}ms...`
        );

        await sleep(delay);
      }

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature,
      });

      const executionTime = Date.now() - startTime;

      // Extract response
      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      if (!usage) {
        throw new Error('No usage data returned from OpenAI API');
      }

      return {
        content,
        tokenUsage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        executionTime,
        model: response.model,
      };
    } catch (error) {
      lastError = error;

      // Log the error
      if (error instanceof OpenAI.APIError) {
        console.error(
          `OpenAI API Error (attempt ${attempt + 1}/${config.maxRetries + 1}):`,
          {
            status: error.status,
            message: error.message,
            type: error.type,
          }
        );
      } else {
        console.error(
          `Unexpected error (attempt ${attempt + 1}/${config.maxRetries + 1}):`,
          error
        );
      }

      // Check if we should retry
      if (attempt < config.maxRetries && isRetryableError(error)) {
        continue; // Retry
      }

      // If not retryable or out of retries, throw
      break;
    }
  }

  // If we get here, all retries failed
  const executionTime = Date.now() - startTime;

  if (lastError instanceof OpenAI.APIError) {
    throw new Error(
      `OpenAI API call failed after ${config.maxRetries + 1} attempts: ${lastError.message} (status: ${lastError.status})`
    );
  }

  throw new Error(
    `LLM call failed after ${config.maxRetries + 1} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}

/**
 * Test the LLM service with a simple call
 */
export async function testLLMConnection(): Promise<boolean> {
  try {
    await callLLM({
      model: 'gpt-3.5-turbo-1106',
      systemPrompt: 'You are a helpful assistant.',
      userMessage: 'Say "Hello, world!" and nothing else.',
      temperature: 0.1,
      maxRetries: 1,
    });
    return true;
  } catch (error) {
    console.error('LLM connection test failed:', error);
    return false;
  }
}
