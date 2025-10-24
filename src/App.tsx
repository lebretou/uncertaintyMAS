import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { PipelineCanvas } from '@components/Canvas/PipelineCanvas';
import { UncertaintyModePanel } from '@components/UncertaintyPanel/UncertaintyModePanel';
import { RunConfigDropdown } from '@components/Controls/RunConfigDropdown';
import { EvaluateButton } from '@components/Controls/EvaluateButton';
import { BottomProgressBar } from '@components/Shared/BottomProgressBar';
import { RunConfiguration } from './types';
import { ExecutionProgress } from '@services/pipelineExecutor';

function App() {
  const [runConfig, setRunConfig] = useState<RunConfiguration>({
    runCount: 3,
    propagationMode: false,
    pipelineId: 'deterministic',
    csvData: '',
    csvFileName: undefined,
    userPrompt: '',
  });

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<ExecutionProgress | null>(null);
  const [runStatus, setRunStatus] = useState<{
    type: 'success' | 'error';
    message: string;
    timestamp: string;
  } | null>(null);

  const handleRun = async () => {
    // Validate inputs
    if (!runConfig.csvData) {
      alert('Please upload a CSV file before running the pipeline');
      return;
    }
    if (!runConfig.userPrompt.trim()) {
      alert('Please describe your analysis task before running');
      return;
    }

    setIsRunning(true);
    setProgress(null);
    setRunStatus(null);

    try {
      const { executePipeline } = await import('./services/pipelineExecutor');

      console.log('Running pipeline with config:', runConfig);

      // Execute the pipeline with progress callback
      const traceId = await executePipeline(runConfig, (progressUpdate) => {
        console.log('Progress:', progressUpdate);
        setProgress(progressUpdate);
      });

      console.log('Pipeline execution completed. Trace ID:', traceId);

      // Show success status
      setRunStatus({
        type: 'success',
        message: 'Run complete',
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      console.error('Pipeline execution error:', error);
      setRunStatus({
        type: 'error',
        message: 'Run failed',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* App Icon */}
            <div className="w-12 h-12 flex-shrink-0">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2"/>
                <circle cx="16" cy="8" r="3" fill="#FFFFFF" opacity="0.9"/>
                <circle cx="10" cy="20" r="3" fill="#FFFFFF" opacity="0.7"/>
                <circle cx="22" cy="20" r="3" fill="#FFFFFF" opacity="0.5"/>
                <line x1="16" y1="11" x2="10" y2="17" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6"/>
                <line x1="16" y1="11" x2="22" y2="17" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4"/>
                <line x1="13" y1="20" x2="19" y2="20" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.3"/>
                <path d="M16 14 Q18 15 16 16 Q14 17 16 18" stroke="#FCD34D" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Uncertainty MAS
              </h1>
              <p className="text-sm text-gray-500">
                Multi-Agent Pipeline with Uncertainty Visualization
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {runStatus && (
              <div className={`flex items-center space-x-2 text-sm ${
                runStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {runStatus.type === 'success' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="font-medium">{runStatus.message}</span>
                <span className="text-gray-400">at {runStatus.timestamp}</span>
              </div>
            )}
            <RunConfigDropdown
              config={runConfig}
              onChange={setRunConfig}
              onRun={handleRun}
              disabled={isRunning || !runConfig.csvData}
            />
            <EvaluateButton />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Pipeline Config & Uncertainty Mode Panel */}
        <UncertaintyModePanel
          pipelineId={runConfig.pipelineId}
          onPipelineChange={(pipelineId) => setRunConfig({ ...runConfig, pipelineId })}
          onCSVLoad={(csvData, fileName) =>
            setRunConfig({ ...runConfig, csvData, csvFileName: fileName })
          }
          csvFileName={runConfig.csvFileName}
          userPrompt={runConfig.userPrompt}
          onUserPromptChange={(prompt) => setRunConfig({ ...runConfig, userPrompt: prompt })}
        />

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <PipelineCanvas pipelineId={runConfig.pipelineId} />
          </ReactFlowProvider>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <BottomProgressBar progress={progress} isRunning={isRunning} />
    </div>
  );
}

export default App;
