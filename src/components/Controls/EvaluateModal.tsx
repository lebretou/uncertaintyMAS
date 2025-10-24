import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTraceStore } from '@services/traceStore';
import { Trace, ExecutionResult } from '@/types';

interface EvaluateModalProps {
  onClose: () => void;
}

// Render content with intelligent formatting
const renderContent = (content: unknown) => {
  if (content === null || content === undefined) {
    return <span className="text-gray-400 italic">No content</span>;
  }

  // Handle complex output from agents with Python code execution
  if (typeof content === 'object' && content !== null) {
    const obj = content as any;

    // Special handling for agent outputs with Python code
    if ('pythonCode' in obj || 'executionResult' in obj || 'dataRef' in obj || 'schema' in obj) {
      return (
        <div className="space-y-3">
          {/* Priority: Show execution results first if available */}
          {obj.executionResult && (
            <div>
              <div className="text-xs font-semibold text-green-700 mb-1">✓ Execution Result:</div>
              <pre className="bg-green-50 p-3 rounded border border-green-200 overflow-x-auto text-xs font-mono">
                {JSON.stringify(obj.executionResult, null, 2)}
              </pre>
            </div>
          )}

          {/* Show key data fields if present */}
          {obj.dataRef && (
            <div>
              <div className="text-xs font-semibold text-blue-600 mb-1">Data Reference:</div>
              <div className="text-sm font-mono bg-blue-50 p-2 rounded">{obj.dataRef}</div>
            </div>
          )}

          {obj.schema && (
            <div>
              <div className="text-xs font-semibold text-purple-600 mb-1">Data Schema:</div>
              <pre className="bg-purple-50 p-3 rounded border border-purple-200 overflow-x-auto text-xs font-mono">
                {JSON.stringify(obj.schema, null, 2)}
              </pre>
            </div>
          )}

          {obj.qualityIssues && (
            <div>
              <div className="text-xs font-semibold text-orange-600 mb-1">Quality Issues:</div>
              <pre className="bg-orange-50 p-3 rounded border border-orange-200 overflow-x-auto text-xs font-mono">
                {JSON.stringify(obj.qualityIssues, null, 2)}
              </pre>
            </div>
          )}

          {obj.sampleRows && (
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Sample Data:</div>
              <pre className="bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto text-xs font-mono">
                {obj.sampleRows}
              </pre>
            </div>
          )}

          {/* Description */}
          {obj.description && (
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Description:</div>
              <div className="text-sm text-gray-700">{obj.description}</div>
            </div>
          )}

          {/* Python Code - show collapsed by default if execution result exists */}
          {obj.pythonCode && (
            <details className={obj.executionResult ? "" : "open"}>
              <summary className="text-xs font-semibold text-gray-600 mb-1 cursor-pointer hover:text-gray-800">
                {obj.executionResult ? "▶ Generated Python Code (click to expand)" : "Generated Python Code:"}
              </summary>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto text-xs font-mono max-h-64 overflow-y-auto mt-1">
                {obj.pythonCode}
              </pre>
            </details>
          )}

          {/* Context Packet for downstream agents */}
          {obj.contextPacket && (
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Context for Downstream:</div>
              <pre className="bg-blue-50 p-3 rounded border border-blue-200 overflow-x-auto text-xs font-mono">
                {JSON.stringify(obj.contextPacket, null, 2)}
              </pre>
            </div>
          )}

          {/* Cleaning-specific output */}
          {obj.cleaningStrategy && (
            <div>
              <div className="text-xs font-semibold text-teal-600 mb-1">Cleaning Strategy:</div>
              <pre className="bg-teal-50 p-3 rounded border border-teal-200 overflow-x-auto text-xs font-mono">
                {JSON.stringify(obj.cleaningStrategy, null, 2)}
              </pre>
            </div>
          )}

          {obj.transformationLog && obj.transformationLog.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-indigo-600 mb-1">Transformations Applied:</div>
              <ul className="bg-indigo-50 p-3 rounded border border-indigo-200 text-xs space-y-1">
                {obj.transformationLog.map((log: string, i: number) => (
                  <li key={i}>• {log}</li>
                ))}
              </ul>
            </div>
          )}

          {obj.cleanedDataRef && (
            <div>
              <div className="text-xs font-semibold text-teal-600 mb-1">Cleaned Data Reference:</div>
              <div className="text-sm font-mono bg-teal-50 p-2 rounded">{obj.cleanedDataRef}</div>
            </div>
          )}

          {/* Other fields - exclude common fields and rawOutput */}
          {Object.keys(obj).filter(key =>
            !['pythonCode', 'description', 'executionResult', 'contextPacket', 'expectedOutput',
              'pythonExecutionTime', 'rawOutput', 'dataRef', 'schema', 'qualityIssues',
              'sampleRows', 'cleaningStrategy', 'transformationLog', 'cleanedDataRef'].includes(key)
          ).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Additional Data:</div>
              <pre className="bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto text-xs font-mono">
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(obj).filter(([key]) =>
                      !['pythonCode', 'description', 'executionResult', 'contextPacket', 'expectedOutput',
                        'pythonExecutionTime', 'rawOutput', 'dataRef', 'schema', 'qualityIssues',
                        'sampleRows', 'cleaningStrategy', 'transformationLog', 'cleanedDataRef'].includes(key)
                    )
                  ),
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      );
    }

    // Handle case where we only have rawOutput (backward compatibility)
    if ('rawOutput' in obj && Object.keys(obj).length === 1) {
      const rawContent = obj.rawOutput;
      // Check if rawOutput contains Python code
      if (typeof rawContent === 'string' && rawContent.includes('```python')) {
        return (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-amber-600 mb-1">
              ⚠️ Raw Output (Python execution may have failed):
            </div>
            <pre className="bg-amber-50 p-3 rounded border border-amber-200 overflow-x-auto text-xs font-mono">
              {rawContent}
            </pre>
          </div>
        );
      }
    }
  }

  // If it's a string, check if it contains code blocks or is structured text
  if (typeof content === 'string') {
    // Check for code blocks (markdown-style)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        parts.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap mb-2">
            {textBefore}
          </div>
        );
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2];
      parts.push(
        <div key={`code-${match.index}`} className="mb-2">
          <div className="text-xs text-gray-500 mb-1 font-mono">{language}</div>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto text-xs font-mono">
            {code}
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      parts.push(
        <div key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {remainingText}
        </div>
      );
    }

    // If we found code blocks, return the parts
    if (parts.length > 0) {
      return <div>{parts}</div>;
    }

    // Check if it's JSON-like string
    try {
      const parsed = JSON.parse(content);
      return (
        <pre className="bg-white p-3 rounded border border-gray-200 overflow-x-auto text-xs font-mono">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      // Plain text
      return (
        <div className="bg-white p-3 rounded border border-gray-200 overflow-x-auto text-xs whitespace-pre-wrap">
          {content}
        </div>
      );
    }
  }

  // For objects/arrays, render as formatted JSON
  return (
    <pre className="bg-white p-3 rounded border border-gray-200 overflow-x-auto text-xs font-mono">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
};

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
    case 'summarizer':
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

