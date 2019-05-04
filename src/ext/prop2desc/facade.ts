'use strict';
import * as vscode from 'vscode';
import { PropertyDescriptionProvider } from './provider';
import { PropertyDescriptionProcess } from "./process";

export function registerPropertyDescription( context: vscode.ExtensionContext){
  // const config = vscode.workspace.getConfiguration('prop2desc');
  const process = new PropertyDescriptionProcess();
  let provider = new PropertyDescriptionProvider(process);

  const Languages = ['yaml', 'json'];
  for (let lan of Languages) {
      let providerDisposable = vscode.languages.registerCompletionItemProvider(lan, provider);
      context.subscriptions.push(providerDisposable);
  }
};
