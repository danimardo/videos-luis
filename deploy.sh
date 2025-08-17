#!/bin/bash

# Video Markers App - Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        log_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        log_warning "Please edit .env file with your configurations before continuing."
        read -p "Press Enter to continue after editing .env file..."
    fi
    log_success ".env file found"
}

# Build and start services
deploy() {
    local profile=${1:-""}
    
    log_info "Starting deployment..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down
    
    # Build images
    log_info "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    if [ "$profile" = "production" ]; then
        log_info "Starting services in production mode (with Nginx)..."
        docker-compose --profile production up -d
    else
        log_info "Starting services in development mode..."
        docker-compose up -d
    fi
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    check_health
}

# Check service health
check_health() {
    log_info "Checking service health..."
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        log_success "Containers are running"
    else
        log_error "Some containers are not running"
        docker-compose ps
        exit 1
    fi
    
    # Check application health
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:3011/markers > /dev/null 2>&1; then
            log_success "Application is responding"
            break
        else
            log_info "Waiting for application to start... (attempt $attempt/$max_attempts)"
            sleep 2
            ((attempt++))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "Application failed to start within expected time"
        log_info "Checking logs..."
        docker-compose logs app
        exit 1
    fi
}

# Show deployment info
show_info() {
    log_success "Deployment completed successfully!"
    echo
    echo "🌐 Application URLs:"
    echo "   - Main App: http://localhost:3011"
    echo "   - API: http://localhost:3011/markers"
    echo
    echo "📊 Useful commands:"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Check status: docker-compose ps"
    echo "   - Stop services: docker-compose down"
    echo "   - Restart: docker-compose restart"
    echo
    echo "📁 Database:"
    echo "   - Host: localhost:3306"
    echo "   - Database: video_markers"
    echo "   - User: appuser"
    echo
}

# Backup database
backup_db() {
    local backup_file="backup-$(date +%Y%m%d-%H%M%S).sql"
    log_info "Creating database backup: $backup_file"
    
    docker-compose exec -T database mysqldump -u root -p"${DB_ROOT_PASSWORD:-rootpassword123}" video_markers > "$backup_file"
    
    if [ $? -eq 0 ]; then
        log_success "Backup created: $backup_file"
    else
        log_error "Backup failed"
        exit 1
    fi
}

# Update application
update() {
    log_info "Updating application..."
    
    # Create backup first
    backup_db
    
    # Pull latest changes (if using git)
    if [ -d .git ]; then
        log_info "Pulling latest changes from git..."
        git pull
    fi
    
    # Rebuild and restart
    log_info "Rebuilding application..."
    docker-compose build app
    docker-compose up -d app
    
    # Check health
    check_health
    
    log_success "Application updated successfully!"
}

# Show usage
usage() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  deploy [production]  Deploy the application (add 'production' for production mode)"
    echo "  update              Update the application"
    echo "  backup              Create database backup"
    echo "  logs                Show application logs"
    echo "  status              Show service status"
    echo "  stop                Stop all services"
    echo "  restart             Restart all services"
    echo "  clean               Stop and remove all containers and volumes"
    echo "  help                Show this help message"
    echo
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        check_docker
        check_env
        deploy "$2"
        show_info
        ;;
    "update")
        check_docker
        update
        ;;
    "backup")
        backup_db
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    "stop")
        log_info "Stopping all services..."
        docker-compose down
        log_success "Services stopped"
        ;;
    "restart")
        log_info "Restarting services..."
        docker-compose restart
        check_health
        log_success "Services restarted"
        ;;
    "clean")
        log_warning "This will remove all containers and data. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            docker-compose down -v
            docker system prune -f
            log_success "Cleanup completed"
        else
            log_info "Cleanup cancelled"
        fi
        ;;
    "help"|"-h"|"--help")
        usage
        ;;
    *)
        log_error "Unknown command: $1"
        usage
        exit 1
        ;;
esac
