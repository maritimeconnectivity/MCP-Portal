#!/bin/bash
_tag=$1
echo "Deploying Maritime Connectivity Platform Portal!"
#git clone https://github.com/MaritimeCloud/MCP-Portal.git /mcp_deployment
#cd /mcp_deployment
git pull
npm install --global rimraf
npm run clean
npm install --global webpack webpack-dev-server typescript@beta
npm install
echo "Installation of npm packages"
npm run prebuild:prod
npm run build:prod
echo "Build completed starting server"
npm run server:prod

