import * as json5 from 'json5';
import { CodeConvertor } from '../PasteNode';

export class PostmanJsonConvertor implements CodeConvertor {
  convert(content: string): string {
    let returnContent = content;
    try {
      returnContent = JSON.stringify(json5.parse(content), null, 1);
    } catch (err) {

    }
    return returnContent;
  }
}
