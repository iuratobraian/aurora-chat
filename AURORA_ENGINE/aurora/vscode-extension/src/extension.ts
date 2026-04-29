import * as vscode from 'vscode';

const AURORA_API_URL = 'http://localhost:4310';

async function auroraRequest(action: string, context: string): Promise<string> {
  try {
    const res = await fetch(`${AURORA_API_URL}/api/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
    });
    const data = await res.json();
    return data.response || data.content || 'No response';
  } catch (e: any) {
    return `Aurora error: ${e.message}`;
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Code Review
  context.subscriptions.push(
    vscode.commands.registerCommand('aurora.review', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.selection;
      const code = editor.document.getText(selection) || editor.document.getText();
      vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Aurora reviewing...' }, async () => {
        const result = await auroraRequest('review', code);
        const panel = vscode.window.createWebviewPanel('auroraReview', 'Aurora Review', vscode.ViewColumn.Two, {});
        panel.webview.html = `<html><body style="background:#1e1e1e;color:#d4d4d4;padding:20px;font-family:monospace;white-space:pre-wrap;">${result}</body></html>`;
      });
    })
  );

  // Explain Code
  context.subscriptions.push(
    vscode.commands.registerCommand('aurora.explain', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const code = editor.document.getText(editor.selection) || editor.document.getText();
      const result = await auroraRequest('explain', code);
      const panel = vscode.window.createWebviewPanel('auroraExplain', 'Aurora Explanation', vscode.ViewColumn.Two, {});
      panel.webview.html = `<html><body style="background:#1e1e1e;color:#d4d4d4;padding:20px;font-family:monospace;white-space:pre-wrap;">${result}</body></html>`;
    })
  );

  // Auto-Fix
  context.subscriptions.push(
    vscode.commands.registerCommand('aurora.fix', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
      const errors = diagnostics.map(d => `Line ${d.range.start.line + 1}: ${d.message}`).join('\n');
      if (!errors) {
        vscode.window.showInformationMessage('No errors found');
        return;
      }
      const result = await auroraRequest('fix', errors);
      vscode.window.showInformationMessage('Aurora fix suggestions generated');
    })
  );

  // Status
  context.subscriptions.push(
    vscode.commands.registerCommand('aurora.status', async () => {
      const result = await auroraRequest('status', '');
      vscode.window.showInformationMessage(result);
    })
  );

  // Status bar item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = '$(brain) Aurora';
  statusBarItem.command = 'aurora.status';
  statusBarItem.tooltip = 'Aurora AI Assistant - Connected';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

export function deactivate() {}
