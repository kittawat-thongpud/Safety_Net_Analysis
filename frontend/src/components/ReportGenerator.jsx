import React from 'react'

function ReportGenerator({ config, results, onGenerateReport }) {
  return (
    <div className="report-generator">
      <div className="card">
        <h2>Report Generation</h2>
        <p>Generate comprehensive HTML reports with analysis results and visualizations.</p>

        <div className="report-preview">
          <div className="preview-header">
            <h3>Report Preview</h3>
            <div className="report-status">
              {config && results ? (
                <span className="status-ready">Ready to Generate</span>
              ) : (
                <span className="status-pending">Configuration Required</span>
              )}
            </div>
          </div>

          <div className="preview-content">
            {config && results ? (
              <div className="report-summary">
                <h4>Report Contents:</h4>
                <ul>
                  <li>✓ Executive Summary with Safety Status</li>
                  <li>✓ Detailed Configuration Parameters</li>
                  <li>✓ Structural Response Analysis</li>
                  <li>✓ Design Verification Results</li>
                  <li>✓ Interactive Visualizations</li>
                  <li>✓ Engineering Recommendations</li>
                </ul>

                <div className="report-details">
                  <div className="detail-item">
                    <strong>Scenario:</strong> {config.scenario_name}
                  </div>
                  <div className="detail-item">
                    <strong>Material:</strong> {config.material.name}
                  </div>
                  <div className="detail-item">
                    <strong>Safety Factor:</strong> {results.structural_response.safety_factor.toFixed(2)}
                  </div>
                  <div className="detail-item">
                    <strong>Overall Safe:</strong>
                    <span className={results.design_checks.overall_safe ? 'status-safe' : 'status-danger'}>
                      {results.design_checks.overall_safe ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data">
                <p>Please configure and run the analysis first to generate a report.</p>
                <div className="requirements">
                  <h5>Requirements:</h5>
                  <ul>
                    <li>Complete configuration setup</li>
                    <li>Successful analysis execution</li>
                    <li>Available analysis results</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="report-actions">
          <button
            className="btn btn-success"
            onClick={onGenerateReport}
            disabled={!config || !results}
          >
            📋 Generate HTML Report
          </button>

          <div className="action-info">
            <p><strong>Format:</strong> Interactive HTML with embedded charts</p>
            <p><strong>Features:</strong> Professional layout, interactive plots, downloadable</p>
            <p><strong>Usage:</strong> Share with stakeholders, archive for records</p>
          </div>
        </div>
      </div>

      {/* Report Features */}
      <div className="grid grid-3">
        <div className="card feature-card">
          <div className="feature-icon">📊</div>
          <h4>Comprehensive Analysis</h4>
          <p>Detailed breakdown of structural response, safety factors, and design verification.</p>
        </div>

        <div className="card feature-card">
          <div className="feature-icon">📈</div>
          <h4>Interactive Visualizations</h4>
          <p>Embedded Plotly charts for force-deflection curves, stress distribution, and more.</p>
        </div>

        <div className="card feature-card">
          <div className="feature-icon">🔧</div>
          <h4>Engineering Recommendations</h4>
          <p>Actionable insights and improvement suggestions based on analysis results.</p>
        </div>
      </div>

      <style jsx>{`
        .report-generator {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .report-preview {
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 0;
          margin: 20px 0;
          overflow: hidden;
        }

        .preview-header {
          background: #f8f9fa;
          padding: 15px 20px;
          border-bottom: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .preview-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .report-status {
          font-weight: 600;
        }

        .status-ready {
          color: #28a745;
        }

        .status-pending {
          color: #6c757d;
        }

        .preview-content {
          padding: 20px;
        }

        .report-summary h4 {
          margin-bottom: 15px;
          color: #2c3e50;
        }

        .report-summary ul {
          margin: 15px 0;
          padding-left: 20px;
        }

        .report-summary li {
          margin-bottom: 8px;
          color: #495057;
        }

        .report-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .detail-item {
          font-size: 0.9em;
        }

        .no-data {
          text-align: center;
          padding: 30px;
          color: #6c757d;
        }

        .requirements {
          margin-top: 20px;
          text-align: left;
        }

        .requirements h5 {
          margin-bottom: 10px;
          color: #495057;
        }

        .requirements ul {
          padding-left: 20px;
        }

        .report-actions {
          display: flex;
          gap: 30px;
          align-items: flex-start;
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }

        .action-info {
          flex: 1;
        }

        .action-info p {
          margin: 5px 0;
          font-size: 0.9em;
          color: #6c757d;
        }

        .feature-card {
          text-align: center;
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 2.5em;
          margin-bottom: 15px;
        }

        .feature-card h4 {
          margin-bottom: 10px;
          color: #2c3e50;
        }

        .feature-card p {
          color: #6c757d;
          font-size: 0.9em;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .report-actions {
            flex-direction: column;
            gap: 20px;
          }

          .report-details {
            grid-template-columns: 1fr;
          }

          .preview-header {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  )
}

export default ReportGenerator