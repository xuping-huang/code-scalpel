import { CodeParser } from '../PasteNode';
import * as debug from 'debug';

const Debug = debug('test:joiSchemaParser');

export interface JoiSchemaItem {
  field: string,
  items: string
}

export class JoiSchemaParser implements CodeParser {
  match(content: string): boolean {
    try {
      if (content.trim().match(/\w+\.schema\s*=\s*{/gi)) {
        return true;
      }
    } catch(err) {
      return false;
    }
    return false;
  }

  parse(content: string) {
    const fields: JoiSchemaItem[] = [];
    const ind = content.indexOf('{');
    this.parseJson('', fields, content.substring(ind));
    return fields;
  }

  private parseJson(parent: string, fields: JoiSchemaItem[], content: string) {
    let lastContent = content;

    const FIND_ARRAY_ITEMS = /(\w+)\s*:\s*(Joi\.array\(\).items)\(([\s\S]*)\)\)(\.required\(\)|\.optional\(\))?/gi
    const objItems = content.match(FIND_ARRAY_ITEMS);
    Debug('----------------objItems------------------');
    Debug(objItems);
    if (objItems && objItems.length > 0) {
      objItems.forEach(itemContent => {
        const FIND_ARRAY_ITEMS2 = /(\w+)\s*:\s*(Joi\.array\(\).items)\(([\s\S]*)\)\)(\.required\(\)|\.optional\(\))?/gi
        const matchItem = FIND_ARRAY_ITEMS2.exec(itemContent);
        Debug('----------matchItem-----------');
        Debug(matchItem);
        if (matchItem) {
          const suffix = matchItem[4] ? matchItem[4] : '';
          fields.push({
            field: parent.length > 0 ? `${parent}.${matchItem[1]}` : matchItem[1],
            items: `${matchItem[2]}()${suffix}`
          });
          console.log('-----------parent----------');
          console.log(parent.length > 0 ? `${parent}.${matchItem[1]}[0]` : `${matchItem[1]}[0]`);
          this.parseJson( parent.length > 0 ? `${parent}.${matchItem[1]}[0]` : `${matchItem[1]}[0]`, fields, matchItem[3]);
        }
      });
      lastContent = lastContent.replace(FIND_ARRAY_ITEMS, '');
    }
    const FIND_OBJ_KEYS = /(\w+)\s*:\s*([^,]+)((keys\(((?:[^()]*\([^()]*\))*[^()]*?)\)(\.required\(\)|\.optional\(\))?))/gi
    const objKeys = lastContent.match(FIND_OBJ_KEYS);
    if (objKeys && objKeys.length > 0) {
      objKeys.forEach(keyContent => {
        const FIND_OBJ_KEYS2 = /(\w+)\s*:\s*([^,]+)((keys\(((?:[^()]*\([^()]*\))*[^()]*?)\)(\.required\(\)|\.optional\(\))?))/gi
        const matchKey = FIND_OBJ_KEYS2.exec(keyContent);
        if (matchKey) {
          const suffix = matchKey[6] ? matchKey[6] : '';
          fields.push({
            field: parent.length > 0 ? `${parent}.${matchKey[1]}` : matchKey[1],
            items: `${matchKey[2]}keys()${suffix}`
          });
          Debug('-----------matchKey[5]------------');
          Debug(matchKey[5]);
          this.parseJson( parent.length > 0 ? `${parent}.${matchKey[1]}` : matchKey[1], fields, matchKey[5]);
        }
      });
      lastContent = lastContent.replace(FIND_OBJ_KEYS, '');
    }
    Debug('-----------lastContent------------');
    Debug(lastContent);
    const FIND_VALUE = /(\w+)\s*:\s*([^,]+\(\w*\))\s*,?/gi
    const values = lastContent.match(FIND_VALUE);
    Debug('---------------values-----------------');
    Debug(values);
    if (values && values.length > 0) {
      values.forEach(valueContent => {
        Debug('--------------valueContent----------');
        Debug(valueContent);
        const FIND_VALUE2 = /(\w+)\s*:\s*([^,]+\(\w*\))\s*,?/gi
        const matchValue = FIND_VALUE2.exec(valueContent);
        Debug('--------------matchValue----------');
        Debug(matchValue);
        if (matchValue) {
          fields.push({
            field: parent.length > 0 ? `${parent}.${matchValue[1]}` : matchValue[1],
            items: matchValue[2]
          });
        }
      });
    }
  }
}
