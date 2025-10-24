import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '@/types';

export const PipelineNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  const hasUpstream = data.agentDefinition &&
    data.agentDefinition.id !== 'ingest'; // Ingest has no upstream
  const hasDownstream = data.agentDefinition &&
    data.agentDefinition.downstreamNodeIds.length > 0;

  const status = data.status || 'initial';

  // Get agent-specific styling
  const getAgentStyle = (agentId: string) => {
    switch (agentId) {
      case 'ingest':
        return {
          topBarColor: 'bg-blue-500',
          iconBg: 'bg-blue-500',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )
        };
      case 'schema-mapper':
        return {
          topBarColor: 'bg-purple-500',
          iconBg: 'bg-purple-500',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        };
      case 'cleaning':
        return {
          topBarColor: 'bg-teal-500',
          iconBg: 'bg-teal-500',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )
        };
      case 'analytics':
        return {
          topBarColor: 'bg-orange-500',
          iconBg: 'bg-orange-500',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        };
      case 'visualization':
        return {
          topBarColor: 'bg-pink-500',
          iconBg: 'bg-pink-500',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          )
        };
      default:
        return {
          topBarColor: 'bg-gray-500',
          iconBg: 'bg-gray-500',
          icon: (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )
        };
    }
  };

  // Get border color based on status
  const getBorderColor = () => {
    if (status === 'loading') return 'border-blue-500';
    if (status === 'success') return 'border-green-500';
    if (status === 'error') return 'border-red-500';
    return 'border-gray-300';
  };

  const agentStyle = data.agentDefinition ? getAgentStyle(data.agentDefinition.id) : getAgentStyle('default');

  return (
    <div
      className={`
        relative rounded-xl border-2 bg-white shadow-lg
        min-w-[200px] transition-all duration-200 cursor-pointer
        ${getBorderColor()}
        ${selected ? 'ring-4 ring-blue-200 scale-105' : ''}
        hover:shadow-2xl hover:scale-105
      `}
    >
      {/* Top colored bar */}
      <div className={`h-3 ${agentStyle.topBarColor} rounded-t-[10px]`} />
      {hasUpstream && (
        <Handle
          type="target"
          position={Position.Left}
          style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            background: '#3b82f6',
            border: '2px solid white',
            borderRadius: '50%',
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10
          }}
        />
      )}

      {/* Success/Error Indicator */}
      {(status === 'success' || status === 'error') && (
        <div className="absolute -top-2 -right-2 z-20">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            status === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {status === 'success' ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Content area with padding */}
      <div className="px-6 py-4 text-center">
        {/* Icon */}
        <div className="mb-2 flex justify-center">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${agentStyle.iconBg}`}>
            {agentStyle.icon}
          </div>
        </div>

        {/* Agent Name */}
        <div className="font-bold text-gray-900 text-base mb-2">
          {data.label}
        </div>

        {/* Model Badge */}
        {data.agentDefinition && (
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            data.agentDefinition.model.includes('gpt')
              ? 'bg-green-200 text-green-800'
              : 'bg-purple-200 text-purple-800'
          }`}>
            {data.agentDefinition.model}
          </div>
        )}
      </div>

      {hasDownstream && (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            position: 'absolute',
            width: '16px',
            height: '16px',
            background: '#3b82f6',
            border: '2px solid white',
            borderRadius: '50%',
            right: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
};
