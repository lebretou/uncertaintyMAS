# Uncertainty MAS - HCI Research Study

A web application for investigating how uncertainty visualization affects user trust in AI multi-agent pipelines.

## Overview

This application provides a React-based interface for interacting with a pre-built multi-agent data analysis pipeline. Users can run the pipeline multiple times and view uncertainty metrics using different visualization methods for A/B testing purposes.

## Features

### Phase 1 (Completed) ✅
- **React Flow Canvas**: Interactive pipeline visualization with draggable nodes
- **Uncertainty Mode Panel**: Left sidebar with metric and display mode selection
- **Top Controls**: Run button with configurable run count and propagation mode
- **Evaluation Modal**: View all past execution traces with detailed results
- **Zustand State Management**: Persistent configuration using localStorage
- **5 Agent Pipeline**:
  - Ingest Agent (GPT-4)
  - Schema Mapper Agent (GPT-4)
  - Data Cleaning Agent (GPT-4 Turbo)
  - Analytics Agent (Claude 3 Sonnet)
  - Visualization Agent (Claude 3 Opus)

### Upcoming Features
- **Phase 2**: LLM API integration (OpenAI + Anthropic)
- **Phase 3**: Multi-run execution with propagation mode
- **Phase 4**: Uncertainty visualization modes implementation
- **Phase 5**: Uncertainty metrics calculation
- **Phase 6**: Polish and research features

## Tech Stack

- **Framework**: React 18 + TypeScript (strict mode)
- **Build Tool**: Vite
- **UI Library**: React Flow for node-link diagrams
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **LLM APIs**: OpenAI SDK, Anthropic SDK

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys for OpenAI and Anthropic (for Phase 2+)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Create a production build:
```bash
npm run build
```

## Usage

### Running the Pipeline

1. **Configure Run Settings**: Click the dropdown next to the "Run" button
   - Select number of runs (1, 3, 5, 10, or custom)
   - Toggle "Propagation Mode"

2. **Select Uncertainty Visualization**:
   - Choose an uncertainty metric (Semantic Entropy, LLM Self-Report, etc.)
   - Select a display mode (Edge, Node Badge, Node Halo, Tooltip, Full)
   - Configure display settings (show values, highlight threshold)

3. **Run the Pipeline**: Click the "Run" button

4. **View Results**: Click "Evaluate" to see execution history and details

### Propagation Mode

- **OFF (Independent)**: Pipeline runs N times from start to finish independently
- **ON (Propagation)**: First node runs N times, each downstream node receives all N inputs (exponential growth)

### Node Interaction

- **Click** a node to view its configuration (system prompt, model, temperature)
- **Drag** nodes to reposition them on the canvas
- Nodes are **non-editable** - this is a fixed pipeline for research purposes

## License

This project is for academic research purposes.