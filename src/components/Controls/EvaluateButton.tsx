import React, { useState } from 'react';
import { useTraceStore } from '@services/traceStore';
import { EvaluateModal } from './EvaluateModal';

export const EvaluateButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const traces = useTraceStore((state) => state.traces);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-2 bg-gray-700 text-white font-semibold rounded hover:bg-gray-800 transition-colors"
      >
        Evaluate
        {traces.length > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-gray-600 rounded-full text-xs">
            {traces.length}
          </span>
        )}
      </button>

      {isModalOpen && (
        <EvaluateModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};
