import json
import numpy as np
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any
from enum import Enum

class MaterialType(Enum):
    NYLON = "nylon"
    POLYESTER = "polyester"
    POLYPROPYLENE = "polypropylene"
    STEEL = "steel"

class AnalysisType(Enum):
    STATIC = "static"
    DYNAMIC = "dynamic"
    IMPACT = "impact"

@dataclass
class MaterialConfig:
    """Material properties configuration"""
    name: str
    elastic_modulus: float  # Pa
    yield_strength: float   # Pa
    density: float          # kg/m³
    cross_section_area: float  # m²
    strain_limit: float = 0.1

    @classmethod
    def from_preset(cls, material_type: MaterialType):
        """Create material config from preset types"""
        presets = {
            MaterialType.NYLON: cls(
                name="Nylon",
                elastic_modulus=3.5e9,
                yield_strength=8.0e7,
                density=1150,
                cross_section_area=2.0e-6
            ),
            MaterialType.POLYESTER: cls(
                name="Polyester",
                elastic_modulus=4.2e9,
                yield_strength=9.0e7,
                density=1380,
                cross_section_area=2.0e-6
            ),
            MaterialType.POLYPROPYLENE: cls(
                name="Polypropylene",
                elastic_modulus=2.8e9,
                yield_strength=6.5e7,
                density=900,
                cross_section_area=2.0e-6
            ),
            MaterialType.STEEL: cls(
                name="Steel Cable",
                elastic_modulus=2.0e11,
                yield_strength=5.0e8,
                density=7850,
                cross_section_area=1.0e-6
            )
        }
        return presets[material_type]

@dataclass
class GeometryConfig:
    """Geometric configuration"""
    net_span: float          # L - span between supports (m)
    num_strands: int         # n - number of load-bearing strands
    installation_angle: float = 0.0  # degrees
    safety_factor_min: float = 2.0
    max_deflection_ratio: float = 0.15  # 15% of span

@dataclass
class ImpactConfig:
    """Impact scenario configuration"""
    mass: float              # kg
    fall_height: float       # m
    impact_velocity: Optional[float] = None

    def __post_init__(self):
        if self.impact_velocity is None:
            self.impact_velocity = np.sqrt(2 * 9.81 * self.fall_height)

@dataclass
class AnalysisConfig:
    """Analysis method configuration"""
    analysis_type: AnalysisType
    max_iterations: int = 100
    convergence_tolerance: float = 1e-6
    include_damping: bool = False
    damping_ratio: float = 0.05

