#!/usr/bin/env python3
"""
Simple test script to verify basic backend functionality
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from models import SafetyNetConfig, MaterialType

    print("✅ Backend modules imported successfully")

    # Test configuration
    config = SafetyNetConfig()
    print(f"✅ Default configuration created: {config._scenario_name}")

    # Test material presets
    for material_type in MaterialType:
        material = config.material.from_preset(material_type)
        print(f"   {material_type.value}: {material.name}")

    # Test preset scenarios
    presets = SafetyNetConfig._get_preset_scenarios()
    print(f"✅ {len(presets)} preset scenarios available")
    for preset_name in presets:
        print(f"   - {presets[preset_name]['scenario_name']}")

    # Test configuration validation
    errors = config.validate()
    print(f"✅ Configuration validation: {len(errors)} errors")
    if errors:
        for error in errors:
            print(f"   - {error}")

    # Test JSON serialization
    config_dict = config.to_dict()
    print(f"✅ Configuration serialized to dict")

    # Test report generator import
    from report_generator import ReportGenerator
    report_gen = ReportGenerator()
    print(f"✅ Report generator imported")

    print("\n🎉 Basic backend tests passed!")
    print("\n📋 Next steps:")
    print("1. Install dependencies: pip install -r backend/requirements.txt")
    print("2. Run Flask server: python backend/app.py")
    print("3. Install frontend: cd frontend && npm install")
    print("4. Start frontend: npm run dev")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)