import * as clipboardy from 'clipboardy';
import { CodeNode } from '../CodeNode';
import { PasteNode } from './PasteNode';

export async function preHandle(nodes: CodeNode[]): Promise<string|undefined> {
  const content = await clipboardy.read();
  if (content) {
    for (let node of nodes) {
      if (node instanceof PasteNode) {
        const pasteNode = node as PasteNode;
        if (pasteNode.match(content)) {
          const contentNew = pasteNode.parse(content, node);
          if (contentNew) {
            await clipboardy.write(contentNew);
            // here must return content, use to restore clipboard
            return Promise.resolve(content);
          }
        }
      }
    }
  }
  return Promise.resolve(undefined);
}

export async function postHandle(content: string): Promise<void> {
  if (content) {
    await clipboardy.write(content);
  }
  return Promise.resolve();
}
