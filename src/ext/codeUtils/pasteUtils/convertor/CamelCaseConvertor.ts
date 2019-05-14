import { CodeConvertor } from '../PasteNode';
import * as _ from 'lodash' ;

export class CamelCaseConvertor implements CodeConvertor {
  constructor(private isUpperFirst: boolean) {

  }
  convert(content: string): string {
    if (this.isUpperFirst) {
      return _.upperFirst(_.camelCase(content));
    }
    return _.camelCase(content);
  }
}
