import * as _ from 'lodash';
import * as vscode from 'vscode';
import { NodeExecuter } from './executer';
import { YamlNode } from './yamlNode';

export interface NodeExecuter {
  run(node: YamlNode): void;
}

export class ApiPathOperationIdSettingExecuter implements NodeExecuter {
  async run(node: YamlNode): Promise<void> {
		const value = await vscode.window.showInputBox({ placeHolder: 'Enter the api path property value' })
		if (!_.isNil(value)) {
      node.setDesc(value);
      node.parent!.operationId = value;
		}
  }
}
