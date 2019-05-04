import * as vscode from 'vscode';
import { CodeNode } from './CodeNode';
import { CodeUtilProvider } from './CodeUtilProvider';

export function registerCodeUtils( context: vscode.ExtensionContext){
  const codeUtilProvider = new CodeUtilProvider(context);
	vscode.window.registerTreeDataProvider('codeUtils', codeUtilProvider);
  // vscode.commands.registerCommand('codeUtils.allUtilsOff', (node: CodeNode) => codeUtilProvider.allUtilsToggle(node));
  vscode.commands.registerCommand('codeUtils.allUtilsOff', (node: CodeNode) => {
      node.switchToggle();
      codeUtilProvider.refresh();
  });
  vscode.commands.registerCommand('codeUtils.allUtilsOn', (node: CodeNode) => {
      node.switchToggle();
      codeUtilProvider.refresh();
  });
};
