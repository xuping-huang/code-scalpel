import { CodeParser } from '../PasteNode';

export class SnakeStringParser implements CodeParser {
  match(content: string): boolean {
    if (content.indexOf('_') > 0) {
      return true;
    }
    return false;
  }  
  
  parse(content: string) {
    return content;
  }
}
