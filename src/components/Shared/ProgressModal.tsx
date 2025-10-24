import React from 'react';
import { ExecutionProgress } from '@services/pipelineExecutor';

interface ProgressModalProps {
  progress: ExecutionProgress | null;
  isRunning: boolean;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ progress, isRunning }) => {
  if (!isRunning || !progress) {
    return null;
  }

  const overallProgress = (progress.completedNodes / progress.totalNodes) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-[500px]">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Executing Pipeline
          </h3>
          <p className="text-sm text-gray-600">
            Run {progress.currentRun} of {progress.totalRuns}
          </p>
        </div>

        {/* Current Node */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Current Agent:
            </span>
            <span className="text-sm text-gray-600">{progress.currentNodeName}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <div className="mt-2 text-xs text-gray-500 text-center">
            {progress.completedNodes} of {progress.totalNodes} nodes completed
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        {/* Status Message */}
        <div className="text-center text-sm text-gray-600">
          Processing {progress.currentNodeName.toLowerCase()}...
        </div>
      </div>
    </div>
  );
};
