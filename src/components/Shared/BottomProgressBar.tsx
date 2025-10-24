import React from 'react';
import { ExecutionProgress } from '@services/pipelineExecutor';

interface BottomProgressBarProps {
  progress: ExecutionProgress | null;
  isRunning: boolean;
}

export const BottomProgressBar: React.FC<BottomProgressBarProps> = ({ progress, isRunning }) => {
  if (!isRunning || !progress) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="px-6 py-3">
        {/* Progress Info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm font-semibold text-gray-700">
                {progress.phase}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium">{progress.completedAgentCalls}</span>
            <span className="mx-1">/</span>
            <span>{progress.totalAgentCalls} agent calls</span>
            <span className="mx-2">·</span>
            <span className="font-medium">{progress.percentComplete}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
};
