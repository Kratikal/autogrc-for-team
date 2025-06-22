# GRC Platform MCP Setup for Claude Desktop

This guide shows how to integrate the GRC Platform APIs with Claude Desktop using MCP (Model Context Protocol).

## Quick Setup

### 1. Install Dependencies
```bash
cd /Users/kratikal/autogrc.ai/tools/gapps-js/gapps
npm install @modelcontextprotocol/sdk axios
```

### 2. Get Your API Token
1. Login to the GRC Platform: http://localhost:3000
   - Email: admin@example.com
   - Password: admin1234567

2. Generate API token: http://localhost:3000/api/v1/token
   - Copy the token from the response

### 3. Update Configuration
Edit the `claude_desktop_config.json` file and replace `YOUR_JWT_TOKEN_HERE` with your actual token:

```json
{
  "mcpServers": {
    "grc-platform": {
      "command": "node",
      "args": ["/Users/kratikal/autogrc.ai/tools/gapps-js/gapps/mcp-server.js"],
      "env": {
        "GRC_API_BASE_URL": "http://localhost:3000/api/v1",
        "GRC_AUTH_TOKEN": "your_actual_jwt_token_here"
      }
    }
  }
}
```

### 4. Add to Claude Desktop
Copy the contents of `claude_desktop_config.json` to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

### 5. Restart Claude Desktop
Restart Claude Desktop to load the new MCP server.

## Available Tools

Once configured, you'll have access to these GRC tools in Claude Desktop:

### Core Operations
- `grc_health_check` - Check platform status
- `grc_generate_token` - Generate new API tokens

### Tenant Management
- `grc_get_tenants` - List all tenants
- `grc_create_tenant` - Create new tenant

### Project Management
- `grc_get_projects` - Get tenant projects
- `grc_create_project` - Create compliance projects (SOC2, ISO27001, CMMC)

### Controls & Compliance
- `grc_get_controls` - Get project controls
- `grc_update_control_status` - Update control implementation status

### Evidence Management
- `grc_get_evidence` - Get project evidence
- `grc_create_evidence` - Create evidence entries

### Vendor Management
- `grc_get_vendors` - Get tenant vendors
- `grc_create_vendor` - Create vendor entries

### Risk Management
- `grc_get_risks` - Get tenant risks
- `grc_create_risk` - Create risk entries

### Policy Management
- `grc_get_policies` - Get tenant policies
- `grc_create_policy` - Create policy documents

## Example Usage in Claude Desktop

Once set up, you can ask Claude to:

- "Create a new SOC2 compliance project"
- "List all vendors and their risk assessments"
- "Update the status of security controls to completed"
- "Generate a compliance report for our tenant"
- "Create evidence for our data encryption policy"

## Troubleshooting

### Token Expiration
If you get authentication errors, generate a new token:
1. Visit: http://localhost:3000/api/v1/token
2. Update the `GRC_AUTH_TOKEN` in your config
3. Restart Claude Desktop

### Server Not Running
Ensure the GRC Platform is running:
```bash
cd /Users/kratikal/autogrc.ai/tools/gapps-js/gapps
python flask_app.py
```

### MCP Connection Issues
Check the Claude Desktop logs for MCP server connection errors. Ensure:
- Node.js is installed and accessible
- The file paths in the config are correct
- Dependencies are installed (`npm install`)

## Files Created
- `claude_desktop_config.json` - Claude Desktop MCP configuration
- `mcp-server.js` - MCP server implementation
- `package.json` - Node.js dependencies
- `CLAUDE_DESKTOP_SETUP.md` - This setup guide

## Resources
- **API Documentation**: http://localhost:8002/docs
- **GRC Platform**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/v1/health