import * as json5 from 'json5';
import { CodeConvertor } from '../PasteNode';

export class CodeJsonConvertor implements CodeConvertor {
  convert(content: string): string {
    let returnContent = content;
    try {
      returnContent = json5.stringify(json5.parse(content), null, 1);
    } catch (err) {

    }
    return returnContent;
  }
}
