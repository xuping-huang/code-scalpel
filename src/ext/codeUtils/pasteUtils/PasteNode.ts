import * as vscode from 'vscode';
import { CodeNode } from '../CodeNode';
import { NodeType } from '../NodeType';
import { PathLike } from 'fs';

export interface CodeParser {
  match(content: string): boolean;
  parse(content: string, node: PasteNode): any|undefined;
}

export interface CodeConvertor {
  convert(configs: any, node: PasteNode): string|undefined;
}

export class PasteNode extends CodeNode {
  private _configFilePath: PathLike | undefined = undefined;
  public get configFilePath(): PathLike | undefined  {
    return this._configFilePath;
  }
  public set configFilePath(value: PathLike | undefined ) {
    this._configFilePath = value;
  }

  constructor(
    label: string,
    tip: string,
    private parser: CodeParser,
    private convertor: CodeConvertor,
    parent?: CodeNode
  ) {
    super(label, tip, vscode.TreeItemCollapsibleState.Collapsed, NodeType.PasteUtilItem, parent);
  }

  match (content: string): boolean {
    return this.parser.match(content);
  }

  parse (content: string, node: PasteNode): string|undefined {
    const table = this.parser.parse(content, node);
    return this.convertor.convert(table, node);
  }
}
