import React from 'react';
import { AgentDefinition } from '@/types';

interface NodeInfoPanelProps {
  agent: AgentDefinition;
  onClose: () => void;
}

// Get agent-specific icon and color
const getAgentIcon = (agentId: string) => {
  switch (agentId) {
    case 'ingest':
      return {
        color: 'bg-blue-500',
        icon: (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )
      };
    case 'schema-mapper':
      return {
        color: 'bg-purple-500',
        icon: (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      };
    case 'cleaning':
      return {
        color: 'bg-teal-500',
        icon: (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )
      };
    case 'analytics':
      return {
        color: 'bg-orange-500',
        icon: (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      };
    case 'visualization':
      return {
        color: 'bg-pink-500',
        icon: (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        )
      };
    default:
      return {
        color: 'bg-gray-500',
        icon: (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      };
  }
};

export const NodeInfoPanel: React.FC<NodeInfoPanelProps> = ({
  agent,
  onClose,
}) => {
  const agentIcon = getAgentIcon(agent.id);

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Panel Header */}
        <div className="border-b border-gray-200 pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {/* Agent Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agentIcon.color} flex-shrink-0`}>
                {agentIcon.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{agent.name}</h2>
                <p className="text-xs text-gray-500 mt-1">ID: {agent.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-sm text-gray-600">{agent.description}</p>
        </div>

        {/* Configuration */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Configuration</h3>
          <div className="bg-gray-50 rounded p-3 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Model:</span>
              <span className="text-gray-600">{agent.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Temperature:</span>
              <span className="text-gray-600">{agent.temperature}</span>
            </div>
          </div>
        </div>

        {/* System Prompt */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">System Prompt</h3>
          <div className="bg-gray-100 rounded p-3 max-h-60 overflow-y-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
              {agent.systemPrompt}
            </pre>
          </div>
        </div>

        {/* Downstream Connections */}
        {agent.downstreamNodeIds.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Downstream Agents
            </h3>
            <div className="flex flex-wrap gap-2">
              {agent.downstreamNodeIds.map((id) => (
                <span
                  key={id}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
