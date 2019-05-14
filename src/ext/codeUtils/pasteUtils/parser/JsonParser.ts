import * as json5 from 'json5';
import { CodeParser } from '../PasteNode';

export class JsonParser implements CodeParser {
  match(content: string): boolean {
    try {
      json5.parse(content);
      return true;
    } catch(err) {
      return false;
    }
  }  
  
  parse(content: string) {
    return content;
  }
}
