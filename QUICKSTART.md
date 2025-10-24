# Quick Start Guide

## Get Started in 2 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to: [http://localhost:3000](http://localhost:3000)

## What You'll See

### Left Panel (Uncertainty Mode)
- **Select a metric**: Choose how uncertainty is calculated
- **Choose display mode**: Select how to visualize uncertainty
- **Configure settings**: Toggle options and adjust threshold
- **Try presets**: Load pre-configured combinations

### Main Canvas
- **View the pipeline**: See all 5 agents in a flow diagram
- **Click nodes**: View agent configuration details
- **Drag nodes**: Reposition for better layout

### Top Controls
- **Run button**: Click dropdown to configure runs
  - Select number of runs (1, 3, 5, 10, custom)
  - Toggle propagation mode
- **Evaluate button**: View execution history (empty until pipeline runs)

## Current Functionality (Phase 1)

✅ **Working**:
- Interactive pipeline visualization
- Uncertainty mode configuration
- Preset management
- UI layout and navigation
- Node information panels
- Persistent settings (localStorage)

⏳ **Coming in Phase 2**:
- Actual pipeline execution
- LLM API calls
- Execution results
- Uncertainty calculations

## Testing the UI

1. **Change uncertainty metric**: Select different options in left panel
2. **Try display modes**: Switch between Edge, Badge, Halo, etc.
3. **Adjust threshold**: Move the slider when highlight mode is on
4. **Save preset**: Configure settings and save as a custom preset
5. **Click nodes**: View detailed agent information
6. **Click Run dropdown**: Explore run configuration options
7. **Open Evaluate**: See the trace viewer (currently empty)

## Configuration Files

### Pipeline Agents
Edit `src/config/agentDefinitions.ts` to modify:
- System prompts
- Models (GPT-4, Claude, etc.)
- Temperature settings
- Agent connections

### Uncertainty Presets
Edit `src/config/uncertaintyPresets.ts` to add default presets

### Visual Layout
Edit `src/config/pipelineConfig.ts` to adjust node positions

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure at a Glance

```
src/
├── components/       # All React components
│   ├── Canvas/      # Pipeline visualization
│   ├── Controls/    # Run button, Evaluate modal
│   ├── UncertaintyPanel/  # Left sidebar
│   ├── UncertaintyDisplay/  # Visualization modes
│   └── Shared/      # Reusable components
├── services/        # Zustand stores
├── types/           # TypeScript definitions
├── config/          # Agent and preset configurations
├── App.tsx          # Main application
└── main.tsx         # Entry point
```

## Troubleshooting

### Port already in use
```bash
# Change port in vite.config.ts or kill process
lsof -ti:3000 | xargs kill -9
```

### Styles not loading
```bash
# Rebuild Tailwind
rm -rf dist node_modules/.vite
npm run dev
```

### TypeScript errors
```bash
# Check for errors
npm run build
```

## Next Steps for Development

Ready to implement Phase 2? See `IMPLEMENTATION_SUMMARY.md` for detailed next steps.

### Phase 2 Checklist:
- [ ] Create `.env` file with API keys
- [ ] Implement `src/services/llmService.ts`
- [ ] Add OpenAI SDK integration
- [ ] Add Anthropic SDK integration
- [ ] Test with a simple pipeline run

## Tips

- **State persists**: Your settings are saved in localStorage
- **Clear state**: Open dev tools → Application → Local Storage → Clear
- **Mock mode**: Phase 1 shows loading animation but doesn't execute
- **Responsive**: Best viewed at 1440px+ width

## Need Help?

Check:
- `README.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - Detailed implementation status
- GitHub issues - Report bugs or request features

---

Enjoy building! 🚀
