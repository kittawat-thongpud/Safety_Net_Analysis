import React, { useState, useEffect } from 'react'
import ConfigurationForm from './components/ConfigurationForm'
import AnalysisResults from './components/AnalysisResults'
import VisualizationDashboard from './components/VisualizationDashboard'
import ReportGenerator from './components/ReportGenerator'
import Header from './components/Header'
import { apiClient } from './utils/apiClient'
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
      const [presetsResponse, materialsResponse] = await Promise.all([
        apiClient.get('/config/presets'),
        apiClient.get('/config/materials')
      ])

      setPresets(presetsResponse.data.presets)
      setMaterials(materialsResponse.data.materials)
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
        // Load preset from API
        const response = await apiClient.get(`/config/load/${presetName}`)
        if (response.data.success) {
          setCurrentConfig(response.data.config)
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
      const response = await apiClient.post('/analyze', currentConfig)
      if (response.data.success) {
        setAnalysisResults(response.data.results)
        setActiveTab('results')
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed: ' + (error.response?.data?.error || error.message))
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
      const response = await apiClient.post('/plots', currentConfig)
      if (response.data.success) {
        setPlots(response.data.plots)
        setActiveTab('visualization')
      }
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
      const response = await apiClient.post('/report', currentConfig, {
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
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