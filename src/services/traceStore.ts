import { create } from 'zustand';
import { Trace, ExecutionResult, TraceStatus } from '../types';
import { UncertaintyConfig } from '../types/uncertainty';
import { nanoid } from 'nanoid';

interface TraceStore {
  traces: Trace[];
  currentTrace: Trace | null;

  // Actions
  createTrace: (runCount: number, propagationMode: boolean, uncertaintyConfig: UncertaintyConfig) => string;
  updateTraceStatus: (traceId: string, status: TraceStatus) => void;
  addExecution: (traceId: string, execution: ExecutionResult) => void;
  updateExecution: (traceId: string, executionId: string, updates: Partial<ExecutionResult>) => void;
  completeTrace: (traceId: string, wallClockTime?: number) => void;
  getTrace: (traceId: string) => Trace | undefined;
  getAllTraces: () => Trace[];
  deleteTrace: (traceId: string) => void;
  clearAllTraces: () => void;
  setCurrentTrace: (traceId: string | null) => void;
}

export const useTraceStore = create<TraceStore>()((set, get) => ({
  traces: [],
  currentTrace: null,

      createTrace: (runCount, propagationMode, uncertaintyConfig) => {
        const traceId = nanoid();
        const newTrace: Trace = {
          traceId,
          timestamp: new Date().toISOString(),
          runCount,
          propagationMode,
          executions: [],
          uncertaintyConfig,
          status: 'pending',
        };

        set((state) => ({
          traces: [newTrace, ...state.traces],
          currentTrace: newTrace,
        }));

        return traceId;
      },

      updateTraceStatus: (traceId, status) =>
        set((state) => ({
          traces: state.traces.map((trace) =>
            trace.traceId === traceId
              ? {
                  ...trace,
                  status,
                  executionStats: status === 'completed' ? calculateStats(trace) : trace.executionStats,
                }
              : trace
          ),
          currentTrace:
            state.currentTrace?.traceId === traceId
              ? { ...state.currentTrace, status }
              : state.currentTrace,
        })),

      addExecution: (traceId, execution) =>
        set((state) => ({
          traces: state.traces.map((trace) =>
            trace.traceId === traceId
              ? { ...trace, executions: [...trace.executions, execution] }
              : trace
          ),
          currentTrace:
            state.currentTrace?.traceId === traceId
              ? {
                  ...state.currentTrace,
                  executions: [...state.currentTrace.executions, execution],
                }
              : state.currentTrace,
        })),

      updateExecution: (traceId, executionId, updates) =>
        set((state) => ({
          traces: state.traces.map((trace) =>
            trace.traceId === traceId
              ? {
                  ...trace,
                  executions: trace.executions.map((exec) =>
                    exec.executionId === executionId
                      ? { ...exec, ...updates }
                      : exec
                  ),
                }
              : trace
          ),
          currentTrace:
            state.currentTrace?.traceId === traceId
              ? {
                  ...state.currentTrace,
                  executions: state.currentTrace.executions.map((exec) =>
                    exec.executionId === executionId
                      ? { ...exec, ...updates }
                      : exec
                  ),
                }
              : state.currentTrace,
        })),

      completeTrace: (traceId, wallClockTime) => {
        const trace = get().traces.find((t) => t.traceId === traceId);
        if (!trace) return;

        const executionStats = calculateStats(trace, wallClockTime);
        const status: TraceStatus =
          executionStats.failedExecutions === trace.executions.length ? 'failed' : 'completed';

        set((state) => ({
          traces: state.traces.map((t) =>
            t.traceId === traceId
              ? { ...t, status, executionStats }
              : t
          ),
          currentTrace:
            state.currentTrace?.traceId === traceId
              ? { ...state.currentTrace, status, executionStats }
              : state.currentTrace,
        }));
      },

      getTrace: (traceId) => get().traces.find((trace) => trace.traceId === traceId),

      getAllTraces: () => get().traces,

      deleteTrace: (traceId) =>
        set((state) => ({
          traces: state.traces.filter((trace) => trace.traceId !== traceId),
          currentTrace: state.currentTrace?.traceId === traceId ? null : state.currentTrace,
        })),

      clearAllTraces: () => set({ traces: [], currentTrace: null }),

  setCurrentTrace: (traceId) => {
    if (traceId === null) {
      set({ currentTrace: null });
    } else {
      const trace = get().traces.find((t) => t.traceId === traceId);
      set({ currentTrace: trace || null });
    }
  },
}));

function calculateStats(trace: Trace, wallClockTime?: number) {
  const totalExecutions = trace.executions.length;
  const successfulExecutions = trace.executions.filter((e) => !e.error).length;
  const failedExecutions = trace.executions.filter((e) => e.error).length;
  // Use wall-clock time if provided (parallel execution), otherwise sum individual times (fallback)
  const totalExecutionTime = wallClockTime ?? trace.executions.reduce((sum, e) => sum + e.executionTime, 0);

  return {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    totalExecutionTime,
  };
}
