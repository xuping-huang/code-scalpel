'use strict';
import * as vscode from 'vscode';

function convert(text: string) {
  const items = text.split(',');
  const ret = [];
  for (let item of items){
    ret.push({name: item});
  }
  return JSON.stringify(ret);
}

export function registerLookup2json( context: vscode.ExtensionContext){
  // const config = vscode.workspace.getConfiguration('lookup2json');

  context.subscriptions.push(vscode.commands.registerTextEditorCommand('scalpel.lookup2json', 
    (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
      const doc = textEditor.document;
      let selection: vscode.Selection | vscode.Range = textEditor.selection;
      if (selection.isEmpty) {
          const start = new vscode.Position(0, 0);
          const end = new vscode.Position(doc.lineCount - 1, doc.lineAt(doc.lineCount - 1).text.length);
          selection = new vscode.Range(start, end);
      }
      
      let text = doc.getText(selection);
      textEditor.edit(builder => {
          builder.replace(selection, convert(text));
      });
  }));
}
