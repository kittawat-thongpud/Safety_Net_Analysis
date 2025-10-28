import React, { useState, useEffect } from 'react'
import ConfigurationForm from './components/ConfigurationForm'
import AnalysisResults from './components/AnalysisResults'
import VisualizationDashboard from './components/VisualizationDashboard'
import ReportGenerator from './components/ReportGenerator'
import Header from './components/Header'
import { SafetyNetAnalyzer } from './utils/safetyNetAnalyzer'
import './styles/App.css'

function App() {
  const [currentConfig, setCurrentConfig] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [plots, setPlots] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('configuration')
  const [presets, setPresets] = useState({})
  const [materials, setMaterials] = useState({})

  useEffect(() => {
    // Load presets and materials on app start
    loadInitialData()

    // Initialize with default custom configuration
    const defaultConfig = {
      scenario_name: "Custom Scenario",
      material: {
        name: "Custom Material",
        elastic_modulus: 3.5e9,
        yield_strength: 8.0e7,
        density: 1150,
        cross_section_area: 2.0e-6,
        strain_limit: 0.1
      },
      geometry: {
        net_span: 4.0,
        num_strands: 50,
        installation_angle: 0.0,
        safety_factor_min: 2.0,
        max_deflection_ratio: 0.15
      },
      impact: {
        mass: 100.0,
        fall_height: 3.0,
        impact_velocity: Math.sqrt(2 * 9.81 * 3.0)
      },
      analysis: {
        analysis_type: "impact",
        max_iterations: 100,
        convergence_tolerance: 1e-6,
        include_damping: false,
        damping_ratio: 0.05
      }
    }
    setCurrentConfig(defaultConfig)
  }, [])

  const loadInitialData = async () => {
    try {
      // Load presets and materials from local data
      const presetsData = {
        'light_construction': {
          scenario_name: "Light Construction",
          material: {
            name: "Nylon",
            elastic_modulus: 3.5e9,
            yield_strength: 8.0e7,
            density: 1150,
            cross_section_area: 2.0e-6,
            strain_limit: 0.1
          },
          geometry: {
            net_span: 3.0,
            num_strands: 40,
            installation_angle: 0.0,
            safety_factor_min: 2.5,
            max_deflection_ratio: 0.15
          },
          impact: {
            mass: 70.0,
            fall_height: 2.0,
            impact_velocity: Math.sqrt(2 * 9.81 * 2.0)
          },
          analysis: {
            analysis_type: "impact",
            max_iterations: 100,
            convergence_tolerance: 1e-6,
            include_damping: false,
            damping_ratio: 0.05
          }
        },
        'heavy_equipment': {
          scenario_name: "Heavy Equipment",
          material: {
            name: "Polyester",
            elastic_modulus: 5.0e9,
            yield_strength: 1.2e8,
            density: 1380,
            cross_section_area: 3.0e-6,
            strain_limit: 0.08
          },
          geometry: {
            net_span: 5.0,
            num_strands: 60,
            installation_angle: 0.0,
            safety_factor_min: 3.0,
            max_deflection_ratio: 0.12
          },
          impact: {
            mass: 200.0,
            fall_height: 4.0,
            impact_velocity: Math.sqrt(2 * 9.81 * 4.0)
          },
          analysis: {
            analysis_type: "impact",
            max_iterations: 100,
            convergence_tolerance: 1e-6,
            include_damping: false,
            damping_ratio: 0.05
          }
        }
      }

      const materialsData = {
        'nylon': {
          name: "Nylon",
          elastic_modulus: 3.5e9,
          yield_strength: 8.0e7,
          density: 1150,
          cross_section_area: 2.0e-6,
          strain_limit: 0.1
        },
        'polyester': {
          name: "Polyester",
          elastic_modulus: 5.0e9,
          yield_strength: 1.2e8,
          density: 1380,
          cross_section_area: 3.0e-6,
          strain_limit: 0.08
        },
        'polypropylene': {
          name: "Polypropylene",
          elastic_modulus: 1.5e9,
          yield_strength: 3.5e7,
          density: 900,
          cross_section_area: 2.5e-6,
          strain_limit: 0.15
        }
      }

      setPresets(presetsData)
      setMaterials(materialsData)
    } catch (error) {
      console.error('Failed to load initial data:', error)
    }
  }

  const handleConfigUpdate = (config) => {
    setCurrentConfig(config)
  }

  const handleLoadPreset = async (presetName) => {
    // If no preset is selected (empty string), treat it as custom configuration
    if (!presetName) {
      presetName = 'custom'
    }

    try {
      setLoading(true)

      if (presetName === 'custom') {
        // Reset to default custom configuration
        const defaultConfig = {
          scenario_name: "Custom Scenario",
          material: {
            name: "Custom Material",
            elastic_modulus: 3.5e9,
            yield_strength: 8.0e7,
            density: 1150,
            cross_section_area: 2.0e-6,
            strain_limit: 0.1
          },
          geometry: {
            net_span: 4.0,
            num_strands: 50,
            installation_angle: 0.0,
            safety_factor_min: 2.0,
            max_deflection_ratio: 0.15
          },
          impact: {
            mass: 100.0,
            fall_height: 3.0,
            impact_velocity: Math.sqrt(2 * 9.81 * 3.0)
          },
          analysis: {
            analysis_type: "impact",
            max_iterations: 100,
            convergence_tolerance: 1e-6,
            include_damping: false,
            damping_ratio: 0.05
          }
        }
        setCurrentConfig(defaultConfig)
      } else {
        // Load preset from local data
        if (presets[presetName]) {
          setCurrentConfig(presets[presetName])
        } else {
          alert('Preset not found')
        }
      }

      setAnalysisResults(null)
      setPlots(null)
    } catch (error) {
      console.error('Failed to load preset:', error)
      alert('Failed to load preset configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleRunAnalysis = async () => {
    if (!currentConfig) {
      alert('Please configure the analysis first')
      return
    }

    try {
      setLoading(true)
      const analyzer = new SafetyNetAnalyzer(currentConfig)
      const results = analyzer.analyze()
      setAnalysisResults(results)
      setActiveTab('results')
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePlots = async () => {
    if (!currentConfig) {
      alert('Please configure the analysis first')
      return
    }

    try {
      setLoading(true)
      const analyzer = new SafetyNetAnalyzer(currentConfig)
      if (!analysisResults) {
        analyzer.analyze()
      }
      const plots = analyzer.generatePlots()
      setPlots(plots)
      setActiveTab('visualization')
    } catch (error) {
      console.error('Plot generation failed:', error)
      alert('Failed to generate plots')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!currentConfig) {
      alert('Please configure the analysis first')
      return
    }

    try {
      setLoading(true)
      const analyzer = new SafetyNetAnalyzer(currentConfig)
      const reportData = analyzer.generateReportData()

      // Generate HTML report
      const htmlReport = this.generateHTMLReport(reportData)

      // Create download link
      const blob = new Blob([htmlReport], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `safety_net_report_${new Date().toISOString().slice(0, 10)}.html`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Report generation failed:', error)
      alert('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const generateHTMLReport = (reportData) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Safety Net Analysis Report - ${reportData.scenario_name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .result-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .safe { background-color: #d4edda; border-color: #c3e6cb; }
        .unsafe { background-color: #f8d7da; border-color: #f5c6cb; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Safety Net Analysis Report</h1>
        <h2>${reportData.scenario_name}</h2>
        <p><strong>Generated:</strong> ${reportData.timestamp}</p>
    </div>

    <div class="section">
        <h3>Configuration Summary</h3>
        <table>
            <tr><th>Parameter</th><th>Value</th></tr>
            <tr><td>Material</td><td>${reportData.configuration.material.name}</td></tr>
            <tr><td>Net Span</td><td>${reportData.configuration.geometry.net_span} m</td></tr>
            <tr><td>Number of Strands</td><td>${reportData.configuration.geometry.num_strands}</td></tr>
            <tr><td>Impact Mass</td><td>${reportData.configuration.impact.mass} kg</td></tr>
            <tr><td>Fall Height</td><td>${reportData.configuration.impact.fall_height} m</td></tr>
        </table>
    </div>

    <div class="section">
        <h3>Analysis Results</h3>
        <div class="results-grid">
            <div class="result-card ${reportData.results.design_checks.overall_safe ? 'safe' : 'unsafe'}">
                <h4>Overall Safety Status</h4>
                <p><strong>${reportData.results.design_checks.overall_safe ? 'SAFE' : 'UNSAFE'}</strong></p>
            </div>
            <div class="result-card">
                <h4>Maximum Deflection</h4>
                <p>${reportData.results.structural_response.max_deflection.toFixed(4)} m</p>
                <p>Limit: ${reportData.results.design_limits.max_deflection_limit.toFixed(4)} m</p>
                <p><strong>${reportData.results.design_checks.deflection_ok ? '✓ OK' : '✗ EXCEEDED'}</strong></p>
            </div>
            <div class="result-card">
                <h4>Safety Factor</h4>
                <p>${reportData.results.structural_response.safety_factor.toFixed(2)}</p>
                <p>Minimum Required: ${reportData.results.design_limits.min_safety_factor}</p>
                <p><strong>${reportData.results.design_checks.stress_ok ? '✓ OK' : '✗ INSUFFICIENT'}</strong></p>
            </div>
            <div class="result-card">
                <h4>Maximum Stress</h4>
                <p>${(reportData.results.structural_response.max_stress / 1e6).toFixed(2)} MPa</p>
                <p>Yield Strength: ${(reportData.configuration.material.yield_strength / 1e6).toFixed(2)} MPa</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h3>Design Checks</h3>
        <table>
            <tr><th>Check</th><th>Status</th><th>Value</th><th>Limit</th></tr>
            <tr>
                <td>Deflection</td>
                <td>${reportData.results.design_checks.deflection_ok ? '✓ PASS' : '✗ FAIL'}</td>
                <td>${reportData.results.structural_response.max_deflection.toFixed(4)} m</td>
                <td>${reportData.results.design_limits.max_deflection_limit.toFixed(4)} m</td>
            </tr>
            <tr>
                <td>Safety Factor</td>
                <td>${reportData.results.design_checks.stress_ok ? '✓ PASS' : '✗ FAIL'}</td>
                <td>${reportData.results.structural_response.safety_factor.toFixed(2)}</td>
                <td>${reportData.results.design_limits.min_safety_factor}</td>
            </tr>
            <tr>
                <td>Strain</td>
                <td>${reportData.results.design_checks.strain_ok ? '✓ PASS' : '✗ FAIL'}</td>
                <td>${(reportData.results.structural_response.strain * 100).toFixed(2)}%</td>
                <td>${(reportData.results.design_limits.max_strain_limit * 100).toFixed(2)}%</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h3>Recommendations</h3>
        <ul>
            ${!reportData.results.design_checks.overall_safe ?
                '<li>Review and adjust net configuration parameters</li>' :
                '<li>Current configuration meets all safety requirements</li>'
            }
            ${!reportData.results.design_checks.deflection_ok ?
                '<li>Consider increasing net span or reducing impact energy</li>' : ''
            }
            ${!reportData.results.design_checks.stress_ok ?
                '<li>Consider using stronger material or increasing number of strands</li>' : ''
            }
            ${!reportData.results.design_checks.strain_ok ?
                '<li>Consider material with higher strain limit</li>' : ''
            }
        </ul>
    </div>
</body>
</html>`
  }

  const tabs = [
    { id: 'configuration', label: 'Configuration', icon: '⚙️' },
    { id: 'results', label: 'Results', icon: '📊' },
    { id: 'visualization', label: 'Visualization', icon: '📈' },
    { id: 'report', label: 'Report', icon: '📋' }
  ]

  return (
    <div className="app">
      <Header />

      <div className="container">
        {/* Navigation Tabs */}
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="action-bar">
          <button
            className="btn btn-primary"
            onClick={handleRunAnalysis}
            disabled={loading || !currentConfig}
          >
            {loading ? <div className="loading"></div> : '🚀'}
            Run Analysis
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleGeneratePlots}
            disabled={loading || !currentConfig}
          >
            📈 Generate Plots
          </button>

          <button
            className="btn btn-success"
            onClick={handleGenerateReport}
            disabled={loading || !currentConfig}
          >
            📋 Generate Report
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'configuration' && (
            <ConfigurationForm
              config={currentConfig}
              onConfigUpdate={handleConfigUpdate}
              presets={presets}
              materials={materials}
              onLoadPreset={handleLoadPreset}
              loading={loading}
            />
          )}

          {activeTab === 'results' && (
            <AnalysisResults
              results={analysisResults}
              config={currentConfig}
            />
          )}

          {activeTab === 'visualization' && (
            <VisualizationDashboard
              plots={plots}
              config={currentConfig}
              onGeneratePlots={handleGeneratePlots}
            />
          )}

          {activeTab === 'report' && (
            <ReportGenerator
              config={currentConfig}
              results={analysisResults}
              onGenerateReport={handleGenerateReport}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App