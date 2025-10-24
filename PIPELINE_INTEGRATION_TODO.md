# Pipeline Integration TODO

## Completed ✅
1. Created modular pipeline configuration system (`src/config/pipelines.ts`)
   - DETERMINISTIC_PIPELINE with updated agents (summarizer instead of schema-mapper)
   - CREATIVE_PIPELINE with higher temperature, non-deterministic agents
   - Both pipelines have detailed prompts for real CSV analysis

2. Added CSV upload component (`src/components/Controls/CSVUpload.tsx`)
3. Added pipeline selector component (`src/components/Controls/PipelineSelector.tsx`)
4. Updated RunConfiguration type to include `pipelineId`, `csvData`, `csvFileName`
5. Updated App.tsx header with pipeline selector and CSV upload

## Remaining Work 🚧

### 1. Update Pipeline Executor (`src/services/pipelineExecutor.ts`)
**Changes needed:**
- Replace hard-coded SAMPLE_CSV_DATA with `config.csvData` from RunConfiguration
- Import pipeline agents from `getPipelineById(config.pipelineId)` instead of AGENT_DEFINITIONS
- Update `executeAgent` to pass CSV data correctly to ingest agent
- Handle different pipeline structures (deterministic has 5 agents, creative has 5 different ones)
- Update progress tracking to handle variable agent counts per pipeline

**Key points:**
- Ingest agent user message should be: `Please analyze the following CSV data:\n\n${csvData}`
- Get agents dynamically: `const pipeline = getPipelineById(config.pipelineId); const agents = pipeline.agents;`
- Build execution graph from pipeline.agents dynamically

### 2. Update Pipeline Config (`src/config/pipelineConfig.ts`)
**Changes needed:**
- Make `initialNodes` and `initialEdges` dynamic based on selected pipeline
- Create helper function: `generateNodesAndEdges(pipelineId: string)`
- Update node positions for different pipeline structures
- Map agent IDs to React Flow node IDs

### 3. Update Pipeline Canvas (`src/components/Canvas/PipelineCanvas.tsx`)
**Changes needed:**
- Accept `pipelineId` prop from App
- Regenerate nodes/edges when pipeline changes
- Handle different pipeline structures in layout

### 4. Python Execution for Analytics Agent
**Implementation needed:**
- Create Python execution service (`src/services/pythonExecutor.ts`)
- Parse Python code from analytics agent output
- Execute using eval/Function (browser) OR fetch to backend API
- Return results back to pipeline

**Options:**
1. **Client-side (Pyodide):** Use Pyodide WASM for browser Python
2. **Server-side:** Create simple Flask/FastAPI endpoint to execute Python
3. **Mock for now:** Parse code, return mocked regression results

### 5. Visualization Rendering
**Implementation needed:**
- Parse Vega-Lite spec from visualization agent output
- Use `react-vega` or `vega-embed` to render
- Display in EvaluateModal accordion
- Handle scatter plots with regression lines

### 6. Icon Updates
**Update these files to handle new agent IDs:**
- `src/components/Canvas/NodeInfoPanel.tsx` - Add cases for 'summarizer', 'hypothesis-generator', 'pattern-finder', 'creative-analytics', 'creative-viz'
- `src/components/Canvas/PipelineNode.tsx` - Same icon updates
- `src/components/Controls/EvaluateModal.tsx` - Same icon updates

## Pipeline Execution Flow

### Deterministic Pipeline:
```
Ingest (temp=0.1)
  ├─> Summarizer (temp=0.3)
  └─> Cleaning (temp=0.2)
        └─> Analytics (temp=0.4) [Runs Python for linear regression]
              └─> Visualization (temp=0.5) [Creates Vega-Lite scatter + line]
```

### Creative Pipeline:
```
Ingest (temp=0.8)
  ├─> Hypothesis Generator (temp=0.9)
  └─> Pattern Finder (temp=0.85)
        └─> Creative Analytics (temp=0.8) [Multiple analytical approaches]
              └─> Creative Viz (temp=0.9) [Multiple visualization options]
```

## Testing CSV Example
Create a test CSV file like:
```csv
x,y
1,2.5
2,4.1
3,5.8
4,8.2
5,10.1
6,12.3
7,14.5
8,16.9
9,18.7
10,20.5
```

This gives clear linear relationship for testing regression.

## Next Steps Priority:
1. **Update pipeline executor** - Most critical, blocks everything else
2. **Update pipeline canvas** - Needed for visualization
3. **Add icon cases** - Quick fix for visual consistency
4. **Implement Python execution** - Can mock initially
5. **Implement viz rendering** - Final step for full demo
