#!/usr/bin/env node

/**
 * GRC Platform MCP SSE Server
 * Provides MCP-over-SSE endpoint for direct Claude Desktop integration
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.MCP_SSE_PORT || 3001;
const API_BASE_URL = process.env.GRC_API_BASE_URL || 'http://localhost:3000/api/v1';
const AUTH_TOKEN = process.env.GRC_AUTH_TOKEN;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'grc-mcp-sse', timestamp: new Date().toISOString() });
});

// MCP-over-SSE endpoint
app.get('/sse', (req, res) => {
  console.log('New SSE connection from:', req.ip);
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial server info
  const serverInfo = {
    jsonrpc: '2.0',
    method: 'notifications/initialized',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: {
        name: 'grc-platform-sse',
        version: '1.0.0'
      }
    }
  };

  res.write(`data: ${JSON.stringify(serverInfo)}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    console.log('SSE connection closed');
  });

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// MCP JSON-RPC endpoint for POST requests
app.post('/sse', async (req, res) => {
  try {
    const { method, params, id } = req.body;
    
    console.log('MCP Request:', { method, id });

    let response;

    switch (method) {
      case 'initialize':
        response = {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: {
              name: 'grc-platform-sse',
              version: '1.0.0'
            }
          }
        };
        break;

      case 'tools/list':
        response = {
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'grc_get_tenants',
                description: 'Get list of all tenants',
                inputSchema: {
                  type: 'object',
                  properties: {},
                },
              },
              {
                name: 'grc_create_tenant',
                description: 'Create a new tenant',
                inputSchema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Tenant name' },
                    contact_email: { type: 'string', description: 'Contact email' },
                  },
                  required: ['name', 'contact_email'],
                },
              },
              {
                name: 'grc_get_projects',
                description: 'Get projects for a tenant',
                inputSchema: {
                  type: 'object',
                  properties: {
                    tenant_id: { type: 'string', description: 'Tenant ID' },
                  },
                  required: ['tenant_id'],
                },
              },
              {
                name: 'grc_create_project',
                description: 'Create a new compliance project',
                inputSchema: {
                  type: 'object',
                  properties: {
                    tenant_id: { type: 'string', description: 'Tenant ID' },
                    name: { type: 'string', description: 'Project name' },
                    description: { type: 'string', description: 'Project description' },
                    framework: { 
                      type: 'string', 
                      description: 'Compliance framework',
                      enum: ['soc2', 'iso27001', 'cmmc', 'empty']
                    },
                  },
                  required: ['tenant_id', 'name', 'framework'],
                },
              },
              {
                name: 'grc_get_controls',
                description: 'Get controls for a project',
                inputSchema: {
                  type: 'object',
                  properties: {
                    project_id: { type: 'string', description: 'Project ID' },
                  },
                  required: ['project_id'],
                },
              },
              {
                name: 'grc_health_check',
                description: 'Check GRC platform health status',
                inputSchema: {
                  type: 'object',
                  properties: {},
                },
              },
              {
                name: 'grc_generate_token',
                description: 'Generate new API authentication token',
                inputSchema: {
                  type: 'object',
                  properties: {
                    expiration: { type: 'number', description: 'Token expiration in seconds (default: 3600)' },
                  },
                },
              },
            ],
          }
        };
        break;

      case 'tools/call':
        const toolResponse = await callGRCTool(params.name, params.arguments || {});
        response = {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(toolResponse, null, 2),
              },
            ],
          }
        };
        break;

      default:
        response = {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: 'Method not found'
          }
        };
    }

    res.json(response);
  } catch (error) {
    console.error('MCP Error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message
      }
    });
  }
});

async function callGRCTool(toolName, args) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (AUTH_TOKEN) {
    headers['token'] = AUTH_TOKEN;
  }

  let url;
  let response;

  switch (toolName) {
    case 'grc_health_check':
      url = `${API_BASE_URL}/health`;
      response = await axios.get(url);
      break;

    case 'grc_generate_token':
      url = `${API_BASE_URL}/token`;
      if (args.expiration) {
        url += `?expiration=${args.expiration}`;
      }
      response = await axios.get(url, { headers });
      break;

    case 'grc_get_tenants':
      url = `${API_BASE_URL}/tenants`;
      response = await axios.get(url, { headers });
      break;

    case 'grc_create_tenant':
      url = `${API_BASE_URL}/tenants`;
      response = await axios.post(url, args, { headers });
      break;

    case 'grc_get_projects':
      url = `${API_BASE_URL}/tenants/${args.tenant_id}/projects`;
      response = await axios.get(url, { headers });
      break;

    case 'grc_create_project':
      url = `${API_BASE_URL}/tenants/${args.tenant_id}/projects`;
      const projectData = {
        name: args.name,
        description: args.description,
        framework: args.framework,
      };
      response = await axios.post(url, projectData, { headers });
      break;

    case 'grc_get_controls':
      url = `${API_BASE_URL}/projects/${args.project_id}/controls`;
      response = await axios.get(url, { headers });
      break;

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }

  return response.data;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GRC MCP SSE Server running on http://localhost:${PORT}`);
  console.log(`📡 SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`🔗 Claude Desktop config: "mcp-remote", "http://localhost:${PORT}/sse"`);
  console.log(`💾 API Base URL: ${API_BASE_URL}`);
  console.log(`🔐 Auth Token: ${AUTH_TOKEN ? 'Configured' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down GRC MCP SSE Server...');
  process.exit(0);
});