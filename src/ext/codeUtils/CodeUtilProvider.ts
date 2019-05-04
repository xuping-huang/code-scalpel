import * as vscode from 'vscode';
import { CodeNode, NodeName } from './CodeNode';
import { NodeType } from './NodeType';

export class CodeUtilProvider implements vscode.TreeDataProvider<CodeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<CodeNode | undefined> = new vscode.EventEmitter<CodeNode | undefined>();
  readonly onDidChangeTreeData: vscode.Event<CodeNode | undefined> = this._onDidChangeTreeData.event;
  private _pasteItems: CodeNode[] = [];
  
	constructor(context: vscode.ExtensionContext) {
  }
  	
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  
  getTreeItem(element: CodeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
		if (element.contextValue.startsWith(NodeName.PasteUtilFolder)){
			const suffix = element.isSwitchOn() ? 'on' : 'off';
			element.contextValue = `${NodeName.PasteUtilFolder}:${suffix}`;
		} 
		else if (element.contextValue.startsWith(NodeName.PasteUtilItem)) {
			const suffix = element.isSwitchOn() ? 'on' : 'off';
			element.contextValue = `${NodeName.PasteUtilItem}:${suffix}`;
		}
		else if (element.contextValue.startsWith(NodeName.OtherUtilFolder)) {
			const suffix = element.isSwitchOn() ? 'on' : 'off';
			element.contextValue = `${NodeName.OtherUtilFolder}:${suffix}`;
		}
		return element;
  }
  
  getChildren(element?: CodeNode | undefined): vscode.ProviderResult<CodeNode[]> {
		if (element) {
			switch(element.nodeType) {
        case NodeType.PasteUtilFolder:
          return this.getPasteUtils();
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
    const tops = [];
    tops.push(new CodeNode('Paste Pre Processor', vscode.TreeItemCollapsibleState.Expanded, NodeType.PasteUtilFolder));
    tops.push(new CodeNode('Others', vscode.TreeItemCollapsibleState.Collapsed, NodeType.OtherUtilFolder));

    return Promise.resolve(tops);
  }

  getPasteUtils(): Promise<CodeNode[]> {
    if (this._pasteItems.length > 0) { return Promise.resolve(this._pasteItems); }

    this._pasteItems.push(new CodeNode('Create table Sql >> Sequelize model', vscode.TreeItemCollapsibleState.Collapsed, NodeType.PasteUtilItem));
    return Promise.resolve(this._pasteItems);
  }

}
