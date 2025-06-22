import logging
import logging.handlers
import os
from datetime import datetime


def setup_comprehensive_logging(app):
    """
    Set up comprehensive logging for the Flask application
    """
    # Create logs directory if it doesn't exist
    logs_dir = os.path.join(app.config['BASE_DIR'], 'logs')
    os.makedirs(logs_dir, exist_ok=True)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(funcName)s() | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # 1. Console Handler (for development)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    root_logger.addHandler(console_handler)
    
    # 2. Application Log File (rotating)
    app_log_file = os.path.join(logs_dir, 'grc_application.log')
    app_file_handler = logging.handlers.RotatingFileHandler(
        app_log_file,
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    app_file_handler.setLevel(logging.DEBUG)
    app_file_handler.setFormatter(detailed_formatter)
    root_logger.addHandler(app_file_handler)
    
    # 3. Error Log File (errors only)
    error_log_file = os.path.join(logs_dir, 'grc_errors.log')
    error_file_handler = logging.handlers.RotatingFileHandler(
        error_log_file,
        maxBytes=5*1024*1024,  # 5MB
        backupCount=3
    )
    error_file_handler.setLevel(logging.ERROR)
    error_file_handler.setFormatter(detailed_formatter)
    root_logger.addHandler(error_file_handler)
    
    # 4. Database Log File
    db_log_file = os.path.join(logs_dir, 'grc_database.log')
    db_file_handler = logging.handlers.RotatingFileHandler(
        db_log_file,
        maxBytes=5*1024*1024,  # 5MB
        backupCount=3
    )
    db_file_handler.setLevel(logging.INFO)
    db_file_handler.setFormatter(detailed_formatter)
    
    # Set specific logger for SQLAlchemy
    db_logger = logging.getLogger('sqlalchemy.engine')
    db_logger.addHandler(db_file_handler)
    db_logger.setLevel(logging.INFO)
    
    # 5. API Access Log
    api_log_file = os.path.join(logs_dir, 'grc_api_access.log')
    api_file_handler = logging.handlers.RotatingFileHandler(
        api_log_file,
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    api_file_handler.setLevel(logging.INFO)
    api_file_handler.setFormatter(detailed_formatter)
    
    # Create API logger
    api_logger = logging.getLogger('grc.api')
    api_logger.addHandler(api_file_handler)
    api_logger.setLevel(logging.INFO)
    
    # 6. Authentication Log
    auth_log_file = os.path.join(logs_dir, 'grc_auth.log')
    auth_file_handler = logging.handlers.RotatingFileHandler(
        auth_log_file,
        maxBytes=5*1024*1024,  # 5MB
        backupCount=3
    )
    auth_file_handler.setLevel(logging.INFO)
    auth_file_handler.setFormatter(detailed_formatter)
    
    # Create auth logger
    auth_logger = logging.getLogger('grc.auth')
    auth_logger.addHandler(auth_file_handler)
    auth_logger.setLevel(logging.INFO)
    
    # Add request logging middleware
    @app.before_request
    def log_request_info():
        from flask import request
        api_logger = logging.getLogger('grc.api')
        api_logger.info(f"Request: {request.method} {request.url} | IP: {request.remote_addr} | User-Agent: {request.headers.get('User-Agent', 'Unknown')}")
    
    @app.after_request
    def log_response_info(response):
        from flask import request
        api_logger = logging.getLogger('grc.api')
        api_logger.info(f"Response: {request.method} {request.url} | Status: {response.status_code} | Size: {response.content_length or 0} bytes")
        return response
    
    # Log startup information
    app_logger = logging.getLogger('grc.startup')
    app_logger.info("="*80)
    app_logger.info("GRC PLATFORM STARTING UP")
    app_logger.info("="*80)
    app_logger.info(f"Application started at: {datetime.now()}")
    app_logger.info(f"Flask Environment: {app.config.get('FLASK_ENV', 'production')}")
    app_logger.info(f"Debug Mode: {app.debug}")
    app_logger.info(f"Database URI: {app.config.get('SQLALCHEMY_DATABASE_URI', 'Not configured')[:50]}...")
    app_logger.info(f"Host: {app.config.get('HOST_NAME', 'localhost')}")
    app_logger.info(f"Port: {app.config.get('PORT', 3000)}")
    app_logger.info(f"Log Directory: {logs_dir}")
    app_logger.info("="*80)
    
    return {
        'app_logger': logging.getLogger('grc.app'),
        'api_logger': logging.getLogger('grc.api'),
        'auth_logger': logging.getLogger('grc.auth'),
        'db_logger': logging.getLogger('grc.database'),
        'startup_logger': logging.getLogger('grc.startup')
    }


def log_application_health():
    """
    Log application health metrics
    """
    import psutil
    from flask import current_app
    
    health_logger = logging.getLogger('grc.health')
    
    # System metrics
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    health_logger.info("=== APPLICATION HEALTH CHECK ===")
    health_logger.info(f"CPU Usage: {cpu_percent}%")
    health_logger.info(f"Memory Usage: {memory.percent}% ({memory.used // 1024 // 1024}MB used / {memory.total // 1024 // 1024}MB total)")
    health_logger.info(f"Disk Usage: {disk.percent}% ({disk.used // 1024 // 1024 // 1024}GB used / {disk.total // 1024 // 1024 // 1024}GB total)")
    
    # Database connection test
    try:
        from app import db
        with current_app.app_context():
            db.engine.execute('SELECT 1')
        health_logger.info("Database Connection: OK")
    except Exception as e:
        health_logger.error(f"Database Connection: FAILED - {str(e)}")
    
    health_logger.info("=== END HEALTH CHECK ===")


def get_logger(name):
    """
    Get a logger with the specified name
    """
    return logging.getLogger(f'grc.{name}')