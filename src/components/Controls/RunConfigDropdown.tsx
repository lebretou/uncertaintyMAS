import React, { useState, useRef, useEffect } from 'react';
import { RunConfiguration } from '@/types';

interface RunConfigDropdownProps {
  config: RunConfiguration;
  onChange: (config: RunConfiguration) => void;
  onRun: () => void;
  disabled?: boolean;
}

const PRESET_RUN_COUNTS = [1, 3, 5, 10];

export const RunConfigDropdown: React.FC<RunConfigDropdownProps> = ({
  config,
  onChange,
  onRun,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customCount, setCustomCount] = useState<number | ''>(config.runCount);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRunCountChange = (count: number) => {
    setCustomCount(count);
    onChange({ ...config, runCount: count });
  };

  const handlePropagationToggle = () => {
    onChange({ ...config, propagationMode: !config.propagationMode });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Run Button */}
      <div className="flex">
        <button
          onClick={onRun}
          disabled={disabled}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-l hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Run
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="px-3 py-2 bg-blue-600 text-white border-l border-blue-500 rounded-r hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 space-y-4">
            {/* Run Count Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Runs
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {PRESET_RUN_COUNTS.map((count) => (
                  <button
                    key={count}
                    onClick={() => handleRunCountChange(count)}
                    className={`py-2 px-3 text-sm font-medium rounded border ${
                      config.runCount === count
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={customCount}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : parseInt(e.target.value);
                    setCustomCount(value);
                    if (typeof value === 'number' && value > 0) {
                      handleRunCountChange(value);
                    }
                  }}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Propagation Mode */}
            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.propagationMode}
                  onChange={handlePropagationToggle}
                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700">
                    Propagation Mode
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    When enabled, each downstream node receives all N inputs and runs N
                    times (exponential growth). When disabled, entire pipeline runs N
                    times independently.
                  </div>
                </div>
              </label>
            </div>

            {/* Current Configuration Summary */}
            <div className="bg-gray-50 rounded p-3 text-xs">
              <div className="font-semibold text-gray-700 mb-1">
                Current Configuration:
              </div>
              <div className="text-gray-600">
                {config.runCount} run{config.runCount !== 1 ? 's' : ''} ·{' '}
                {config.propagationMode ? 'Propagation ON' : 'Independent runs'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
