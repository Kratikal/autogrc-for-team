# GRC Platform API Documentation

## Overview
Complete API documentation for the GRC (Governance, Risk, and Compliance) Platform with **200+ endpoints** across 10 functional areas.

## Quick Start

### Authentication
Generate JWT token:
```bash
curl -X GET "https://your-platform.com/api/v1/token?expiration=3600" \
  -H "Cookie: session=your_session_cookie"
```

Use token in requests:
```bash
curl -H "token: your_jwt_token" https://your-platform.com/api/v1/tenants
```

## API Categories

### 🔐 Authentication & Session (8 endpoints)
- Health check, feature flags, token generation
- Session management, OAuth flows
- **Key**: `/api/v1/token` - Generate JWT tokens

### 👥 User Management (12 endpoints)  
- User CRUD operations, password management
- Email verification, admin functions
- **Key**: `/api/v1/users/{id}` - User operations

### 🏢 Tenant Management (15 endpoints)
- Multi-tenant operations, user roles
- Tenant settings, audit logs
- **Key**: `/api/v1/tenants` - Tenant operations

### 📋 Project Management (25+ endpoints)
- Compliance project lifecycle
- Member management, reporting
- **Key**: `/api/v1/projects/{id}` - Project operations

### ✅ Controls & Compliance (30+ endpoints)
- Framework management (SOC2, ISO27001, CMMC)
- Control status tracking, subcontrols
- **Key**: `/api/v1/controls/{id}/status` - Control updates

### 📎 Evidence Management (20+ endpoints)
- Evidence upload, association with controls
- File management, evidence tracking
- **Key**: `/api/v1/evidence/{id}` - Evidence operations

### 🏭 Vendor & Risk Management (25+ endpoints)
- Vendor onboarding, risk registers
- Applications, risk assessment
- **Key**: `/api/v1/vendors/{id}` - Vendor operations

### 📊 Assessment & Forms (40+ endpoints)
- Vendor assessments, form templates
- Response tracking, review workflows
- **Key**: `/api/v1/assessments/{id}` - Assessment operations

### 📜 Frameworks & Policies (20+ endpoints)
- Policy management, version control
- Framework-policy associations
- **Key**: `/api/v1/policies/{id}` - Policy operations

### 💬 Comments & Collaboration (15+ endpoints)
- Project/control comments, feedback
- Auditor collaboration, messages
- **Key**: `/api/v1/projects/{id}/comments` - Collaboration

## Files Created

### 1. `fastapi_documentation.py`
- Complete FastAPI specification with all 200+ endpoints
- Pydantic models for request/response validation
- Authentication dependencies and security schemes
- Comprehensive API documentation with examples

### 2. `mcp_tools_config.json`
- MCP (Model Context Protocol) tool definitions
- 30+ high-level tools for common GRC operations
- Authentication setup instructions
- Complete workflow examples

### 3. `API_SUMMARY.md` (this file)
- Quick reference guide
- API overview and getting started
- File descriptions and usage

## Authentication Methods

1. **JWT Tokens** (Recommended for APIs)
   - Header: `token: <JWT_TOKEN>`
   - Generate: `GET /api/v1/token?expiration=3600`

2. **Session-based** (Web interface)
   - Standard Flask-Login sessions
   - Cookie-based authentication

3. **OAuth2/OIDC**
   - Google OAuth
   - Microsoft OAuth

## Common Workflows

### 1. Compliance Project Setup
```bash
# 1. Create tenant
POST /api/v1/tenants
{"name": "Acme Corp", "contact_email": "admin@acme.com"}

# 2. Create SOC2 project  
POST /api/v1/tenants/{tenant_id}/projects
{"name": "SOC2 Audit 2024", "framework": "soc2"}

# 3. Get project controls
GET /api/v1/projects/{project_id}/controls

# 4. Update control status
PUT /api/v1/controls/{control_id}/status
{"status": "completed", "notes": "Control implemented"}
```

### 2. Evidence Management
```bash
# 1. Create evidence
POST /api/v1/projects/{project_id}/evidence
{"title": "Security Policy", "description": "Company security policy"}

# 2. Associate with controls
PUT /api/v1/evidence/{evidence_id}/controls
{"control_ids": ["ctrl1", "ctrl2"]}
```

### 3. Vendor Risk Assessment
```bash
# 1. Create vendor
POST /api/v1/tenants/{tenant_id}/vendors
{"name": "Cloud Provider", "contact_email": "security@provider.com"}

# 2. Create risk
POST /api/v1/tenants/{tenant_id}/risks  
{"title": "Vendor Data Risk", "risk_level": "medium"}
```

## MCP Tools Usage

The `mcp_tools_config.json` provides 30+ tools for common operations:

```python
# Health check
grc_health_check()

# Create compliance project
grc_create_project(tenant_id="tenant123", name="SOC2 Audit", framework="soc2")

# Update control status
grc_update_control_status(control_id="ctrl123", status="completed")

# Create evidence
grc_create_evidence(project_id="proj123", title="Security Policy")
```

## Authorization Model

- **Multi-tenant** with granular permissions
- **Role-based access control** (RBAC)
- **Resource-level** authorization
- **Super admin** capabilities for platform management

## Response Formats

All endpoints return JSON with consistent patterns:
- **Success**: `{"message": "ok"}` or requested data
- **Error**: `{"ok": false, "message": "error", "code": 400}`
- **Models**: Serialized using `.as_dict()` methods

## Getting Started

1. **Run FastAPI Documentation**:
   ```bash
   cd /path/to/gapps
   python fastapi_documentation.py
   # Visit http://localhost:8000/docs
   ```

2. **Use MCP Tools**: Configure `mcp_tools_config.json` in your MCP client

3. **Explore**: Use the interactive FastAPI docs to test endpoints

This documentation provides everything needed to integrate with the GRC platform APIs programmatically.