'use strict';
import * as vscode from 'vscode';
import { PropertyDescriptionProcess } from "./process";

export class PropertyDescriptionProvider implements vscode.CompletionItemProvider {

  constructor(private process: PropertyDescriptionProcess) { }

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, 
    token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {

    return new Promise((resolve, reject) => {
      const lineText = document.getText(new vscode.Range(position.with(undefined, 0), position));
      const res = this.process.convert(lineText);
      if (!res) {
        return resolve([]);
      }

      const item = new vscode.CompletionItem(`${res.propertyName} -> ${res.description}`);
      item.insertText = res.snippetDescription;
      return resolve([item]);

    });
  }
}
