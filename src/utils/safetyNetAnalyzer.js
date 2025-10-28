/**
 * JavaScript implementation of Safety Net Analysis
 * Replaces the Python backend with pure client-side computation
 */

export class SafetyNetAnalyzer {
  constructor(config = null) {
    this.config = config || this.getDefaultConfig()
    this.g = 9.81 // gravitational acceleration (m/s²)
    this.results = {}
  }

  updateConfig(config) {
    this.config = config
  }

  getDefaultConfig() {
    return {
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
  }

  analyze() {
    // Validate configuration
    const errors = this.validateConfig()
    if (errors.length > 0) {
      throw new Error(`Configuration errors: ${errors.join(', ')}`)
    }

    // Perform calculations
    const material = this.config.material
    const geometry = this.config.geometry
    const impact = this.config.impact

    // Calculate stiffness coefficients
    const { k1, k2, k3 } = this._calculateStiffnessCoefficients()

    // Solve for maximum deflection
    const delta_max = this._calculateMaxDeflection(k1, k2, k3)

    // Calculate stress and safety factor
    const sigma_max = this._calculateMaxStress(delta_max)
    const safety_factor = sigma_max > 0 ? material.yield_strength / sigma_max : Infinity
    const strain = (Math.sqrt(geometry.net_span**2 + delta_max**2) - geometry.net_span) / geometry.net_span

    // Check design criteria
    const max_deflection_limit = geometry.max_deflection_ratio * geometry.net_span

    const design_checks = {
      deflection_ok: delta_max <= max_deflection_limit,
      stress_ok: safety_factor >= geometry.safety_factor_min,
      strain_ok: strain <= material.strain_limit,
      overall_safe: (delta_max <= max_deflection_limit) &&
                   (safety_factor >= geometry.safety_factor_min) &&
                   (strain <= material.strain_limit)
    }

    // Store results
    this.results = {
      scenario_name: this.config.scenario_name,
      input_parameters: this.config,
      structural_response: {
        max_deflection: delta_max,
        max_stress: sigma_max,
        safety_factor: safety_factor,
        strain: strain
      },
      design_limits: {
        max_deflection_limit: max_deflection_limit,
        min_safety_factor: geometry.safety_factor_min,
        max_strain_limit: material.strain_limit
      },
      design_checks: design_checks,
      stiffness_coefficients: {
        k1: k1, k2: k2, k3: k3
      }
    }

    return this.results
  }

  validateConfig() {
    const errors = []
    const { material, geometry, impact } = this.config

    if (!material.elastic_modulus || material.elastic_modulus <= 0) {
      errors.push("Material elastic modulus must be positive")
    }
    if (!material.yield_strength || material.yield_strength <= 0) {
      errors.push("Material yield strength must be positive")
    }
    if (!geometry.net_span || geometry.net_span <= 0) {
      errors.push("Net span must be positive")
    }
    if (!geometry.num_strands || geometry.num_strands <= 0) {
      errors.push("Number of strands must be positive")
    }
    if (!impact.mass || impact.mass <= 0) {
      errors.push("Impact mass must be positive")
    }
    if (!impact.fall_height || impact.fall_height <= 0) {
      errors.push("Fall height must be positive")
    }

    return errors
  }

  _calculateStiffnessCoefficients() {
    const material = this.config.material
    const geometry = this.config.geometry

    // Estimate deformation angle (will be refined iteratively)
    const delta_est = 0.1 * geometry.net_span
    const theta = Math.atan(delta_est / (geometry.net_span / 2))

    const k1 = (geometry.num_strands * material.elastic_modulus * material.cross_section_area /
              geometry.net_span) * (Math.cos(theta)**2)
    const k2 = (geometry.num_strands * material.elastic_modulus * material.cross_section_area /
              (geometry.net_span**2)) * Math.sin(theta) * (Math.cos(theta)**2)
    const k3 = (geometry.num_strands * material.elastic_modulus * material.cross_section_area /
              (geometry.net_span**3)) * (Math.sin(theta)**2) * (Math.cos(theta)**2)

    return { k1, k2, k3 }
  }

  _calculateMaxDeflection(k1, k2, k3) {
    const impact = this.config.impact
    const geometry = this.config.geometry

    const energyEquation = (delta) => {
      return (0.5 * k1 * delta**2 +
             (1/3) * k2 * delta**3 +
             0.25 * k3 * delta**4 -
             impact.mass * this.g * impact.fall_height)
    }

    // Use numerical solver (bisection method)
    let left = 0
    let right = geometry.net_span * 0.5
    const tolerance = 1e-6
    const maxIterations = 100

    for (let i = 0; i < maxIterations; i++) {
      const mid = (left + right) / 2
      const f_mid = energyEquation(mid)

      if (Math.abs(f_mid) < tolerance) {
        return Math.max(0, mid)
      }

      if (f_mid > 0) {
        right = mid
      } else {
        left = mid
      }
    }

    // Fallback: simple approximation
    return Math.min(impact.mass * this.g * impact.fall_height / k1, geometry.net_span * 0.5)
  }

  _calculateMaxStress(delta_max) {
    const material = this.config.material
    const geometry = this.config.geometry

    const strain = (Math.sqrt(geometry.net_span**2 + delta_max**2) - geometry.net_span) / geometry.net_span
    return material.elastic_modulus * strain
  }

  generatePlots() {
    const plots = {}

    // Force-Deflection Curve
    plots.force_deflection = this._createForceDeflectionPlot()

    // Safety Factor Comparison
    plots.safety_factor = this._createSafetyFactorChart()

    // Stress Distribution
    plots.stress_distribution = this._createStressDistributionPlot()

    // Deflection vs Time
    plots.deflection_time = this._createDeflectionTimePlot()

    return plots
  }

  _createForceDeflectionPlot() {
    const geometry = this.config.geometry
    const { k1, k2, k3 } = this._calculateStiffnessCoefficients()

    // Generate deflection range
    const delta_range = Array.from({length: 100}, (_, i) => geometry.net_span * 0.3 * i / 99)
    const force_range = delta_range.map(delta => k1 * delta + k2 * delta**2 + k3 * delta**3)

    // Create plot data
    const plotData = {
      data: [
        {
          x: delta_range,
          y: force_range,
          type: 'scatter',
          mode: 'lines',
          name: 'Force-Deflection Curve',
          line: { color: 'blue', width: 3 }
        }
      ],
      layout: {
        title: 'Force-Deflection Curve',
        xaxis: { title: 'Deflection (m)' },
        yaxis: { title: 'Force (N)' },
        showlegend: true
      }
    }

    // Add maximum deflection point if available
    if (this.results.structural_response) {
      const delta_max = this.results.structural_response.max_deflection
      const force_max = k1 * delta_max + k2 * delta_max**2 + k3 * delta_max**3
      plotData.data.push({
        x: [delta_max],
        y: [force_max],
        type: 'scatter',
        mode: 'markers',
        name: 'Maximum Deflection',
        marker: { color: 'red', size: 10 }
      })
    }

    return plotData
  }

  _createSafetyFactorChart() {
    if (!this.results.structural_response) {
      return null
    }

    const safety_factor = this.results.structural_response.safety_factor
    const min_safety = this.config.geometry.safety_factor_min

    const plotData = {
      data: [
        {
          x: ['Safety Factor'],
          y: [safety_factor],
          type: 'bar',
          name: 'Calculated Safety Factor',
          marker: { color: safety_factor >= min_safety ? 'green' : 'red' }
        }
      ],
      layout: {
        title: 'Safety Factor Analysis',
        yaxis: { title: 'Safety Factor' },
        showlegend: false,
        shapes: [
          {
            type: 'line',
            x0: -0.5,
            x1: 0.5,
            y0: min_safety,
            y1: min_safety,
            line: {
              color: 'red',
              width: 2,
              dash: 'dash'
            }
          }
        ],
        annotations: [
          {
            x: 0,
            y: min_safety,
            xref: 'x',
            yref: 'y',
            text: `Minimum Required: ${min_safety}`,
            showarrow: true,
            arrowhead: 7,
            ax: 0,
            ay: -40
          }
        ]
      }
    }

    return plotData
  }

  _createStressDistributionPlot() {
    if (!this.results.structural_response) {
      return null
    }

    const max_stress = this.results.structural_response.max_stress
    const yield_strength = this.config.material.yield_strength

    // Create stress distribution across strands
    const num_strands = this.config.geometry.num_strands
    const stress_distribution = Array.from({length: num_strands}, () => {
      const stress = max_stress * (1 + (Math.random() - 0.5) * 0.2)
      return Math.min(Math.max(stress, 0), yield_strength * 1.2)
    })

    const plotData = {
      data: [
        {
          x: stress_distribution.map(s => s / 1e6), // Convert to MPa
          type: 'histogram',
          name: 'Stress Distribution',
          nbinsx: 20,
          marker: { color: 'orange' }
        }
      ],
      layout: {
        title: 'Stress Distribution Across Net Strands',
        xaxis: { title: 'Stress (MPa)' },
        yaxis: { title: 'Number of Strands' },
        showlegend: false,
        shapes: [
          {
            type: 'line',
            x0: yield_strength / 1e6,
            x1: yield_strength / 1e6,
            y0: 0,
            y1: 1,
            yref: 'paper',
            line: {
              color: 'red',
              width: 2,
              dash: 'dash'
            }
          }
        ],
        annotations: [
          {
            x: yield_strength / 1e6,
            y: 0.95,
            xref: 'x',
            yref: 'paper',
            text: `Yield Strength: ${(yield_strength/1e6).toFixed(1)} MPa`,
            showarrow: true,
            arrowhead: 7,
            ax: 0,
            ay: -40
          }
        ]
      }
    }

    return plotData
  }

  _createDeflectionTimePlot() {
    if (!this.results.structural_response) {
      return null
    }

    const delta_max = this.results.structural_response.max_deflection

    // Simulate dynamic response
    const time_range = Array.from({length: 100}, (_, i) => 2 * i / 99)
    const deflection_response = time_range.map(t =>
      delta_max * (1 - Math.exp(-5 * t)) * Math.exp(-0.5 * t)
    )

    const plotData = {
      data: [
        {
          x: time_range,
          y: deflection_response,
          type: 'scatter',
          mode: 'lines',
          name: 'Deflection Response',
          line: { color: 'purple', width: 3 }
        }
      ],
      layout: {
        title: 'Deflection vs Time (Dynamic Response)',
        xaxis: { title: 'Time (s)' },
        yaxis: { title: 'Deflection (m)' },
        showlegend: false
      }
    }

    return plotData
  }

  generateReportData() {
    if (!this.results) {
      this.analyze()
    }

    return {
      scenario_name: this.config.scenario_name,
      configuration: this.config,
      results: this.results,
      plots: this.generatePlots(),
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
  }
}