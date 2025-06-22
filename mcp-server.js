#!/usr/bin/env node

/**
 * GRC Platform MCP Server for Claude Desktop
 * Provides access to GRC APIs as MCP tools
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const axios = require('axios');

const API_BASE_URL = process.env.GRC_API_BASE_URL || 'http://localhost:3000/api/v1';
const AUTH_TOKEN = process.env.GRC_AUTH_TOKEN;

class GRCMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'grc-platform',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
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
            name: 'grc_update_control_status',
            description: 'Update control implementation status',
            inputSchema: {
              type: 'object',
              properties: {
                control_id: { type: 'string', description: 'Control ID' },
                status: { 
                  type: 'string', 
                  description: 'Control status',
                  enum: ['not_started', 'in_progress', 'completed', 'not_applicable']
                },
                notes: { type: 'string', description: 'Status notes' },
              },
              required: ['control_id', 'status'],
            },
          },
          {
            name: 'grc_get_evidence',
            description: 'Get evidence for a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: { type: 'string', description: 'Project ID' },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'grc_create_vendor',
            description: 'Create a vendor entry',
            inputSchema: {
              type: 'object',
              properties: {
                tenant_id: { type: 'string', description: 'Tenant ID' },
                name: { type: 'string', description: 'Vendor name' },
                contact_email: { type: 'string', description: 'Vendor contact email' },
                website: { type: 'string', description: 'Vendor website' },
              },
              required: ['tenant_id', 'name', 'contact_email'],
            },
          },
          {
            name: 'grc_get_vendors',
            description: 'Get vendors for a tenant',
            inputSchema: {
              type: 'object',
              properties: {
                tenant_id: { type: 'string', description: 'Tenant ID' },
              },
              required: ['tenant_id'],
            },
          },
          {
            name: 'grc_create_risk',
            description: 'Create a risk entry',
            inputSchema: {
              type: 'object',
              properties: {
                tenant_id: { type: 'string', description: 'Tenant ID' },
                title: { type: 'string', description: 'Risk title' },
                description: { type: 'string', description: 'Risk description' },
                risk_level: { 
                  type: 'string', 
                  description: 'Risk level',
                  enum: ['low', 'medium', 'high', 'critical']
                },
                mitigation: { type: 'string', description: 'Mitigation strategy' },
              },
              required: ['tenant_id', 'title', 'description', 'risk_level'],
            },
          },
          {
            name: 'grc_get_risks',
            description: 'Get risks for a tenant',
            inputSchema: {
              type: 'object',
              properties: {
                tenant_id: { type: 'string', description: 'Tenant ID' },
              },
              required: ['tenant_id'],
            },
          },
          {
            name: 'grc_create_policy',
            description: 'Create a policy document',
            inputSchema: {
              type: 'object',
              properties: {
                tenant_id: { type: 'string', description: 'Tenant ID' },
                title: { type: 'string', description: 'Policy title' },
                content: { type: 'string', description: 'Policy content' },
              },
              required: ['tenant_id', 'title', 'content'],
            },
          },
          {
            name: 'grc_get_policies',
            description: 'Get policies for a tenant',
            inputSchema: {
              type: 'object',
              properties: {
                tenant_id: { type: 'string', description: 'Tenant ID' },
              },
              required: ['tenant_id'],
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
            description: 'Generate new API authentication token (requires web login first)',
            inputSchema: {
              type: 'object',
              properties: {
                expiration: { type: 'number', description: 'Token expiration in seconds (default: 3600)' },
              },
            },
          },
          {
            name: 'grc_create_evidence',
            description: 'Create evidence for a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: { type: 'string', description: 'Project ID' },
                name: { type: 'string', description: 'Evidence name' },
                description: { type: 'string', description: 'Evidence description' },
                content: { type: 'string', description: 'Evidence content (optional)' },
              },
              required: ['project_id', 'name', 'description'],
            },
          },
          {
            name: 'grc_associate_evidence',
            description: 'Associate evidence with subcontrols',
            inputSchema: {
              type: 'object',
              properties: {
                subcontrol_id: { type: 'string', description: 'Subcontrol ID' },
                evidence_ids: { type: 'array', items: { type: 'string' }, description: 'Array of evidence IDs' },
              },
              required: ['subcontrol_id', 'evidence_ids'],
            },
          },
          {
            name: 'grc_get_project_controls',
            description: 'Get all controls for a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: { type: 'string', description: 'Project ID' },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'grc_get_project_evidence',
            description: 'Get all evidence for a project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: { type: 'string', description: 'Project ID' },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'grc_get_soa_questionnaire',
            description: 'Get Statement of Applicability questionnaire for control assessment',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: { type: 'string', description: 'Project ID' },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'grc_update_bulk_applicability',
            description: 'Update control applicability in bulk based on SOA responses',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: { type: 'string', description: 'Project ID' },
                controls: { 
                  type: 'array', 
                  items: {
                    type: 'object',
                    properties: {
                      control_id: { type: 'string' },
                      applicable: { type: 'boolean' },
                      justification: { type: 'string' }
                    }
                  },
                  description: 'Array of control applicability decisions'
                },
              },
              required: ['project_id', 'controls'],
            },
          },
          {
            name: 'grc_get_soa_summary',
            description: 'Get SOA summary with applicability statistics',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: { type: 'string', description: 'Project ID' },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'grc_generate_gap_assessment',
            description: 'Generate comprehensive gap assessment for project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: { type: 'string', description: 'Project ID' },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'grc_export_soa_document',
            description: 'Export SOA document as structured data for reporting',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: { type: 'string', description: 'Project ID' },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'grc_upload_policy_document',
            description: 'Upload policy or evidence document to project',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: { type: 'string', description: 'Project ID' },
                document_name: { type: 'string', description: 'Document name' },
                document_type: { type: 'string', description: 'Document type (policy, evidence, procedure)', enum: ['policy', 'evidence', 'procedure'] },
                content: { type: 'string', description: 'Document content or description' },
                control_mappings: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'Array of control IDs this document supports'
                },
              },
              required: ['project_id', 'document_name', 'document_type', 'content'],
            },
          },
          {
            name: 'grc_analyze_document_coverage',
            description: 'Analyze how well uploaded documents cover required controls',
            inputSchema: {
              type: 'object',
              properties: {
                project_id: { type: 'string', description: 'Project ID' },
              },
              required: ['project_id'],
            },
          },
          {
            name: 'grc_update_subcontrol_status',
            description: 'Update subcontrol completion status',
            inputSchema: {
              type: 'object',
              properties: {
                subcontrol_id: { type: 'string', description: 'Subcontrol ID' },
                status: { 
                  type: 'string', 
                  description: 'Subcontrol status',
                  enum: ['not_started', 'in_progress', 'completed', 'not_applicable']
                },
                notes: { type: 'string', description: 'Status notes' },
              },
              required: ['subcontrol_id', 'status'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const headers = {
          'Content-Type': 'application/json',
        };

        if (AUTH_TOKEN) {
          headers['token'] = AUTH_TOKEN;
        }

        let response;
        let url;

        switch (name) {
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

          case 'grc_update_control_status':
            url = `${API_BASE_URL}/controls/${args.control_id}/status`;
            const statusData = {
              status: args.status,
              notes: args.notes || '',
            };
            response = await axios.put(url, statusData, { headers });
            break;


          case 'grc_get_evidence':
            url = `${API_BASE_URL}/projects/${args.project_id}/evidence`;
            response = await axios.get(url, { headers });
            break;

          case 'grc_create_vendor':
            url = `${API_BASE_URL}/tenants/${args.tenant_id}/vendors`;
            const vendorData = {
              name: args.name,
              contact_email: args.contact_email,
              website: args.website || '',
            };
            response = await axios.post(url, vendorData, { headers });
            break;

          case 'grc_get_vendors':
            url = `${API_BASE_URL}/tenants/${args.tenant_id}/vendors`;
            response = await axios.get(url, { headers });
            break;

          case 'grc_create_risk':
            url = `${API_BASE_URL}/tenants/${args.tenant_id}/risks`;
            const riskData = {
              title: args.title,
              description: args.description,
              risk_level: args.risk_level,
              mitigation: args.mitigation || '',
            };
            response = await axios.post(url, riskData, { headers });
            break;

          case 'grc_get_risks':
            url = `${API_BASE_URL}/tenants/${args.tenant_id}/risks`;
            response = await axios.get(url, { headers });
            break;

          case 'grc_create_policy':
            url = `${API_BASE_URL}/tenants/${args.tenant_id}/policies`;
            const policyData = {
              title: args.title,
              content: args.content,
            };
            response = await axios.post(url, policyData, { headers });
            break;

          case 'grc_get_policies':
            url = `${API_BASE_URL}/tenants/${args.tenant_id}/policies`;
            response = await axios.get(url, { headers });
            break;

          case 'grc_create_evidence':
            url = `${API_BASE_URL}/projects/${args.project_id}/evidence`;
            const formData = new URLSearchParams();
            formData.append('name', args.name);
            formData.append('description', args.description);
            if (args.content) formData.append('content', args.content);
            response = await axios.post(url, formData, { 
              headers: { 
                ...headers, 
                'Content-Type': 'application/x-www-form-urlencoded' 
              } 
            });
            break;

          case 'grc_associate_evidence':
            url = `${API_BASE_URL}/subcontrols/${args.subcontrol_id}/associate-evidence`;
            response = await axios.put(url, { evidence: args.evidence_ids }, { headers });
            break;

          case 'grc_get_project_controls':
            url = `${API_BASE_URL}/projects/${args.project_id}/controls`;
            response = await axios.get(url, { headers });
            break;

          case 'grc_get_project_evidence':
            url = `${API_BASE_URL}/projects/${args.project_id}/evidence`;
            response = await axios.get(url, { headers });
            break;

          case 'grc_get_soa_questionnaire':
            url = `${API_BASE_URL}/projects/${args.project_id}/soa/questionnaire`;
            response = await axios.get(url, { headers });
            break;

          case 'grc_update_bulk_applicability':
            url = `${API_BASE_URL}/projects/${args.project_id}/soa/bulk-applicability`;
            response = await axios.put(url, { controls: args.controls }, { headers });
            break;

          case 'grc_get_soa_summary':
            url = `${API_BASE_URL}/projects/${args.project_id}/soa/summary`;
            response = await axios.get(url, { headers });
            break;

          case 'grc_generate_gap_assessment':
            url = `${API_BASE_URL}/projects/${args.project_id}/gap-assessment`;
            response = await axios.get(url, { headers });
            break;

          case 'grc_export_soa_document':
            url = `${API_BASE_URL}/projects/${args.project_id}/soa/export`;
            response = await axios.get(url, { headers });
            break;

          case 'grc_upload_policy_document':
            // First create evidence entry
            url = `${API_BASE_URL}/projects/${args.project_id}/evidence`;
            const policyFormData = new URLSearchParams();
            policyFormData.append('name', args.document_name);
            policyFormData.append('description', `${args.document_type}: ${args.content}`);
            policyFormData.append('content', args.content);
            response = await axios.post(url, policyFormData, { 
              headers: { 
                ...headers, 
                'Content-Type': 'application/x-www-form-urlencoded' 
              } 
            });
            
            // If control mappings provided, associate with controls
            if (args.control_mappings && args.control_mappings.length > 0) {
              const evidenceId = response.data.id;
              for (const controlId of args.control_mappings) {
                try {
                  const associateUrl = `${API_BASE_URL}/subcontrols/${controlId}/associate-evidence`;
                  await axios.put(associateUrl, { evidence: [evidenceId] }, { headers });
                } catch (associateError) {
                  console.error(`Failed to associate evidence ${evidenceId} with control ${controlId}:`, associateError.message);
                }
              }
            }
            break;

          case 'grc_analyze_document_coverage':
            // Get project evidence and controls to analyze coverage
            const evidenceUrl = `${API_BASE_URL}/projects/${args.project_id}/evidence`;
            const evidenceResponse = await axios.get(evidenceUrl, { headers });
            
            const controlsUrl = `${API_BASE_URL}/projects/${args.project_id}/controls`;
            const controlsResponse = await axios.get(controlsUrl, { headers });
            
            const evidence = evidenceResponse.data;
            const controls = controlsResponse.data;
            
            // Analyze coverage
            const coverageAnalysis = {
              total_controls: controls.length,
              controls_with_evidence: 0,
              controls_without_evidence: 0,
              total_evidence: evidence.length,
              coverage_percentage: 0,
              evidence_distribution: {},
              recommendations: []
            };
            
            for (const control of controls) {
              const hasEvidence = evidence.some(ev => 
                ev.associations && ev.associations.some(assoc => 
                  assoc.control_id === control.id
                )
              );
              
              if (hasEvidence) {
                coverageAnalysis.controls_with_evidence++;
              } else {
                coverageAnalysis.controls_without_evidence++;
              }
            }
            
            coverageAnalysis.coverage_percentage = Math.round(
              (coverageAnalysis.controls_with_evidence / coverageAnalysis.total_controls) * 100
            );
            
            if (coverageAnalysis.coverage_percentage < 80) {
              coverageAnalysis.recommendations.push({
                type: "missing_evidence",
                message: "Upload additional evidence documents to improve control coverage"
              });
            }
            
            response = { data: coverageAnalysis };
            break;

          case 'grc_update_subcontrol_status':
            url = `${API_BASE_URL}/subcontrols/${args.subcontrol_id}/status`;
            const subcontrolStatusData = {
              status: args.status,
              notes: args.notes || '',
            };
            response = await axios.put(url, subcontrolStatusData, { headers });
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error.response 
          ? `API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`
          : `Request Error: ${error.message}`;
        
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GRC Platform MCP server running on stdio');
  }
}

const server = new GRCMCPServer();
server.run().catch(console.error);