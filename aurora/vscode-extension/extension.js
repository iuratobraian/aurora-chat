const vscode = require('vscode');
const axios = require('axios');

let apiClient = null;

/**
 * Activate extension
 */
async function activate(context) {
  console.log('🧠 Aurora AI is now active!');

  // Get configuration
  const config = vscode.workspace.getConfiguration('aurora');
  const apiUrl = config.get('apiUrl') || 'http://localhost:4310';
  const apiKey = config.get('apiKey') || '';

  // Initialize API client
  apiClient = axios.create({
    baseURL: apiUrl,
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('aurora.review', codeReview),
    vscode.commands.registerCommand('aurora.analyze', deepAnalysis),
    vscode.commands.registerCommand('aurora.optimize', optimize),
    vscode.commands.registerCommand('aurora.explain', explainCode)
  );

  // Create status bar item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '🧠 Aurora';
  statusBarItem.tooltip = 'Aurora AI Assistant';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Check connection
  try {
    await apiClient.get('/status');
    statusBarItem.text = '🧠 Aurora ✓';
    statusBarItem.color = '#10b981';
  } catch (error) {
    statusBarItem.text = '🧠 Aurora ⚠';
    statusBarItem.color = '#ef4444';
    statusBarItem.tooltip = 'Aurora API not connected';
  }
}

/**
 * Code Review Command
 */
async function codeReview() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const document = editor.document;
  const selection = editor.selection;
  const code = selection.isEmpty ? document.getText() : document.getText(selection);

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Aurora: Reviewing code...',
    cancellable: false
  }, async (progress) => {
    try {
      const response = await apiClient.post('/review', {
        file: document.fileName,
        code,
        language: document.languageId
      });

      const review = response.data;
      
      // Show review in panel
      const panel = vscode.window.createWebviewPanel(
        'auroraReview',
        'Aurora Code Review',
        vscode.ViewColumn.Beside,
        {}
      );

      panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: var(--vscode-font-family); padding: 20px; }
            .finding { background: var(--vscode-editor-background); padding: 10px; margin: 10px 0; border-radius: 6px; }
            .severity-high { border-left: 3px solid #ef4444; }
            .severity-medium { border-left: 3px solid #f59e0b; }
            .severity-low { border-left: 3px solid #10b981; }
          </style>
        </head>
        <body>
          <h1>🔍 Code Review</h1>
          <p>File: ${document.fileName}</p>
          ${review.findings.map(f => `
            <div class="finding severity-${f.severity || 'low'}">
              <strong>${f.title}</strong>
              <p>${f.description}</p>
              <p><em>Line: ${f.line || 'N/A'}</em></p>
            </div>
          `).join('')}
        </body>
        </html>
      `;

    } catch (error) {
      vscode.window.showErrorMessage(`Aurora review failed: ${error.message}`);
    }
  });
}

/**
 * Deep Analysis Command
 */
async function deepAnalysis() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  vscode.window.showInformationMessage('Aurora: Analyzing...');
  // Implementation similar to codeReview
}

/**
 * Optimize Command
 */
async function optimize() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  vscode.window.showInformationMessage('Aurora: Optimizing...');
  // Implementation similar to codeReview
}

/**
 * Explain Code Command
 */
async function explainCode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  vscode.window.showInformationMessage('Aurora: Explaining...');
  // Implementation similar to codeReview
}

/**
 * Deactivate extension
 */
function deactivate() {
  if (apiClient) {
    apiClient = null;
  }
}

module.exports = {
  activate,
  deactivate
};
