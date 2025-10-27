import React from 'react'

function AnalysisResults({ results, config }) {
  if (!results) {
    return (
      <div className="card">
        <div className="no-results">
          <h3>No Analysis Results Available</h3>
          <p>Run the analysis first to see results here.</p>
        </div>
      </div>
    )
  }

  const { structural_response, design_checks, design_limits } = results

  const getStatusClass = (check) => {
    return check ? 'status-safe' : 'status-danger'
  }

  const getStatusText = (check) => {
    return check ? 'PASS' : 'FAIL'
  }

  return (
    <div className="analysis-results">
      {/* Executive Summary */}
      <div className="card">
        <h2>Analysis Summary - {results.scenario_name}</h2>

        <div className="summary-grid">
          <div className={`summary-card ${getStatusClass(design_checks.overall_safe)}`}>
            <h3>Overall Safety Status</h3>
            <div className="value">
              <span className={`status-badge ${getStatusClass(design_checks.overall_safe)}`}>
                {getStatusText(design_checks.overall_safe)}
              </span>
            </div>
            <p>All design criteria met: {design_checks.overall_safe ? 'Yes' : 'No'}</p>
          </div>

          <div className="summary-card">
            <h3>Safety Factor</h3>
            <div className="value">{structural_response.safety_factor.toFixed(2)}</div>
            <p>Required: {design_limits.min_safety_factor}</p>
            <div className={`status ${getStatusClass(design_checks.stress_ok)}`}>
              {getStatusText(design_checks.stress_ok)}
            </div>
          </div>

          <div className="summary-card">
            <h3>Maximum Deflection</h3>
            <div className="value">{structural_response.max_deflection.toFixed(3)} m</div>
            <p>Limit: {design_limits.max_deflection_limit.toFixed(3)} m</p>
            <div className={`status ${getStatusClass(design_checks.deflection_ok)}`}>
              {getStatusText(design_checks.deflection_ok)}
            </div>
          </div>

          <div className="summary-card">
            <h3>Maximum Stress</h3>
            <div className="value">{(structural_response.max_stress / 1e6).toFixed(1)} MPa</div>
            <p>Material: {config?.material?.name}</p>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="grid grid-2">
        {/* Structural Response */}
        <div className="card">
          <h3>Structural Response</h3>
          <table className="results-table">
            <tbody>
              <tr>
                <td>Maximum Deflection</td>
                <td>{structural_response.max_deflection.toFixed(4)} m</td>
              </tr>
              <tr>
                <td>Maximum Stress</td>
                <td>{(structural_response.max_stress / 1e6).toFixed(2)} MPa</td>
              </tr>
              <tr>
                <td>Safety Factor</td>
                <td>{structural_response.safety_factor.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Strain</td>
                <td>{structural_response.strain.toFixed(4)}</td>
              </tr>
              <tr>
                <td>Impact Velocity</td>
                <td>{config?.impact?.impact_velocity?.toFixed(2) || 'N/A'} m/s</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Design Verification */}
        <div className="card">
          <h3>Design Verification</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Criterion</th>
                <th>Status</th>
                <th>Value vs Limit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Deflection Limit</td>
                <td>
                  <span className={`status-badge ${getStatusClass(design_checks.deflection_ok)}`}>
                    {getStatusText(design_checks.deflection_ok)}
                  </span>
                </td>
                <td>
                  {structural_response.max_deflection.toFixed(3)} m / {design_limits.max_deflection_limit.toFixed(3)} m
                </td>
              </tr>
              <tr>
                <td>Safety Factor</td>
                <td>
                  <span className={`status-badge ${getStatusClass(design_checks.stress_ok)}`}>
                    {getStatusText(design_checks.stress_ok)}
                  </span>
                </td>
                <td>
                  {structural_response.safety_factor.toFixed(2)} / {design_limits.min_safety_factor}
                </td>
              </tr>
              <tr>
                <td>Strain Limit</td>
                <td>
                  <span className={`status-badge ${getStatusClass(design_checks.strain_ok)}`}>
                    {getStatusText(design_checks.strain_ok)}
                  </span>
                </td>
                <td>
                  {structural_response.strain.toFixed(4)} / {design_limits.max_strain_limit}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3>Recommendations</h3>
        {design_checks.overall_safe ? (
          <div className="recommendation safe">
            <strong>✓ Design is Safe:</strong> The safety net configuration meets all design criteria.
            No modifications are required for the specified impact scenario.
          </div>
        ) : (
          <div className="recommendation warning">
            <strong>⚠ Design Requires Improvement:</strong> The following issues were identified:
            <ul>
              {!design_checks.deflection_ok && (
                <li>Maximum deflection exceeds the allowable limit</li>
              )}
              {!design_checks.stress_ok && (
                <li>Safety factor is below the minimum requirement</li>
              )}
              {!design_checks.strain_ok && (
                <li>Material strain exceeds the limit</li>
              )}
            </ul>
            <p><strong>Suggested Actions:</strong></p>
            <ul>
              <li>Consider using a stronger material</li>
              <li>Increase the number of load-bearing strands</li>
              <li>Reduce the net span distance</li>
              <li>Review impact scenario parameters</li>
            </ul>
          </div>
        )}
      </div>

      <style jsx>{`
        .analysis-results {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }

        .summary-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3498db;
          text-align: center;
        }

        .summary-card .status-safe {
          border-left-color: #27ae60;
        }

        .summary-card .status-danger {
          border-left-color: #e74c3c;
        }

        .summary-card h3 {
          margin: 0 0 10px 0;
          font-size: 1.1em;
          color: #2c3e50;
        }

        .summary-card .value {
          font-size: 1.8em;
          font-weight: bold;
          margin: 5px 0;
        }

        .summary-card .status {
          font-size: 0.9em;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 5px;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }

        .results-table th,
        .results-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .results-table th {
          background-color: #f8f9fa;
          font-weight: 600;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.status-safe {
          background-color: #d4edda;
          color: #155724;
        }

        .status-badge.status-danger {
          background-color: #f8d7da;
          color: #721c24;
        }

        .recommendation {
          padding: 15px;
          border-radius: 6px;
          margin: 10px 0;
        }

        .recommendation.safe {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .recommendation.warning {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .recommendation ul {
          margin: 10px 0;
          padding-left: 20px;
        }

        .no-results {
          text-align: center;
          padding: 40px;
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }

          .results-table {
            font-size: 0.9em;
          }
        }
      `}</style>
    </div>
  )
}

export default AnalysisResults