export const EvaluateModal: React.FC<EvaluateModalProps> = ({ onClose }) => {
  const traces = useTraceStore((state) => state.traces);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(
    traces.length > 0 ? traces[0] : null
  );
  const [expandedExecutionId, setExpandedExecutionId] = useState<string | null>(null);

  const handleTraceClick = (trace: Trace) => {
    setSelectedTrace(trace);
    setExpandedExecutionId(null);
  };

  const toggleExecution = (executionId: string) => {
    setExpandedExecutionId(
      expandedExecutionId === executionId ? null : executionId
    );
  };

  // Group executions by node
  const groupedExecutions = selectedTrace
    ? selectedTrace.executions.reduce((acc, execution) => {
        if (!acc[execution.nodeId]) {
          acc[execution.nodeId] = [];
        }
        acc[execution.nodeId].push(execution);
        return acc;
      }, {} as Record<string, ExecutionResult[]>)
    : {};

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Trace Evaluation</h2>
            <p className="text-sm text-gray-500 mt-1">
              Review all pipeline executions and results
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Trace List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Execution History ({traces.length})
              </h3>
              {traces.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No traces yet. Run the pipeline to see results.
                </p>
              ) : (
                <div className="space-y-2">
                  {traces.map((trace) => (
                    <button
                      key={trace.traceId}
                      onClick={() => handleTraceClick(trace)}
                      className={`w-full text-left p-3 rounded border transition-colors ${
                        selectedTrace?.traceId === trace.traceId
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-gray-500">
                          {trace.traceId.substring(0, 8)}...
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            trace.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : trace.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {trace.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        {new Date(trace.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {trace.runCount} run{trace.runCount !== 1 ? 's' : ''} ·{' '}
                        {trace.propagationMode ? 'Propagation' : 'Independent'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Execution Details */}
          <div className="flex-1 overflow-y-auto">
            {!selectedTrace ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a trace to view details
              </div>
            ) : (
              <div className="p-6">
                {/* Trace Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Trace Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Executions:</span>
                      <span className="ml-2 font-semibold">
                        {selectedTrace.executionStats?.totalExecutions || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Successful:</span>
                      <span className="ml-2 font-semibold text-green-600">
                        {selectedTrace.executionStats?.successfulExecutions || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Failed:</span>
                      <span className="ml-2 font-semibold text-red-600">
                        {selectedTrace.executionStats?.failedExecutions || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Time:</span>
                      <span className="ml-2 font-semibold">
                        {((selectedTrace.executionStats?.totalExecutionTime || 0) / 1000).toFixed(2)}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Executions by Node */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">
                    Executions by Agent
                  </h3>
                  {Object.entries(groupedExecutions).map(([nodeId, executions]) => {
                    const agentIcon = getAgentIcon(nodeId);
                    return (
                    <div key={nodeId} className="border border-gray-200 rounded-lg">
                      <div className="bg-gray-100 px-4 py-3 font-semibold text-gray-800 flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${agentIcon.color} flex-shrink-0`}>
                          {agentIcon.icon}
                        </div>
                        <span>
                          {executions[0].nodeName} ({executions.length} execution
                          {executions.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {executions.map((execution) => (
                          <div key={execution.executionId}>
                            <button
                              onClick={() => toggleExecution(execution.executionId)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="text-xs font-mono text-gray-500">
                                    {execution.executionId.substring(0, 8)}...
                                  </span>
                                  {execution.error && (
                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                      Error
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                  <span>{execution.executionTime}ms</span>
                                  <svg
                                    className={`w-4 h-4 transition-transform ${
                                      expandedExecutionId === execution.executionId
                                        ? 'rotate-180'
                                        : ''
                                    }`}
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
                                </div>
                              </div>
                            </button>

                            {expandedExecutionId === execution.executionId && (
                              <div className="px-4 py-3 bg-gray-50 text-sm space-y-4">
                                <div>
                                  <div className="font-semibold text-gray-700 mb-2">
                                    Input:
                                  </div>
                                  {renderContent(execution.input)}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-700 mb-2">
                                    Output:
                                  </div>
                                  {renderContent(execution.output)}
                                </div>
                                {execution.error && (
                                  <div>
                                    <div className="font-semibold text-red-700 mb-2">
                                      Error:
                                    </div>
                                    <pre className="bg-red-50 p-3 rounded border border-red-200 overflow-x-auto text-xs text-red-700 font-mono">
                                      {JSON.stringify(execution.error, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
