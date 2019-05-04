'use strict';
import * as vscode from 'vscode';
import { CssRemProcess } from './process';
import { CssRemProvider } from './provider';

export function registerCssRem( context: vscode.ExtensionContext){
  const config = vscode.workspace.getConfiguration('cssrem');
  const process = new CssRemProcess(config);
  let provider = new CssRemProvider(process);
  const LANS = ['html', 'vue', 'css', 'less', 'scss', 'sass', 'stylus'];
  for (let lan of LANS) {
      let providerDisposable = vscode.languages.registerCompletionItemProvider(lan, provider);
      context.subscriptions.push(providerDisposable);
  }

//   context.subscriptions.push(vscode.commands.registerTextEditorCommand('extension.cssrem', 
//     (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
//       const doc = textEditor.document;
//       let selection: vscode.Selection | vscode.Range = textEditor.selection;
//       if (selection.isEmpty) {
//           const start = new vscode.Position(0, 0);
//           const end = new vscode.Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
//           selection = new vscode.Range(start, end);
//       }
      
//       let text = doc.getText(selection);
//       textEditor.edit(builder => {
//           builder.replace(selection, process.convertAll(text));
//       });
//   }));
};
