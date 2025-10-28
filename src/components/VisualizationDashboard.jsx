import Plot from 'react-plotly.js'

function VisualizationDashboard({ plots, config, onGeneratePlots }) {
  if (!plots) {
    return (
      <div className="card">
        <div className="no-plots">
          <h3>No Visualizations Available</h3>
          <p>Generate plots to see visualizations here.</p>
          <button
            className="btn btn-primary"
            onClick={onGeneratePlots}
          >
            📈 Generate Plots
          </button>
        </div>
      </div>
    )
  }

  const parsePlotData = (plotJson) => {
    try {
      return JSON.parse(plotJson)
    } catch (error) {
      console.error('Failed to parse plot data:', error)
      return null
    }
  }

  return (
    <div className="visualization-dashboard">
      <div className="card">
        <h2>Analysis Visualizations - {config?.scenario_name}</h2>
        <p>Interactive charts showing the structural response and safety analysis.</p>
      </div>

      <div className="grid grid-1">
        {/* Force-Deflection Curve */}
        {plots.force_deflection && (
          <div className="card plot-card">
            <h3>Force-Deflection Curve</h3>
            <Plot
              data={parsePlotData(plots.force_deflection)?.data || []}
              layout={{
                ...parsePlotData(plots.force_deflection)?.layout,
                height: 400,
                margin: { t: 40, r: 40, b: 60, l: 60 }
              }}
              config={{
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
              }}
              style={{ width: '100%' }}
            />
            <div className="plot-description">
              Shows the nonlinear relationship between applied force and net deflection.
            </div>
          </div>
        )}

        {/* Safety Factor Analysis */}
        {plots.safety_factor && (
          <div className="card plot-card">
            <h3>Safety Factor Analysis</h3>
            <Plot
              data={parsePlotData(plots.safety_factor)?.data || []}
              layout={{
                ...parsePlotData(plots.safety_factor)?.layout,
                height: 400,
                margin: { t: 40, r: 40, b: 60, l: 60 }
              }}
              config={{
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
              }}
              style={{ width: '100%' }}
            />
            <div className="plot-description">
              Compares calculated safety factor against minimum requirements.
            </div>
          </div>
        )}

        {/* Stress Distribution */}
        {plots.stress_distribution && (
          <div className="card plot-card">
            <h3>Stress Distribution</h3>
            <Plot
              data={parsePlotData(plots.stress_distribution)?.data || []}
              layout={{
                ...parsePlotData(plots.stress_distribution)?.layout,
                height: 400,
                margin: { t: 40, r: 40, b: 60, l: 60 }
              }}
              config={{
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
              }}
              style={{ width: '100%' }}
            />
            <div className="plot-description">
              Shows stress distribution across net strands under impact loading.
            </div>
          </div>
        )}

        {/* Deflection vs Time */}
        {plots.deflection_time && (
          <div className="card plot-card">
            <h3>Deflection vs Time</h3>
            <Plot
              data={parsePlotData(plots.deflection_time)?.data || []}
              layout={{
                ...parsePlotData(plots.deflection_time)?.layout,
                height: 400,
                margin: { t: 40, r: 40, b: 60, l: 60 }
              }}
              config={{
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
              }}
              style={{ width: '100%' }}
            />
            <div className="plot-description">
              Dynamic response showing deflection over time after impact.
            </div>
          </div>
        )}
      </div>

      {/* Additional Analysis Information */}
      <div className="card">
        <h3>Visualization Controls</h3>
        <div className="controls-grid">
          <div className="control-item">
            <strong>Zoom:</strong> Use mouse wheel or drag to zoom
          </div>
          <div className="control-item">
            <strong>Pan:</strong> Click and drag to pan around the plot
          </div>
          <div className="control-item">
            <strong>Reset:</strong> Double-click to reset the view
          </div>
          <div className="control-item">
            <strong>Download:</strong> Use camera icon to save as PNG
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            onClick={onGeneratePlots}
          >
            🔄 Regenerate Plots
          </button>
        </div>
      </div>

      <style jsx>{`
        .visualization-dashboard {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .plot-card {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .plot-card h3 {
          margin-bottom: 15px;
          color: #2c3e50;
        }

        .plot-description {
          margin-top: 15px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 0.9em;
          color: #6c757d;
        }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .control-item {
          padding: 12px;
          background: #e7f3ff;
          border-radius: 6px;
          font-size: 0.9em;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .no-plots {
          text-align: center;
          padding: 40px;
          color: #6c757d;
        }

        .no-plots h3 {
          margin-bottom: 15px;
        }

        @media (max-width: 768px) {
          .controls-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-buttons .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

export default VisualizationDashboard