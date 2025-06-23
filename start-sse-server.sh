#!/bin/bash

# Start GRC MCP SSE Server
# This script starts the SSE server with proper environment variables

echo "🚀 Starting GRC MCP SSE Server..."

# Check if Flask GRC server is running
if ! curl -s http://localhost:3000/api/v1/health > /dev/null; then
    echo "❌ GRC Flask server is not running on port 3000"
    echo "Please start the GRC server first with: python3 flask_app.py"
    exit 1
fi

# Generate fresh token
echo "🔐 Generating fresh authentication token..."
TOKEN_RESPONSE=$(curl -s -b cookies.txt http://localhost:3000/api/v1/token)
if [[ $? -ne 0 ]]; then
    echo "❌ Failed to generate token. Please ensure you're logged in."
    exit 1
fi

AUTH_TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [[ -z "$AUTH_TOKEN" ]]; then
    echo "❌ Failed to extract auth token from response"
    exit 1
fi

echo "✅ Token generated successfully"

# Export environment variables
export GRC_API_BASE_URL="http://localhost:3000/api/v1"
export GRC_AUTH_TOKEN="$AUTH_TOKEN"
export MCP_SSE_PORT="3001"

echo "📡 Starting SSE server on port $MCP_SSE_PORT..."
echo "🔗 SSE endpoint: http://localhost:$MCP_SSE_PORT/sse"
echo "⚙️  Claude Desktop config: \"mcp-remote\", \"http://localhost:$MCP_SSE_PORT/sse\""

# Start the SSE server
node mcp-sse-server.js