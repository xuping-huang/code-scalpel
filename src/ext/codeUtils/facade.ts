import * as vscode from 'vscode';
import { CodeNode } from './CodeNode';
import { CodeUtilProvider } from './CodeUtilProvider';



export function registerCodeUtils( context: vscode.ExtensionContext){
  const codeUtilProvider = new CodeUtilProvider(context);
  const toggleSwitch = (node: CodeNode) => {
    node.switchToggle();
    codeUtilProvider.refresh();
  };

  vscode.window.registerTreeDataProvider('codeUtils', codeUtilProvider);
  vscode.commands.registerCommand('codeUtils.pasteFolderToggleOn', toggleSwitch);
  vscode.commands.registerCommand('codeUtils.pasteFolderToggleOff', toggleSwitch);

  vscode.commands.registerCommand('clipboard.paste', async () => {
    const content = await codeUtilProvider.pastePreProcess();
    await vscode.commands.executeCommand("editor.action.clipboardPasteAction");
    if (content) {
      await codeUtilProvider.pastePostProcess(content);
    }
  });
}
