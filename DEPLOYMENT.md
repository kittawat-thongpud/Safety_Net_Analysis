# Deployment Guide

## 🐳 Docker Deployment (Recommended)

### Production Deployment

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   Open http://localhost:5000 in your browser

3. **Stop the application**:
   ```bash
   docker-compose down
   ```

### Development Environment

1. **Start development servers**:
   ```bash
   docker-compose -f docker-compose.yml up safety-net-dev
   ```

2. **Access development servers**:
   - Backend API: http://localhost:5000
   - Frontend Dev Server: http://localhost:3001

## 🔧 Manual Deployment

### Backend Setup

1. **Install Python 3.11+**

2. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Run the Flask server**:
   ```bash
   python app.py
   ```

   The API will be available at http://localhost:5000

### Frontend Setup

1. **Install Node.js 18+**

2. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at http://localhost:3000

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🌐 Production Deployment

### Using Docker in Production

1. **Build the production image**:
   ```bash
   docker build -t safety-net-app .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 5000:5000 \
     -v $(pwd)/configs:/app/configs \
     -v $(pwd)/reports:/app/reports \
     safety-net-app
   ```

### Using a Reverse Proxy (nginx)

Example nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔒 Environment Configuration

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**:
   ```bash
   # Edit .env file
   FLASK_ENV=production
   SECRET_KEY=your-secret-key-here
   ```

## 📊 Health Checks

- **API Health**: http://localhost:5000/health
- **Frontend**: http://localhost:3000 (development) or http://localhost:5000 (production)

## 🗄️ Data Persistence

- **Configurations**: Stored in `./configs/` directory
- **Reports**: Generated in `./reports/` directory
- **Docker Volumes**: Mount these directories for data persistence

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**:
   - Change ports in `docker-compose.yml`
   - Use different ports for development and production

2. **Dependencies issues**:
   - Clear Docker cache: `docker system prune`
   - Rebuild images: `docker-compose build --no-cache`

3. **File permissions**:
   - Ensure write permissions for `configs/` and `reports/` directories

### Logs

- **Docker logs**: `docker-compose logs -f`
- **Backend logs**: Check Flask console output
- **Frontend logs**: Check browser developer console

## 📈 Monitoring

- **Application**: Built-in health check endpoint
- **System**: Use Docker monitoring tools
- **Performance**: Monitor API response times and memory usage

## 🔄 Updates

1. **Pull latest changes**
2. **Rebuild containers**: `docker-compose up --build`
3. **Migrate data** if needed (configurations are versioned)

## 🚀 Scaling

For high-traffic deployments:
- Use multiple backend instances with a load balancer
- Configure Redis for session storage
- Use a production WSGI server (Gunicorn)
- Set up database for configuration storage