import React, { useState, useEffect } from 'react'

function ConfigurationForm({ config, onConfigUpdate, presets, materials, onLoadPreset, loading }) {
  const [localConfig, setLocalConfig] = useState(config || {
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
      impact_velocity: null
    },
    analysis: {
      analysis_type: "impact",
      max_iterations: 100,
      convergence_tolerance: 1e-6,
      include_damping: false,
      damping_ratio: 0.05
    }
  })

  useEffect(() => {
    if (config) {
      setLocalConfig(config)
    }
  }, [config])

  const handleInputChange = (section, field, value) => {
    const updatedConfig = {
      ...localConfig,
      [section]: {
        ...localConfig[section],
        [field]: value
      }
    }

    // Auto-calculate impact velocity if fall height changes
    if (section === 'impact' && field === 'fall_height') {
      const velocity = Math.sqrt(2 * 9.81 * value)
      updatedConfig.impact.impact_velocity = velocity
    }

    setLocalConfig(updatedConfig)
    onConfigUpdate(updatedConfig)
  }

  const handleMaterialChange = (materialType) => {
    if (materialType === 'custom') {
      // Custom material - user can manually configure all values
      handleInputChange('material', 'name', 'Custom Material')
    } else if (materials[materialType]) {
      const material = materials[materialType]
      handleInputChange('material', 'name', material.name)
      handleInputChange('material', 'elastic_modulus', material.elastic_modulus)
      handleInputChange('material', 'yield_strength', material.yield_strength)
      handleInputChange('material', 'density', material.density)
      handleInputChange('material', 'cross_section_area', material.cross_section_area)
    }
  }

  // Find material type by name for dropdown selection
  const findMaterialTypeByName = (materialName) => {
    if (materialName === 'Custom Material') {
      return 'custom'
    }
    for (const [type, material] of Object.entries(materials)) {
      if (material.name === materialName) {
        return type
      }
    }
    return 'custom' // Default to custom if not found
  }

  const formatScientific = (value) => {
    if (typeof value === 'number' && (Math.abs(value) >= 1e6 || Math.abs(value) <= 1e-3)) {
      return value.toExponential(2)
    }
    return value
  }

  return (
    <div className="configuration-form">
      <div className="grid grid-2">
        {/* Preset Loader */}
        <div className="card">
          <h3>Quick Start</h3>
          <div className="form-group">
            <label className="form-label">Load Preset Scenario</label>
            <select
              className="form-select"
              onChange={(e) => onLoadPreset(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a preset...</option>
              <option value="custom">Custom Configuration</option>
              {Object.keys(presets).map(presetName => (
                <option key={presetName} value={presetName}>
                  {presets[presetName].scenario_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scenario Info */}
        <div className="card">
          <h3>Scenario Information</h3>
          <div className="form-group">
            <label className="form-label">Scenario Name</label>
            <input
              type="text"
              className="form-input"
              value={localConfig.scenario_name || ''}
              onChange={(e) => {
                const updatedConfig = { ...localConfig, scenario_name: e.target.value }
                setLocalConfig(updatedConfig)
                onConfigUpdate(updatedConfig)
              }}
              placeholder="Enter scenario name"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        {/* Material Selection */}
        <div className="card">
          <h3>Material Properties</h3>
          <div className="form-group">
            <label className="form-label">Material Type</label>
            <select
              className="form-select"
              value={findMaterialTypeByName(localConfig.material.name)}
              onChange={(e) => handleMaterialChange(e.target.value)}
            >
              <option value="custom">Custom Material</option>
              {Object.keys(materials).map(materialType => (
                <option key={materialType} value={materialType}>
                  {materials[materialType].name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Elastic Modulus (Pa)</label>
            <input
              type="number"
              className="form-input"
              value={localConfig.material.elastic_modulus}
              onChange={(e) => handleInputChange('material', 'elastic_modulus', parseFloat(e.target.value))}
              step="1e8"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Yield Strength (Pa)</label>
            <input
              type="number"
              className="form-input"
              value={localConfig.material.yield_strength}
              onChange={(e) => handleInputChange('material', 'yield_strength', parseFloat(e.target.value))}
              step="1e7"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cross-section Area (m²)</label>
            <input
              type="number"
              className="form-input"
              value={localConfig.material.cross_section_area}
              onChange={(e) => handleInputChange('material', 'cross_section_area', parseFloat(e.target.value))}
              step="1e-7"
            />
          </div>
        </div>

        {/* Geometry Configuration */}
        <div className="card">
          <h3>Geometry Configuration</h3>
          <div className="form-group">
            <label className="form-label">Net Span (m)</label>
            <input
              type="number"
              className="form-input"
              value={localConfig.geometry.net_span}
              onChange={(e) => handleInputChange('geometry', 'net_span', parseFloat(e.target.value))}
              min="0.1"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Number of Strands</label>
            <input
              type="number"
              className="form-input"
              value={localConfig.geometry.num_strands}
              onChange={(e) => handleInputChange('geometry', 'num_strands', parseInt(e.target.value))}
              min="1"
              step="1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Safety Factor</label>
            <input
              type="number"
              className="form-input"
              value={localConfig.geometry.safety_factor_min}
              onChange={(e) => handleInputChange('geometry', 'safety_factor_min', parseFloat(e.target.value))}
              min="1.0"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Max Deflection Ratio (%)</label>
            <input
              type="number"
              className="form-input"
              value={localConfig.geometry.max_deflection_ratio * 100}
              onChange={(e) => handleInputChange('geometry', 'max_deflection_ratio', parseFloat(e.target.value) / 100)}
              min="5"
              max="30"
              step="1"
            />
          </div>
        </div>

        {/* Impact Scenario */}
        <div className="card">
          <h3>Impact Scenario</h3>
          <div className="form-group">
            <label className="form-label">Impact Mass (kg)</label>
            <input
              type="number"
              className="form-input"
              value={localConfig.impact.mass}
              onChange={(e) => handleInputChange('impact', 'mass', parseFloat(e.target.value))}
              min="1"
              step="1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fall Height (m)</label>
            <input
              type="number"
              className="form-input"
              value={localConfig.impact.fall_height}
              onChange={(e) => handleInputChange('impact', 'fall_height', parseFloat(e.target.value))}
              min="0"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Impact Velocity (m/s)</label>
            <input
              type="number"
              className="form-input"
              value={localConfig.impact.impact_velocity || ''}
              readOnly
              style={{ backgroundColor: '#f8f9fa' }}
              placeholder="Calculated automatically"
            />
          </div>

          <div className="info-box">
            <strong>Impact Energy:</strong> {(
              0.5 * localConfig.impact.mass *
              Math.pow(localConfig.impact.impact_velocity || 0, 2)
            ).toFixed(0)} J
          </div>
        </div>
      </div>

      {/* Current Configuration Summary */}
      <div className="card">
        <h3>Current Configuration Summary</h3>
        <div className="config-summary">
          <div className="summary-item">
            <strong>Material:</strong> {localConfig.material.name}
          </div>
          <div className="summary-item">
            <strong>Net Span:</strong> {localConfig.geometry.net_span} m
          </div>
          <div className="summary-item">
            <strong>Strands:</strong> {localConfig.geometry.num_strands}
          </div>
          <div className="summary-item">
            <strong>Impact Mass:</strong> {localConfig.impact.mass} kg
          </div>
          <div className="summary-item">
            <strong>Fall Height:</strong> {localConfig.impact.fall_height} m
          </div>
        </div>
      </div>

      <style jsx>{`
        .configuration-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-box {
          background: #e7f3ff;
          border: 1px solid #b3d9ff;
          border-radius: 6px;
          padding: 12px;
          margin-top: 15px;
          font-size: 14px;
        }

        .config-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .summary-item {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .config-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default ConfigurationForm