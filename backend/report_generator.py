import json
from datetime import datetime
from typing import Dict, Any
import jinja2

class ReportGenerator:
    """
    HTML report generator for safety net analysis
    """

    def __init__(self):
        self.template_env = jinja2.Environment(
            loader=jinja2.BaseLoader(),
            autoescape=jinja2.select_autoescape(['html', 'xml'])
        )

    def generate_html_report(self, report_data: Dict[str, Any]) -> str:
        """Generate complete HTML report"""

        html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Safety Net Analysis Report - {{ scenario_name }}</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }

        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
            margin-top: 10px;
        }

        .section {
            background: white;
            padding: 25px;
            margin-bottom: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .section h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-top: 0;
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
        }

        .summary-card.safe {
            border-left-color: #27ae60;
        }

        .summary-card.warning {
            border-left-color: #f39c12;
        }

        .summary-card.danger {
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

        .parameter-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .parameter-table th,
        .parameter-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        .parameter-table th {
            background-color: #f8f9fa;
            font-weight: 600;
        }

        .plot-container {
            margin: 30px 0;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            background: white;
        }

        .plot-title {
            text-align: center;
            font-weight: 600;
            margin-bottom: 15px;
            color: #2c3e50;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-safe {
            background-color: #d4edda;
            color: #155724;
        }

        .status-warning {
            background-color: #fff3cd;
            color: #856404;
        }

        .status-danger {
            background-color: #f8d7da;
            color: #721c24;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #6c757d;
            font-size: 0.9em;
            border-top: 1px solid #dee2e6;
        }

        @media (max-width: 768px) {
            body {
                padding: 10px;
            }

            .header h1 {
                font-size: 2em;
            }

            .summary-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Safety Net Analysis Report</h1>
        <div class="subtitle">
            Scenario: {{ scenario_name }} | Generated: {{ timestamp }}
        </div>
    </div>

    <!-- Executive Summary -->
    <div class="section">
        <h2>Executive Summary</h2>
        <div class="summary-grid">
            <div class="summary-card {{ 'safe' if results.design_checks.overall_safe else 'danger' }}">
                <h3>Overall Safety Status</h3>
                <div class="value">
                    {% if results.design_checks.overall_safe %}
                    <span class="status-badge status-safe">SAFE</span>
                    {% else %}
                    <span class="status-badge status-danger">UNSAFE</span>
                    {% endif %}
                </div>
                <p>All design criteria met: {{ results.design_checks.overall_safe }}</p>
            </div>

            <div class="summary-card">
                <h3>Safety Factor</h3>
                <div class="value">{{ "%.2f"|format(results.structural_response.safety_factor) }}</div>
                <p>Required: {{ "%.1f"|format(results.design_limits.min_safety_factor) }}</p>
            </div>

            <div class="summary-card">
                <h3>Maximum Deflection</h3>
                <div class="value">{{ "%.3f"|format(results.structural_response.max_deflection) }} m</div>
                <p>Limit: {{ "%.3f"|format(results.design_limits.max_deflection_limit) }} m</p>
            </div>

            <div class="summary-card">
                <h3>Maximum Stress</h3>
                <div class="value">{{ "%.1f"|format(results.structural_response.max_stress / 1e6) }} MPa</div>
                <p>Material: {{ configuration.material.name }}</p>
            </div>
        </div>
    </div>

    <!-- Configuration Details -->
    <div class="section">
        <h2>Configuration Details</h2>

        <h3>Material Properties</h3>
        <table class="parameter-table">
            <tr>
                <th>Property</th>
                <th>Value</th>
                <th>Unit</th>
            </tr>
            <tr>
                <td>Material Name</td>
                <td>{{ configuration.material.name }}</td>
                <td>-</td>
            </tr>
            <tr>
                <td>Elastic Modulus</td>
                <td>{{ "%.2e"|format(configuration.material.elastic_modulus) }}</td>
                <td>Pa</td>
            </tr>
            <tr>
                <td>Yield Strength</td>
                <td>{{ "%.2e"|format(configuration.material.yield_strength) }}</td>
                <td>Pa</td>
            </tr>
            <tr>
                <td>Density</td>
                <td>{{ configuration.material.density }}</td>
                <td>kg/m³</td>
            </tr>
            <tr>
                <td>Cross-section Area</td>
                <td>{{ "%.2e"|format(configuration.material.cross_section_area) }}</td>
                <td>m²</td>
            </tr>
        </table>

        <h3>Geometric Parameters</h3>
        <table class="parameter-table">
            <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Unit</th>
            </tr>
            <tr>
                <td>Net Span</td>
                <td>{{ configuration.geometry.net_span }}</td>
                <td>m</td>
            </tr>
            <tr>
                <td>Number of Strands</td>
                <td>{{ configuration.geometry.num_strands }}</td>
                <td>-</td>
            </tr>
            <tr>
                <td>Minimum Safety Factor</td>
                <td>{{ configuration.geometry.safety_factor_min }}</td>
                <td>-</td>
            </tr>
            <tr>
                <td>Max Deflection Ratio</td>
                <td>{{ configuration.geometry.max_deflection_ratio * 100 }}%</td>
                <td>-</td>
            </tr>
        </table>

        <h3>Impact Scenario</h3>
        <table class="parameter-table">
            <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Unit</th>
            </tr>
            <tr>
                <td>Impact Mass</td>
                <td>{{ configuration.impact.mass }}</td>
                <td>kg</td>
            </tr>
            <tr>
                <td>Fall Height</td>
                <td>{{ configuration.impact.fall_height }}</td>
                <td>m</td>
            </tr>
            <tr>
                <td>Impact Velocity</td>
                <td>{{ "%.2f"|format(configuration.impact.impact_velocity) }}</td>
                <td>m/s</td>
            </tr>
        </table>
    </div>

    <!-- Analysis Results -->
    <div class="section">
        <h2>Analysis Results</h2>

        <h3>Structural Response</h3>
        <table class="parameter-table">
            <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Status</th>
                <th>Limit</th>
            </tr>
            <tr>
                <td>Maximum Deflection</td>
                <td>{{ "%.3f"|format(results.structural_response.max_deflection) }} m</td>
                <td>
                    {% if results.design_checks.deflection_ok %}
                    <span class="status-badge status-safe">OK</span>
                    {% else %}
                    <span class="status-badge status-danger">EXCEEDED</span>
                    {% endif %}
                </td>
                <td>{{ "%.3f"|format(results.design_limits.max_deflection_limit) }} m</td>
            </tr>
            <tr>
                <td>Maximum Stress</td>
                <td>{{ "%.1f"|format(results.structural_response.max_stress / 1e6) }} MPa</td>
                <td>-</td>
                <td>{{ "%.1f"|format(configuration.material.yield_strength / 1e6) }} MPa</td>
            </tr>
            <tr>
                <td>Safety Factor</td>
                <td>{{ "%.2f"|format(results.structural_response.safety_factor) }}</td>
                <td>
                    {% if results.design_checks.stress_ok %}
                    <span class="status-badge status-safe">OK</span>
                    {% else %}
                    <span class="status-badge status-danger">INSUFFICIENT</span>
                    {% endif %}
                </td>
                <td>{{ configuration.geometry.safety_factor_min }}</td>
            </tr>
            <tr>
                <td>Strain</td>
                <td>{{ "%.3f"|format(results.structural_response.strain) }}</td>
                <td>
                    {% if results.design_checks.strain_ok %}
                    <span class="status-badge status-safe">OK</span>
                    {% else %}
                    <span class="status-badge status-danger">EXCEEDED</span>
                    {% endif %}
                </td>
                <td>{{ configuration.material.strain_limit }}</td>
            </tr>
        </table>

        <h3>Design Verification</h3>
        <table class="parameter-table">
            <tr>
                <th>Criterion</th>
                <th>Status</th>
                <th>Requirement</th>
            </tr>
            <tr>
                <td>Deflection Limit</td>
                <td>
                    {% if results.design_checks.deflection_ok %}
                    <span class="status-badge status-safe">PASS</span>
                    {% else %}
                    <span class="status-badge status-danger">FAIL</span>
                    {% endif %}
                </td>
                <td>δ ≤ {{ configuration.geometry.max_deflection_ratio * 100 }}% of span</td>
            </tr>
            <tr>
                <td>Safety Factor</td>
                <td>
                    {% if results.design_checks.stress_ok %}
                    <span class="status-badge status-safe">PASS</span>
                    {% else %}
                    <span class="status-badge status-danger">FAIL</span>
                    {% endif %}
                </td>
                <td>SF ≥ {{ configuration.geometry.safety_factor_min }}</td>
            </tr>
            <tr>
                <td>Strain Limit</td>
                <td>
                    {% if results.design_checks.strain_ok %}
                    <span class="status-badge status-safe">PASS</span>
                    {% else %}
                    <span class="status-badge status-danger">FAIL</span>
                    {% endif %}
                </td>
                <td>ε ≤ {{ configuration.material.strain_limit }}</td>
            </tr>
        </table>
    </div>

    <!-- Visualizations -->
    <div class="section">
        <h2>Visualizations</h2>

        {% if plots.force_deflection %}
        <div class="plot-container">
            <div class="plot-title">Force-Deflection Curve</div>
            <div id="force-deflection-plot"></div>
        </div>
        {% endif %}

        {% if plots.safety_factor %}
        <div class="plot-container">
            <div class="plot-title">Safety Factor Analysis</div>
            <div id="safety-factor-plot"></div>
        </div>
        {% endif %}

        {% if plots.stress_distribution %}
        <div class="plot-container">
            <div class="plot-title">Stress Distribution</div>
            <div id="stress-distribution-plot"></div>
        </div>
        {% endif %}

        {% if plots.deflection_time %}
        <div class="plot-container">
            <div class="plot-title">Deflection vs Time</div>
            <div id="deflection-time-plot"></div>
        </div>
        {% endif %}
    </div>

    <!-- Recommendations -->
    <div class="section">
        <h2>Recommendations</h2>
        {% if results.design_checks.overall_safe %}
        <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 5px;">
            <strong>✓ Design is Safe:</strong> The safety net configuration meets all design criteria.
            No modifications are required for the specified impact scenario.
        </div>
        {% else %}
        <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px;">
            <strong>⚠ Design Requires Improvement:</strong> The following issues were identified:
            <ul>
                {% if not results.design_checks.deflection_ok %}
                <li>Maximum deflection exceeds the allowable limit</li>
                {% endif %}
                {% if not results.design_checks.stress_ok %}
                <li>Safety factor is below the minimum requirement</li>
                {% endif %}
                {% if not results.design_checks.strain_ok %}
                <li>Material strain exceeds the limit</li>
                {% endif %}
            </ul>
            <p><strong>Suggested Actions:</strong></p>
            <ul>
                <li>Consider using a stronger material</li>
                <li>Increase the number of load-bearing strands</li>
                <li>Reduce the net span distance</li>
                <li>Review impact scenario parameters</li>
            </ul>
        </div>
        {% endif %}
    </div>

    <div class="footer">
        <p>Generated by Safety Net Analysis System | {{ timestamp }}</p>
        <p>This report is for engineering analysis purposes only.</p>
    </div>

    <!-- Plotly Scripts -->
    <script>
        {% if plots.force_deflection %}
        Plotly.newPlot('force-deflection-plot', {{ plots.force_deflection | safe }}.data, {{ plots.force_deflection | safe }}.layout);
        {% endif %}

        {% if plots.safety_factor %}
        Plotly.newPlot('safety-factor-plot', {{ plots.safety_factor | safe }}.data, {{ plots.safety_factor | safe }}.layout);
        {% endif %}

        {% if plots.stress_distribution %}
        Plotly.newPlot('stress-distribution-plot', {{ plots.stress_distribution | safe }}.data, {{ plots.stress_distribution | safe }}.layout);
        {% endif %}

        {% if plots.deflection_time %}
        Plotly.newPlot('deflection-time-plot', {{ plots.deflection_time | safe }}.data, {{ plots.deflection_time | safe }}.layout);
        {% endif %}
    </script>
</body>
</html>
        """

        template = self.template_env.from_string(html_template)
        return template.render(**report_data)

    def save_report(self, report_data: Dict[str, Any], filepath: str):
        """Generate and save HTML report to file"""
        html_content = self.generate_html_report(report_data)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)