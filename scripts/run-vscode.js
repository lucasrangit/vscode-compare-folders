#!/usr/bin/env node

const { downloadAndUnzipVSCode } = require('@vscode/test-electron');
const cp = require('child_process');
const path = require('path');

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '..');
    const vscodeExecutablePath = await downloadAndUnzipVSCode('1.85.0');
    const testDir = path.resolve(extensionDevelopmentPath, '.vscode-test');
    const userDataDir = path.join(testDir, 'user-data');
    const extensionsDir = path.join(testDir, 'extensions');

    const args = [
      '--no-sandbox',
      '--disable-gpu-sandbox',
      '--disable-updates',
      '--skip-welcome',
      '--skip-release-notes',
      '--disable-workspace-trust',
      `--extensionDevelopmentPath=${extensionDevelopmentPath}`,
      `--user-data-dir=${userDataDir}`,
      `--extensions-dir=${extensionsDir}`,
      '--disable-extensions',
      ...process.argv.slice(2),
    ];
    const child = cp.spawn(vscodeExecutablePath, args, { stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code ?? 0));
  } catch (err) {
    console.error('Failed to launch VS Code:', err);
    process.exit(1);
  }
}

main();