class SafetyNetConfig:
    """
    Main configuration class for safety net analysis system
    """

    def __init__(self):
        self.material: MaterialConfig = MaterialConfig.from_preset(MaterialType.NYLON)
        self.geometry: GeometryConfig = GeometryConfig(
            net_span=4.0,
            num_strands=50
        )
        self.impact: ImpactConfig = ImpactConfig(
            mass=100.0,
            fall_height=3.0
        )
        self.analysis: AnalysisConfig = AnalysisConfig(
            analysis_type=AnalysisType.IMPACT
        )
        self._scenario_name: str = "default"

    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary"""
        config_dict = {
            "scenario_name": self._scenario_name,
            "material": asdict(self.material),
            "geometry": asdict(self.geometry),
            "impact": asdict(self.impact),
            "analysis": asdict(self.analysis)
        }

        # Convert any non-serializable types
        return self._convert_to_serializable(config_dict)

    def to_json(self, filepath: str = None) -> str:
        """Serialize configuration to JSON"""
        config_dict = self.to_dict()
        json_str = json.dumps(config_dict, indent=2, default=self._json_serializer)

        if filepath:
            with open(filepath, 'w') as f:
                f.write(json_str)

        return json_str

    @classmethod
    def from_dict(cls, config_dict: Dict[str, Any]) -> 'SafetyNetConfig':
        """Create configuration from dictionary"""
        config = cls()

        if 'scenario_name' in config_dict:
            config._scenario_name = config_dict['scenario_name']

        if 'material' in config_dict:
            material_data = config_dict['material']
            config.material = MaterialConfig(**material_data)

        if 'geometry' in config_dict:
            geometry_data = config_dict['geometry']
            config.geometry = GeometryConfig(**geometry_data)

        if 'impact' in config_dict:
            impact_data = config_dict['impact']
            config.impact = ImpactConfig(**impact_data)

        if 'analysis' in config_dict:
            analysis_data = config_dict['analysis']
            # Convert string to Enum
            if 'analysis_type' in analysis_data:
                analysis_data['analysis_type'] = AnalysisType(analysis_data['analysis_type'])
            config.analysis = AnalysisConfig(**analysis_data)

        return config

    @classmethod
    def from_json(cls, filepath: str) -> 'SafetyNetConfig':
        """Load configuration from JSON file"""
        with open(filepath, 'r') as f:
            config_dict = json.load(f)

        return cls.from_dict(config_dict)

    @classmethod
    def from_preset(cls, scenario_name: str) -> 'SafetyNetConfig':
        """Create configuration from preset scenarios"""
        presets = cls._get_preset_scenarios()

        if scenario_name in presets:
            return cls.from_dict(presets[scenario_name])
        else:
            raise ValueError(f"Unknown preset: {scenario_name}. Available: {list(presets.keys())}")

    @staticmethod
    def _get_preset_scenarios() -> Dict[str, Any]:
        """Get predefined test scenarios"""
        return {
            "light_worker": {
                "scenario_name": "Light Worker",
                "material": asdict(MaterialConfig.from_preset(MaterialType.NYLON)),
                "geometry": {
                    "net_span": 3.0,
                    "num_strands": 40,
                    "safety_factor_min": 2.5
                },
                "impact": {
                    "mass": 70.0,
                    "fall_height": 2.0
                },
                "analysis": {
                    "analysis_type": "impact"
                }
            },
            "heavy_equipment": {
                "scenario_name": "Heavy Equipment",
                "material": asdict(MaterialConfig.from_preset(MaterialType.POLYESTER)),
                "geometry": {
                    "net_span": 3.5,
                    "num_strands": 60,
                    "safety_factor_min": 3.0
                },
                "impact": {
                    "mass": 150.0,
                    "fall_height": 1.5
                },
                "analysis": {
                    "analysis_type": "impact"
                }
            },
            "construction_site": {
                "scenario_name": "Construction Site",
                "material": asdict(MaterialConfig.from_preset(MaterialType.POLYPROPYLENE)),
                "geometry": {
                    "net_span": 4.0,
                    "num_strands": 50,
                    "safety_factor_min": 2.0
                },
                "impact": {
                    "mass": 100.0,
                    "fall_height": 3.0
                },
                "analysis": {
                    "analysis_type": "impact"
                }
            }
        }

    def _convert_to_serializable(self, obj):
        """Recursively convert objects to JSON-serializable types"""
        if isinstance(obj, (str, int, float, bool)):
            return obj
        elif isinstance(obj, (np.integer, np.floating, np.bool_)):
            return float(obj) if isinstance(obj, (np.integer, np.floating)) else bool(obj)
        elif isinstance(obj, Enum):
            return obj.value
        elif isinstance(obj, dict):
            return {k: self._convert_to_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, (list, tuple)):
            return [self._convert_to_serializable(item) for item in obj]
        elif hasattr(obj, 'to_dict'):
            return self._convert_to_serializable(obj.to_dict())
        elif hasattr(obj, '__dict__'):
            return self._convert_to_serializable(obj.__dict__)
        else:
            return str(obj)

    @staticmethod
    def _json_serializer(obj):
        """JSON serializer for objects not serializable by default json code"""
        if isinstance(obj, (np.integer, np.floating, np.bool_)):
            return float(obj) if isinstance(obj, (np.integer, np.floating)) else bool(obj)
        elif isinstance(obj, Enum):
            return obj.value
        elif hasattr(obj, 'to_dict'):
            return obj.to_dict()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

    def validate(self) -> List[str]:
        """Validate configuration and return list of errors"""
        errors = []

        # Material validation
        if self.material.elastic_modulus <= 0:
            errors.append("Elastic modulus must be positive")

        if self.material.yield_strength <= 0:
            errors.append("Yield strength must be positive")

        # Geometry validation
        if self.geometry.net_span <= 0:
            errors.append("Net span must be positive")

        if self.geometry.num_strands <= 0:
            errors.append("Number of strands must be positive")

        # Impact validation
        if self.impact.mass <= 0:
            errors.append("Impact mass must be positive")

        if self.impact.fall_height < 0:
            errors.append("Fall height cannot be negative")

        return errors

    def __str__(self) -> str:
        """String representation of configuration"""
        return f"SafetyNetConfig('{self._scenario_name}')"

    def summary(self) -> str:
        """Get configuration summary"""
        return f"""
Safety Net Configuration: {self._scenario_name}
============================================
Material: {self.material.name}
  - Elastic Modulus: {self.material.elastic_modulus:.2e} Pa
  - Yield Strength: {self.material.yield_strength:.2e} Pa
  - Density: {self.material.density} kg/m³

Geometry:
  - Net Span: {self.geometry.net_span} m
  - Strands: {self.geometry.num_strands}
  - Safety Factor Min: {self.geometry.safety_factor_min}

Impact:
  - Mass: {self.impact.mass} kg
  - Fall Height: {self.impact.fall_height} m
  - Impact Velocity: {self.impact.impact_velocity:.2f} m/s

Analysis: {self.analysis.analysis_type.value}
        """.strip()