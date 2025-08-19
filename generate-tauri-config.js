import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const config = {
  "$schema": "../node_modules/@tauri-apps/cli/config.schema.json",
  "productName": "central_solicitacao",
  "version": "0.1.0",
  "identifier": "com.tauri.dev",
  "build": {
    "frontendDist": "../out",
    "devUrl": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001",
    "beforeDevCommand": "node server.js",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
};

const configPath = path.join(__dirname, 'src-tauri', 'tauri.conf.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('✅ tauri.conf.json gerado com sucesso usando variáveis de ambiente');
console.log(`📍 devUrl configurado para: ${config.build.devUrl}`);