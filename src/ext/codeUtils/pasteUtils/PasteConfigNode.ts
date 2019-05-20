
import * as vscode from 'vscode';
import { PasteNode } from './PasteNode';
import { CodeNode } from '../CodeNode';
import { NodeType } from '../NodeType';
import { NodeExecuter } from '../executer';
import { CodeUtilProvider } from '../CodeUtilProvider';

export class PasteConfigNode extends CodeNode {

  private _executer: NodeExecuter | undefined;
  public get executer(): NodeExecuter | undefined {
    return this._executer;
  }
  public set executer(value: NodeExecuter | undefined) {
    this._executer = value;
  }

  constructor(private parentNode: PasteNode) {
    super('config file', 'config file', vscode.TreeItemCollapsibleState.None, NodeType.PasteUtilItemConfig, parentNode);
  }

  async runCommand(provider: CodeUtilProvider): Promise<void> {
    if (this.executer) {
      await this.executer.run(this);
      provider.refresh();
    }
  }

  get description() : string {
    return String(this.parentNode!.configFilePath);
  }

  setConfigPath(filePath: string) {
    this.parentNode.configFilePath = filePath;
  }
}
