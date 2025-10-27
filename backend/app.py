from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import os
from datetime import datetime
import tempfile

from models import SafetyNetConfig, MaterialType, MaterialConfig
from analyzer import SafetyNetAnalyzer
from report_generator import ReportGenerator

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration directories
CONFIG_DIR = "/app/configs"
REPORT_DIR = "/app/reports"

# Ensure directories exist
os.makedirs(os.path.join(CONFIG_DIR, "materials"), exist_ok=True)
os.makedirs(os.path.join(CONFIG_DIR, "scenarios"), exist_ok=True)
os.makedirs(os.path.join(CONFIG_DIR, "user_configs"), exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

# Global analyzer instance
analyzer = SafetyNetAnalyzer()

@app.route('/api')
def api_home():
    """API home endpoint"""
    return jsonify({
        "message": "Safety Net Analysis API",
        "version": "1.0.0",
        "endpoints": [
            "/api/config/presets - Get preset scenarios",
            "/api/config/materials - Get material types",
            "/api/config/save - Save configuration",
            "/api/config/load - Load configuration",
            "/api/analyze - Run analysis",
            "/api/plots - Generate plots",
            "/api/report - Generate HTML report"
        ]
    })

@app.route('/api/config/presets', methods=['GET'])
def get_presets():
    """Get available preset scenarios"""
    presets = SafetyNetConfig._get_preset_scenarios()
    return jsonify({
        "presets": presets,
        "count": len(presets)
    })

@app.route('/api/config/materials', methods=['GET'])
def get_materials():
    """Get available material types"""
    materials = {}
    for material_type in MaterialType:
        material_config = MaterialConfig.from_preset(material_type)
        materials[material_type.value] = {
            "name": material_config.name,
            "elastic_modulus": material_config.elastic_modulus,
            "yield_strength": material_config.yield_strength,
            "density": material_config.density,
            "cross_section_area": material_config.cross_section_area,
            "strain_limit": material_config.strain_limit
        }

    return jsonify({
        "materials": materials,
        "count": len(materials)
    })

@app.route('/api/config/load/<preset_name>', methods=['GET'])
def load_preset(preset_name):
    """Load a preset configuration"""
    try:
        config = SafetyNetConfig.from_preset(preset_name)
        return jsonify({
            "success": True,
            "config": config.to_dict()
        })
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

@app.route('/api/config/save', methods=['POST'])
def save_config():
    """Save configuration to file"""
    try:
        config_data = request.json
        config = SafetyNetConfig.from_dict(config_data)

        # Validate configuration
        errors = config.validate()
        if errors:
            return jsonify({
                "success": False,
                "errors": errors
            }), 400

        # Save to file
        filename = f"{config._scenario_name.replace(' ', '_').lower()}_config.json"
        filepath = os.path.join(CONFIG_DIR, "user_configs", filename)
        config.to_json(filepath)

        return jsonify({
            "success": True,
            "message": f"Configuration saved as {filename}",
            "filepath": filepath
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/config/load', methods=['POST'])
def load_config():
    """Load configuration from file"""
    try:
        data = request.json
        filepath = data.get('filepath')

        if not filepath:
            return jsonify({
                "success": False,
                "error": "Filepath is required"
            }), 400

        config = SafetyNetConfig.from_json(filepath)

        return jsonify({
            "success": True,
            "config": config.to_dict()
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Run safety net analysis"""
    try:
        config_data = request.json
        config = SafetyNetConfig.from_dict(config_data)

        # Update analyzer configuration
        analyzer.update_config(config)

        # Run analysis
        results = analyzer.analyze()

        return jsonify({
            "success": True,
            "results": results
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/plots', methods=['POST'])
def generate_plots():
    """Generate analysis plots"""
    try:
        config_data = request.json
        config = SafetyNetConfig.from_dict(config_data)

        # Update analyzer and run analysis
        analyzer.update_config(config)
        analyzer.analyze()

        # Generate plots
        plots = analyzer.generate_plots()

        return jsonify({
            "success": True,
            "plots": plots
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/report', methods=['POST'])
def generate_report():
    """Generate HTML report"""
    try:
        config_data = request.json
        config = SafetyNetConfig.from_dict(config_data)

        # Update analyzer and run analysis
        analyzer.update_config(config)
        analyzer.analyze()

        # Generate report
        report_generator = ReportGenerator()
        report_data = analyzer.generate_report_data()

        # Create temporary file for report
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
            html_content = report_generator.generate_html_report(report_data)
            f.write(html_content)
            temp_filepath = f.name

        # Return file download
        return send_file(
            temp_filepath,
            as_attachment=True,
            download_name=f"safety_net_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html",
            mimetype='text/html'
        )

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/config/list', methods=['GET'])
def list_configs():
    """List all saved configurations"""
    try:
        config_files = []
        user_configs_dir = os.path.join(CONFIG_DIR, "user_configs")

        if os.path.exists(user_configs_dir):
            for filename in os.listdir(user_configs_dir):
                if filename.endswith('_config.json'):
                    filepath = os.path.join(user_configs_dir, filename)
                    config_files.append({
                        "filename": filename,
                        "filepath": filepath,
                        "size": os.path.getsize(filepath)
                    })

        return jsonify({
            "success": True,
            "configs": config_files,
            "count": len(config_files)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/')
@app.route('/<path:path>')
def serve_frontend(path=''):
    """Serve the React frontend from root route"""
    frontend_dir = os.path.join(os.path.dirname(__file__), '../frontend/dist')

    # If no path specified, serve index.html
    if not path:
        return send_file(os.path.join(frontend_dir, 'index.html'))

    # Try to serve the requested file
    file_path = os.path.join(frontend_dir, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_file(file_path)

    # If file doesn't exist, serve index.html (for React Router)
    return send_file(os.path.join(frontend_dir, 'index.html'))

@app.route('/assets/<path:path>')
def serve_assets(path):
    """Serve frontend static assets"""
    frontend_dir = os.path.join(os.path.dirname(__file__), '../frontend/dist')
    file_path = os.path.join(frontend_dir, 'assets', path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_file(file_path)
    return "Asset not found", 404

@app.route('/vite.svg')
def serve_vite_icon():
    """Serve Vite icon"""
    frontend_dir = os.path.join(os.path.dirname(__file__), '../frontend/dist')
    file_path = os.path.join(frontend_dir, 'vite.svg')
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_file(file_path)
    return "Icon not found", 404

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    # Development server
    app.run(debug=True, host='0.0.0.0', port=5000)
else:
    # Production server (for Docker)
    from waitress import serve

    def run_production():
        serve(app, host='0.0.0.0', port=5000)