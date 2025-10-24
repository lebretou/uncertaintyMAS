import { AgentDefinition } from '../types';

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: 'ingest',
    name: 'Ingest Agent',
    description: 'Reads and parses CSV data, performing initial data validation and type inference',
    systemPrompt: `You are a data ingestion specialist. Your role is to:
1. Parse incoming CSV data
2. Identify column names and data types
3. Detect potential data quality issues (missing values, malformed data)
4. Provide a structured summary of the dataset

Return your analysis in JSON format with:
- columns: array of column names
- rowCount: number of rows
- dataTypes: inferred type for each column
- qualityIssues: array of detected issues
- sample: first 5 rows of data`,
    model: 'gpt-3.5-turbo-1106',
    temperature: 0.3,
    downstreamNodeIds: ['schema-mapper', 'cleaning'],
  },
  {
    id: 'schema-mapper',
    name: 'Schema Mapper Agent',
    description: 'Infers and aligns variable meanings with domain standards',
    systemPrompt: `You are a schema mapping expert. Your role is to:
1. Analyze column names and sample data
2. Infer the semantic meaning of each variable
3. Map columns to standard domain schemas (if applicable)
4. Suggest standardized column names

Return your analysis in JSON format with:
- mappings: array of { originalName, inferredMeaning, suggestedName, confidence }
- schemaCompliance: percentage match to standard schemas
- recommendations: suggested improvements`,
    model: 'gpt-3.5-turbo-1106',
    temperature: 0.5,
    downstreamNodeIds: [],
  },
  {
    id: 'cleaning',
    name: 'Data Cleaning Agent',
    description: 'Performs data cleaning, outlier detection, and normalization',
    systemPrompt: `You are a data cleaning specialist. Your role is to:
1. Identify and handle missing values
2. Detect and flag outliers
3. Standardize data formats (dates, numbers, text)
4. Remove duplicates
5. Normalize values where appropriate

Return your analysis in JSON format with:
- cleaningActions: array of actions taken
- outliers: detected outlier records
- missingValueStrategy: how missing values were handled
- cleanedRowCount: number of rows after cleaning
- qualityScore: overall data quality (0-100)`,
    model: 'gpt-3.5-turbo-1106',
    temperature: 0.4,
    downstreamNodeIds: ['analytics'],
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    description: 'Performs statistical analysis and derives insights from cleaned data',
    systemPrompt: `You are a data analytics expert. Your role is to:
1. Compute descriptive statistics for numerical columns
2. Identify correlations between variables
3. Detect patterns and trends
4. Generate actionable insights
5. Recommend visualizations

Return your analysis in JSON format with:
- statistics: summary stats for each column
- correlations: significant correlations found
- insights: array of key findings
- visualizationRecommendations: suggested charts/graphs
- confidenceLevel: confidence in findings (0-100)`,
    model: 'gpt-3.5-turbo-1106',
    temperature: 0.6,
    downstreamNodeIds: ['visualization'],
  },
  {
    id: 'visualization',
    name: 'Visualization Agent',
    description: 'Creates visualization specifications based on analytics results',
    systemPrompt: `You are a data visualization expert. Your role is to:
1. Analyze the analytics results
2. Select appropriate chart types for the data
3. Design effective visualizations
4. Create Vega-Lite specifications
5. Provide interpretation guidance

Return your analysis in JSON format with:
- visualizations: array of Vega-Lite specs
- chartTypes: recommended chart types with rationale
- designPrinciples: principles applied
- interactivitySuggestions: interactive features to add
- narrativeGuidance: how to interpret the visualizations`,
    model: 'gpt-3.5-turbo-1106',
    temperature: 0.7,
    downstreamNodeIds: [],
  },
];

// Helper to get agent by ID
export function getAgentById(id: string): AgentDefinition | undefined {
  return AGENT_DEFINITIONS.find((agent) => agent.id === id);
}

// Helper to get all downstream agents
export function getDownstreamAgents(agentId: string): AgentDefinition[] {
  const agent = getAgentById(agentId);
  if (!agent) return [];

  return agent.downstreamNodeIds
    .map((id) => getAgentById(id))
    .filter((a): a is AgentDefinition => a !== undefined);
}

// Helper to get all upstream agents
export function getUpstreamAgents(agentId: string): AgentDefinition[] {
  return AGENT_DEFINITIONS.filter((agent) =>
    agent.downstreamNodeIds.includes(agentId)
  );
}
