# Safety Net Analysis System

A comprehensive web-based application for analyzing the load-bearing capacity of safety net systems used in fall protection.

## 🚀 Features

- **Web-based Interface**: Modern React frontend with real-time configuration
- **JSON Configuration**: Flexible material and scenario configuration system
- **Advanced Analysis**: Mathematical framework based on energy conservation principles
- **Interactive Visualizations**: Plotly charts for force-deflection curves, stress distribution, and more
- **Professional Reports**: HTML reports with embedded charts and recommendations
- **Client-side Processing**: All calculations performed in the browser
- **Cloudflare Deployment**: Fast, global deployment with zero backend infrastructure

## 🏗️ Architecture

### Pure Vite + React Application
- **Client-side Analysis**: All calculations performed in the browser using JavaScript
- **Static Frontend**: Built React frontend deployed to Cloudflare Pages
- **JSON Configuration**: Flexible material and scenario configuration system
- **Mathematical Analysis Engine**: Core analysis based on energy conservation principles
- **Report Generation**: Professional HTML reports with embedded visualizations
- **No Backend Required**: Zero server infrastructure needed

## 📊 Analysis Capabilities

- **Impact Analysis**: Dynamic response to falling objects
- **Stress Calculation**: Maximum stress in net strands
- **Safety Factor**: Comparison against design requirements
- **Deflection Limits**: Verification against maximum allowable deflection
- **Material Properties**: Support for various net materials (nylon, polyester, steel, etc.)

## 🚀 Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the web interface**:
   Open http://localhost:3000 in your browser

4. **Quick test steps**:
   - In the **Configuration** tab:
     - Select "Light Construction" from the "Load Preset Scenario" dropdown
     - Or choose "Custom Configuration" for manual setup
   - Click **🚀 Run Analysis** to perform calculations
   - Switch to **Results** tab to see safety factors and design checks
   - Click **📈 Generate Plots** to create visualizations
   - Switch to **Visualization** tab to view interactive charts
   - Click **📋 Generate Report** to download an HTML report

### Cloudflare Pages Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages**:
   ```bash
   npm run deploy
   ```

3. **Alternative: Deploy using Wrangler directly**:
   ```bash
   wrangler pages deploy dist
   ```

## 🔧 Manual Setup

### Backend Setup

1. **Install Python dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the Flask server**:
   ```bash
   python app.py
   ```

### Frontend Setup (For Development)

> **Note**: The frontend is now served as static files by Flask. For development, you can still run the frontend separately:

1. **Install Node.js dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Build the frontend**:
   ```bash
   npm run build
   ```

3. **For development with hot reloading**:
   ```bash
   npm run dev
   ```
   Access at: http://localhost:3000

## 📁 Project Structure

```
safety-net-analysis/
├── src/                    # React application source
│   ├── components/         # React components
│   │   ├── ConfigurationForm.jsx
│   │   ├── AnalysisResults.jsx
│   │   ├── VisualizationDashboard.jsx
│   │   ├── ReportGenerator.jsx
│   │   └── Header.jsx
│   ├── utils/
│   │   └── safetyNetAnalyzer.js  # Core analysis engine (JavaScript)
│   ├── styles/             # CSS styles
│   ├── App.jsx             # Main React application
│   └── main.jsx            # Application entry point
├── dist/                   # Built application (for deployment)
├── package.json            # Node.js dependencies and scripts
├── vite.config.js          # Vite configuration
├── wrangler.toml           # Cloudflare Wrangler configuration
└── README.md
```

## 🔍 Usage Guide

### 1. Configuration
- Select from preset scenarios or create custom configurations
- Choose material properties (nylon, polyester, steel, etc.)
- Define geometric parameters (net span, number of strands)
- Set impact scenario (mass, fall height)

### 2. Analysis
- Run the analysis to calculate structural response
- View safety factors, deflection, and stress results
- Check design verification against limits

### 3. Visualization
- Generate interactive plots:
  - Force-deflection curves
  - Safety factor analysis
  - Stress distribution
  - Deflection vs time

### 4. Reporting
- Generate comprehensive HTML reports
- Download reports with embedded visualizations
- Share analysis results with stakeholders

## 📊 Mathematical Framework

The analysis is based on:
- Energy conservation principles during impact
- Nonlinear force-deflection relationships
- Material stress-strain behavior
- Dynamic response calculations

Key equations include:
- Impact velocity: $v_0 = \sqrt{2gh}$
- Energy balance: $KE = SE + E_{diss}$
- Nonlinear stiffness: $F(\delta) = k_1\delta + k_2\delta^2 + k_3\delta^3$
- Safety factor: $SF = \frac{\sigma_{yield}}{\sigma_{max}}$

## 🔒 Safety Standards

The system incorporates design criteria from:
- ASTM E2480-12 (Outdoor Fall Impact Test)
- European Standard EN 1263-1:2014
- Industry best practices for fall protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] 3D visualization of net deformation
- [ ] Multi-impact scenario analysis
- [ ] Advanced material models
- [ ] Export to CAD formats
- [ ] Integration with structural analysis software