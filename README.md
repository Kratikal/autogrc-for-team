# AutoGRC - SOC 2 Audit Controls Management System

A comprehensive Security compliance platform that makes it easy to track your progress against various security frameworks, with enhanced SOC 2 audit functionality and bulk control management capabilities.

🏠 **Interested in contacting us?** Please join our [discord](https://discord.gg/9unhWAqadg)  
🔗 **Original Gapps Project**: [Gapps site](https://web-gapps.pages.dev/)

## 🚀 Recent Enhancements

This repository contains significant improvements and bug fixes for SOC 2 audit management:

### ✅ **localStorage Quota Fix**
- **Problem**: Controls data (~9.5MB) exceeded browser localStorage limits (5-10MB)
- **Solution**: Removed localStorage caching for controls, now fetches from API each time
- **Files Modified**: `app/templates/view_project.html`
- **Impact**: Eliminates "localStorage quota exceeded" errors

### 🔄 **Bulk Update Functionality** 
- **New Script**: `bulk_update_controls_fully_implemented.js`
- **Capability**: Update all 246 subcontrols to "fully implemented" status in one operation
- **Features**: Batch processing, progress tracking, error handling, verification
- **Success Rate**: 100% (246/246 subcontrols updated successfully)

### 📊 **Implementation Status Management**
- **API Endpoint**: `PUT /project-controls/{control_id}/subcontrols/{subcontrol_id}`
- **Status Values**: 
  - `implemented: 0` → "not implemented"
  - `implemented: 1-99` → "partially implemented" 
  - `implemented: 100` → "fully implemented"
  - `applicable: false` → "not applicable"
- **Demo Scripts**: Complete API usage examples for subcontrol updates

### 🛠 **MCP Tools Integration**
- **Tools Available**: `grc_update_subcontrol_status`, `grc_associate_evidence_with_subcontrol`
- **Testing Scripts**: Comprehensive MCP functionality validation
- **Server**: `mcp-server.js` with authentication and error handling

## 📁 **Key Files Added/Modified**

### Core Functionality
- `bulk_update_controls_fully_implemented.js` - Bulk status updates
- `update_implementation_status.js` - Implementation status API demo
- `clear_localStorage.js` - Cleanup script for cached data
- `app/templates/view_project.html` - localStorage quota fixes

### Testing & Validation
- `test_mcp_control_fetching.js` - MCP functionality tests
- `test_subcontrol_api.js` - API endpoint validation
- `verify_results.js` - Update verification script

### Documentation & Analysis
- `github_setup_instructions.md` - Repository setup guide
- Various analysis and progress reports (*.md files)

## 🏗 **Architecture & Frameworks**

### Supported Frameworks
- **SOC2** ✅ (Primary focus)
- NIST CSF, NIST-800-53, CMMC, HIPAA, ASVS
- ISO27001, CSC CIS18, PCI DSS, SSF
- **Total**: 10 security frameworks

### Features
- Multi-tenancy with OIDC (SSO)
- Auditor collaboration tools
- Risk Register management
- S3/GCS file storage integration
- Real-time progress tracking

## 🚀 **Getting Started**

### Prerequisites
- Docker & Docker Compose
- Node.js (for scripts)
- PostgreSQL database

### Quick Start
1. **Clone the repository**
```bash
git clone https://github.com/Kratikal/autogrc-controls.git
cd autogrc-controls
```

2. **Start with Docker**
```bash
docker-compose up -d
```

3. **Access the application**
- URL: http://localhost:3000
- Default credentials: Check documentation

### Development Setup
```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Set environment variables
export POSTGRES_HOST=localhost
export POSTGRES_PASSWORD=db1
export POSTGRES_USER=db1
export POSTGRES_DB=db1
export SQLALCHEMY_DATABASE_URI="postgresql://db1:db1@localhost/db1"

# Run in development mode
export FLASK_CONFIG=development
bash run.sh
```

## 🔧 **SOC 2 Management Scripts**

### Bulk Update All Controls
```bash
# Preview changes (dry run)
node bulk_update_controls_fully_implemented.js --dry-run

# Update all controls to "fully implemented"
node bulk_update_controls_fully_implemented.js
```

### Individual Control Updates
```bash
# Test API endpoints
node test_subcontrol_api.js

# Demo implementation status changes
node update_implementation_status.js
```

### Clear localStorage Cache
```bash
# Clean existing cache data
node clear_localStorage.js
```

## 📊 **Current SOC 2 Project Status**

- **Total Controls**: 61
- **Total Subcontrols**: 297 (246 applicable)
- **Implementation Status**: 100% fully implemented ✅
- **Evidence Associations**: Comprehensive mapping
- **localStorage Issues**: Resolved ✅

## 🔗 **API Endpoints**

### Subcontrol Management
```bash
# Get specific subcontrol
GET /projects/{pid}/subcontrols/{sid}

# Update subcontrol (implementation status, owner, notes)
PUT /project-controls/{cid}/subcontrols/{sid}

# Update notes only
PUT /projects/{pid}/subcontrols/{sid}/notes

# Add evidence
POST /projects/{pid}/subcontrols/{sid}/evidence
```

### Example API Usage
```javascript
// Update to "fully implemented"
const payload = {
  implemented: 100,
  notes: "All requirements satisfied",
  context: "Implementation completed",
  "owner-id": "user_id_here"
};

fetch('/api/v1/project-controls/CONTROL_ID/subcontrols/SUBCONTROL_ID', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

## 🔐 **Authentication**

### API Token Generation
```bash
# Create 15-minute token
curl http://localhost:3000/api/v1/token

# Create 30-second token  
curl http://localhost:3000/api/v1/token?expiration=30

# Create permanent token
curl http://localhost:3000/api/v1/token?expiration=0
```

### Using API Tokens
```bash
TOKEN="your_token_here"
curl http://localhost:3000/api/v1/tenants -H "token: $TOKEN"
```

## 🔍 **Troubleshooting**

### Database Connection Issues
```bash
# Reset environment variables
unset SQLALCHEMY_DATABASE_URI
unset POSTGRES_HOST

# Or set correct values
export POSTGRES_HOST=postgres
export SQLALCHEMY_DATABASE_URI="postgresql://db1:db1@postgres/db1"
```

### localStorage Quota Errors
- **Fixed**: No longer caches controls data in localStorage
- **Cleanup**: Run `node clear_localStorage.js` to remove old cache
- **Verification**: Check browser console for localStorage errors

### Performance Optimization
- Controls now fetch from server (no localStorage bottleneck)
- Bulk operations process in batches with delays
- API responses optimized for large datasets

## 📈 **Performance Metrics**

- **Controls Data Size**: ~9.5MB (too large for localStorage)
- **Bulk Update Speed**: 246 subcontrols in ~4 minutes (batched)
- **API Response Time**: Optimized for large control datasets
- **Memory Usage**: Reduced by removing localStorage cache

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially localStorage and API functionality)
5. Submit a pull request

## 📄 **License**

This project builds upon the original Gapps platform with significant enhancements for SOC 2 audit management.

## 🙏 **Acknowledgments**

- Original Gapps project by bmarsh9
- Enhanced SOC 2 functionality and localStorage fixes
- MCP tools integration and bulk update capabilities
- Comprehensive API testing and validation

---

**For detailed setup and usage instructions, see the [documentation](https://web-gapps.pages.dev/docs)**