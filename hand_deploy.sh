#!/bin/bash
_tag=$1
echo "Deploying Maritime Cloud!"
#git clone https://github.com/MaritimeCloud/MaritimeCloudPortal.git /maritime_cloud_deployment
#cd /maritime_cloud_deployment
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

