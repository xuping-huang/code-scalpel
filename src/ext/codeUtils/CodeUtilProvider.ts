import { JoiSchema2TestConvertor } from './pasteUtils/convertor/JoiSchem2TestConvertor';
import { JoiSchemaParser } from './pasteUtils/parser/JoiSchemaParser';
import * as vscode from 'vscode';
import { CodeNode, NodeName } from './CodeNode';
import { PasteNode } from './pasteUtils/PasteNode';
import { NodeType } from './NodeType';
import * as pasteProcessor from './pasteUtils/pasteProcessor';
import { TableSqlParser } from './pasteUtils/parser/TableSqlParser';
import { SequelizeModelConvertor } from './pasteUtils/convertor/SequelizeModelConvertor';
import { SnakeStringParser } from './pasteUtils/parser/SnakeStringParser';
import { CamelCaseConvertor } from './pasteUtils/convertor/CamelCaseConvertor';
import { JsonParser } from './pasteUtils/parser/JsonParser';
import { PostmanJsonConvertor } from './pasteUtils/convertor/PostmanJsonConvertor';
import { CodeJsonConvertor } from './pasteUtils/convertor/CodeJsonConvertor';

export class CodeUtilProvider implements vscode.TreeDataProvider<CodeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<CodeNode | undefined> = new vscode.EventEmitter<CodeNode | undefined>();
  readonly onDidChangeTreeData: vscode.Event<CodeNode | undefined> = this._onDidChangeTreeData.event;
  private _pasteItems: CodeNode[] = [];
  private _tops: CodeNode[] = [];

  constructor(context: vscode.ExtensionContext) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CodeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    if (element.contextValue.startsWith(NodeName.PasteUtilFolder)){
      element.contextValue = `${NodeName.PasteUtilFolder}:${this.onOffSuffix(element)}`;
    }
    else if (element.contextValue.startsWith(NodeName.PasteUtilItem)) {
      element.contextValue = `${NodeName.PasteUtilItem}:${this.onOffSuffix(element)}`;
    }
    else if (element.contextValue.startsWith(NodeName.OtherUtilFolder)) {
      element.contextValue = `${NodeName.OtherUtilFolder}:${this.onOffSuffix(element)}`;
    }
    return element;
  }

  getChildren(element?: CodeNode | undefined): vscode.ProviderResult<CodeNode[]> {
    if (element) {
      switch(element.nodeType) {
        case NodeType.PasteUtilFolder:
          return this.getPasteUtils(element);
          break;
        case NodeType.PasteUtilItem:
          break;
      }
    } else {
      return this.getTopItems();
    }
    return Promise.resolve([]);
  }

  getTopItems(): Promise<CodeNode[]> {
    if (this._tops.length > 0 ) { return Promise.resolve(this._tops); }
    this._tops.push(new CodeNode('Paste Pre Processor', vscode.TreeItemCollapsibleState.Expanded, NodeType.PasteUtilFolder));
    this._tops.push(new CodeNode('Others', vscode.TreeItemCollapsibleState.Collapsed, NodeType.OtherUtilFolder));

    return Promise.resolve(this._tops);
  }

  getPasteUtils(parent: CodeNode): Promise<CodeNode[]> {
    if (this._pasteItems.length > 0) { return Promise.resolve(this._pasteItems); }
    this._pasteItems.push(new PasteNode('Create table Sql >> Sequelize model', new TableSqlParser(), new SequelizeModelConvertor(), parent));
    this._pasteItems.push(new PasteNode('Snake >> camelCase', new SnakeStringParser(), new CamelCaseConvertor(false), parent));
    this._pasteItems.push(new PasteNode('Snake >> CamelCase', new SnakeStringParser(), new CamelCaseConvertor(true), parent));
    this._pasteItems.push(new PasteNode('Json >> Postman Standard', new JsonParser(), new PostmanJsonConvertor(), parent));
    this._pasteItems.push(new PasteNode('Json >> Code Standard', new JsonParser(), new CodeJsonConvertor(), parent));
    this._pasteItems.push(new PasteNode('Joi Schema >> Test', new JoiSchemaParser(), new JoiSchema2TestConvertor(), parent));
    return Promise.resolve(this._pasteItems);
  }

  onOffSuffix(element: CodeNode): string {
    return element.isSwitchOn() ? 'on' : 'off';
  }

  async pastePreProcess(): Promise<string|undefined> {
    const found = this._pasteItems.filter(item => {
      return item.isActive();
    })
    if (found && found.length > 0) {
      return await pasteProcessor.preHandle(found);
    }
    return Promise.resolve(undefined);
  }

  async pastePostProcess(content: string|undefined): Promise<void> {
    if (content) {
      await pasteProcessor.postHandle(content);
    }
    return Promise.resolve();
  }

}
