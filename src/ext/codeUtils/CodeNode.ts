
import * as path from 'path';
import * as vscode from 'vscode';
import { NodeType } from './NodeType';

export const NodeName = {
  PasteUtilFolder: 'paste_util_folder',
  PasteUtilItem: 'paste_util_item',
  OtherUtilFolder: 'other_util_folder'
}

export class CodeNode extends vscode.TreeItem {
  private _description: string = '';
  private _isSwitchOn: boolean = false;

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly nodeType: NodeType,
    private parent?: CodeNode
  ) {
    super(label, collapsibleState);
    switch(nodeType) {
      case NodeType.PasteUtilFolder:
        this._isSwitchOn = true;
        this.contextValue = NodeName.PasteUtilFolder;
        this.iconPath = {
          light: path.join(__filename, '../../../../media/light/pasteFolder.svg'),
          dark: path.join(__filename, '../../../../media/dark/pasteFolder.svg'),
        };
        break;
      case NodeType.PasteUtilItem:
        this.contextValue = 'paste_util_item';
        this.iconPath = {
          light: path.join(__filename, '../../../../media/light/pasteItem.svg'),
          dark: path.join(__filename, '../../../../media/dark/pasteItem.svg'),
        };
        break;
      case NodeType.OtherUtilFolder:
        this.contextValue = 'other_util_folder';
        this.iconPath = {
          light: path.join(__filename, '../../../../media/light/otherFolder.svg'),
          dark: path.join(__filename, '../../../../media/dark/otherFolder.svg'),
        };
        break;
    }
  }

  get tooltip(): string {
    return `${this.label}`;
  }

  get description(): string {
    return this._description;
  }

  switchToggle(): void {
    this._isSwitchOn = !this._isSwitchOn;
  }

  isSwitchOn(): boolean {
    return this._isSwitchOn;
  }

  isActive(): boolean {
    if (this.parent) {
      return this.parent.isSwitchOn() && this.isSwitchOn();
    }
    return this.isSwitchOn();
  }

  contextValue = 'code_node';
}
