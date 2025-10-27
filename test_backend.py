#!/usr/bin/env python3
"""
Quick test script to verify the backend functionality
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from models import SafetyNetConfig, MaterialType
    from analyzer import SafetyNetAnalyzer

    print("✅ Backend modules imported successfully")

    # Test configuration
    config = SafetyNetConfig.from_preset("light_worker")
    print(f"✅ Configuration loaded: {config._scenario_name}")

    # Test analyzer
    analyzer = SafetyNetAnalyzer(config)
    results = analyzer.analyze()
    print(f"✅ Analysis completed successfully")
    print(f"   Safety Factor: {results['structural_response']['safety_factor']:.2f}")
    print(f"   Max Deflection: {results['structural_response']['max_deflection']:.3f} m")
    print(f"   Overall Safe: {results['design_checks']['overall_safe']}")

    # Test report generation
    from report_generator import ReportGenerator
    report_gen = ReportGenerator()
    report_data = analyzer.generate_report_data()
    html_report = report_gen.generate_html_report(report_data)
    print(f"✅ HTML report generated ({len(html_report)} bytes)")

    print("\n🎉 All backend tests passed!")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)