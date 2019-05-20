import * as _ from 'lodash';
import * as vscode from 'vscode';
import { CodeNode } from './CodeNode';
import { PasteConfigNode } from './pasteUtils/PasteConfigNode';

export interface NodeExecuter {
  run(node: CodeNode): void;
}

export class ConfigPathSelectExecuter implements NodeExecuter {
  async run(node: PasteConfigNode): Promise<void> {
		const uris = await vscode.window.showOpenDialog({ canSelectFolders: false, canSelectFiles: true })
		if (!_.isNil(uris) && uris.length > 0) {
      node.setConfigPath(uris[0].fsPath);
		}
  }
}
