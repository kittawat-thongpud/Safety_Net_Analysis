import json
import numpy as np
from scipy.optimize import fsolve
from typing import Dict, Any, List
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd

from models import SafetyNetConfig, MaterialConfig, GeometryConfig, ImpactConfig, AnalysisConfig

class SafetyNetAnalyzer:
    """
    Core analysis engine for safety net calculations
    """

    def __init__(self, config: SafetyNetConfig = None):
        self.config = config or SafetyNetConfig()
        self.g = 9.81  # gravitational acceleration (m/s²)
        self.results = {}

    def update_config(self, config: SafetyNetConfig):
        """Update analyzer configuration"""
        self.config = config

    def analyze(self) -> Dict[str, Any]:
        """Run analysis with current configuration"""
        # Validate configuration
        errors = self.config.validate()
        if errors:
            raise ValueError(f"Configuration errors: {', '.join(errors)}")

        # Perform calculations
        material = self.config.material
        geometry = self.config.geometry
        impact = self.config.impact

        # Calculate stiffness coefficients
        k1, k2, k3 = self._calculate_stiffness_coefficients()

        # Solve for maximum deflection
        delta_max = self._calculate_max_deflection(k1, k2, k3)

        # Calculate stress and safety factor
        sigma_max = self._calculate_max_stress(delta_max)
        safety_factor = material.yield_strength / sigma_max if sigma_max > 0 else float('inf')
        strain = (np.sqrt(geometry.net_span**2 + delta_max**2) - geometry.net_span) / geometry.net_span

        # Check design criteria
        max_deflection_limit = geometry.max_deflection_ratio * geometry.net_span

        design_checks = {
            'deflection_ok': bool(delta_max <= max_deflection_limit),
            'stress_ok': bool(safety_factor >= geometry.safety_factor_min),
            'strain_ok': bool(strain <= material.strain_limit),
            'overall_safe': bool((delta_max <= max_deflection_limit) and
                           (safety_factor >= geometry.safety_factor_min) and
                           (strain <= material.strain_limit))
        }

        # Store results
        self.results = {
            'scenario_name': self.config._scenario_name,
            'input_parameters': self.config.to_dict(),
            'structural_response': {
                'max_deflection': delta_max,
                'max_stress': sigma_max,
                'safety_factor': safety_factor,
                'strain': strain
            },
            'design_limits': {
                'max_deflection_limit': max_deflection_limit,
                'min_safety_factor': geometry.safety_factor_min,
                'max_strain_limit': material.strain_limit
            },
            'design_checks': design_checks,
            'stiffness_coefficients': {
                'k1': k1, 'k2': k2, 'k3': k3
            }
        }

        return self.results

    def _calculate_stiffness_coefficients(self):
        """Calculate nonlinear stiffness coefficients"""
        material = self.config.material
        geometry = self.config.geometry

        # Estimate deformation angle (will be refined iteratively)
        delta_est = 0.1 * geometry.net_span
        theta = np.arctan(delta_est / (geometry.net_span / 2))

        k1 = (geometry.num_strands * material.elastic_modulus * material.cross_section_area /
              geometry.net_span) * (np.cos(theta)**2)
        k2 = (geometry.num_strands * material.elastic_modulus * material.cross_section_area /
              (geometry.net_span**2)) * np.sin(theta) * (np.cos(theta)**2)
        k3 = (geometry.num_strands * material.elastic_modulus * material.cross_section_area /
              (geometry.net_span**3)) * (np.sin(theta)**2) * (np.cos(theta)**2)

        return k1, k2, k3

    def _calculate_max_deflection(self, k1, k2, k3):
        """Calculate maximum deflection using numerical solution"""
        impact = self.config.impact
        geometry = self.config.geometry

        def energy_equation(delta):
            return (0.5 * k1 * delta**2 +
                   (1/3) * k2 * delta**3 +
                   0.25 * k3 * delta**4 -
                   impact.mass * self.g * impact.fall_height)

        # Use numerical solver
        try:
            delta_max = fsolve(energy_equation, 0.1 * geometry.net_span)[0]
            return max(0, delta_max)
        except:
            # Fallback: simple approximation
            return min(impact.mass * self.g * impact.fall_height / k1, geometry.net_span * 0.5)

    def _calculate_max_stress(self, delta_max):
        """Calculate maximum stress in net strands"""
        material = self.config.material
        geometry = self.config.geometry

        strain = (np.sqrt(geometry.net_span**2 + delta_max**2) - geometry.net_span) / geometry.net_span
        return material.elastic_modulus * strain

    def generate_plots(self) -> Dict[str, str]:
        """Generate Plotly visualizations for the analysis"""
        plots = {}

        # Force-Deflection Curve
        plots['force_deflection'] = self._create_force_deflection_plot()

        # Safety Factor Comparison
        plots['safety_factor'] = self._create_safety_factor_chart()

        # Stress Distribution
        plots['stress_distribution'] = self._create_stress_distribution_plot()

        # Deflection vs Time
        plots['deflection_time'] = self._create_deflection_time_plot()

        return plots

    def _create_force_deflection_plot(self) -> str:
        """Create force-deflection curve plot"""
        geometry = self.config.geometry
        k1, k2, k3 = self._calculate_stiffness_coefficients()

        # Generate deflection range
        delta_range = np.linspace(0, geometry.net_span * 0.3, 100)
        force_range = k1 * delta_range + k2 * delta_range**2 + k3 * delta_range**3

        # Create plot
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=delta_range,
            y=force_range,
            mode='lines',
            name='Force-Deflection Curve',
            line=dict(color='blue', width=3)
        ))

        # Add maximum deflection point
        if 'structural_response' in self.results:
            delta_max = self.results['structural_response']['max_deflection']
            force_max = k1 * delta_max + k2 * delta_max**2 + k3 * delta_max**3
            fig.add_trace(go.Scatter(
                x=[delta_max],
                y=[force_max],
                mode='markers',
                name='Maximum Deflection',
                marker=dict(color='red', size=10)
            ))

        fig.update_layout(
            title='Force-Deflection Curve',
            xaxis_title='Deflection (m)',
            yaxis_title='Force (N)',
            showlegend=True
        )

        return fig.to_json()

    def _create_safety_factor_chart(self) -> str:
        """Create safety factor comparison chart"""
        if 'structural_response' not in self.results:
            return ""

        safety_factor = self.results['structural_response']['safety_factor']
        min_safety = self.config.geometry.safety_factor_min

        fig = go.Figure()

        # Safety factor bar
        fig.add_trace(go.Bar(
            x=['Safety Factor'],
            y=[safety_factor],
            name='Calculated Safety Factor',
            marker_color='green' if safety_factor >= min_safety else 'red'
        ))

        # Minimum requirement line
        fig.add_hline(
            y=min_safety,
            line_dash="dash",
            line_color="red",
            annotation_text=f"Minimum Required: {min_safety}",
            annotation_position="top left"
        )

        fig.update_layout(
            title='Safety Factor Analysis',
            yaxis_title='Safety Factor',
            showlegend=False
        )

        return fig.to_json()

    def _create_stress_distribution_plot(self) -> str:
        """Create stress distribution visualization"""
        if 'structural_response' not in self.results:
            return ""

        max_stress = self.results['structural_response']['max_stress']
        yield_strength = self.config.material.yield_strength

        # Create stress distribution across strands
        num_strands = self.config.geometry.num_strands
        stress_distribution = np.random.normal(max_stress, max_stress * 0.1, num_strands)
        stress_distribution = np.clip(stress_distribution, 0, yield_strength * 1.2)

        fig = go.Figure()

        fig.add_trace(go.Histogram(
            x=stress_distribution / 1e6,  # Convert to MPa
            name='Stress Distribution',
            nbinsx=20,
            marker_color='orange'
        ))

        # Add yield strength line
        fig.add_vline(
            x=yield_strength / 1e6,
            line_dash="dash",
            line_color="red",
            annotation_text=f"Yield Strength: {yield_strength/1e6:.1f} MPa",
            annotation_position="top right"
        )

        fig.update_layout(
            title='Stress Distribution Across Net Strands',
            xaxis_title='Stress (MPa)',
            yaxis_title='Number of Strands',
            showlegend=False
        )

        return fig.to_json()

    def _create_deflection_time_plot(self) -> str:
        """Create deflection vs time plot"""
        if 'structural_response' not in self.results:
            return ""

        delta_max = self.results['structural_response']['max_deflection']

        # Simulate dynamic response
        time_range = np.linspace(0, 2, 100)
        deflection_response = delta_max * (1 - np.exp(-5 * time_range)) * np.exp(-0.5 * time_range)

        fig = go.Figure()

        fig.add_trace(go.Scatter(
            x=time_range,
            y=deflection_response,
            mode='lines',
            name='Deflection Response',
            line=dict(color='purple', width=3)
        ))

        fig.update_layout(
            title='Deflection vs Time (Dynamic Response)',
            xaxis_title='Time (s)',
            yaxis_title='Deflection (m)',
            showlegend=False
        )

        return fig.to_json()

    def save_results(self, filepath: str):
        """Save analysis results to JSON"""
        results_dict = {
            'configuration': self.config.to_dict(),
            'results': self.results,
            'timestamp': np.datetime64('now').astype(str)
        }

        with open(filepath, 'w') as f:
            json.dump(results_dict, f, indent=2, default=self.config._json_serializer)

    def generate_report_data(self) -> Dict[str, Any]:
        """Generate data for HTML report"""
        if not self.results:
            self.analyze()

        return {
            'scenario_name': self.config._scenario_name,
            'configuration': self.config.to_dict(),
            'results': self.results,
            'plots': self.generate_plots(),
            'timestamp': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
        }