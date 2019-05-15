import * as vscode from 'vscode';
import { CodeNode } from '../CodeNode';
import { NodeType } from '../NodeType';

export interface CodeParser {
  match(content: string): boolean;
  parse(content: string): any|undefined;
}

export interface CodeConvertor {
  convert(configs: any): string|undefined;
}

export class PasteNode extends CodeNode {
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

  parse (content: string): string|undefined {
    const table = this.parser.parse(content);
    return this.convertor.convert(table);
  }
}
