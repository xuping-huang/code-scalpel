import * as _ from 'lodash';
import { CodeParser } from '../PasteNode';
import { Table } from '../ParseResultDefine';
const CREATE_TABLE_REGEX = /create table\s+[^(]+\([^)]+\)/gi;
const LINE_BREAK_REGEX= /\r?\n/gm; 

export class TableSqlParser implements CodeParser {
  match(content: string): boolean {
    if (content.trim().match(CREATE_TABLE_REGEX)) {
      return true;
    }
    return false;
  }  
  
  parse(content: string) {
    const tableReg = /create table\s+([^(]+)\(([\s\S]+)\)\s*;?/gi;
    const matches = tableReg.exec(content);
    if (!matches || matches.length !== 3 ) { return Promise.resolve(undefined); }

    const tableName = matches[1];
    if (!tableName) { return Promise.resolve(undefined); }
    const table = new Table(tableName);

    const strCol = matches[2];
    const strCols = strCol.split(LINE_BREAK_REGEX);
    for (let colLine of strCols) {
      const regex = /(\S+)\s+(\w+)\s*(\(\s*(\d+)\s*,?\s*(\d+)?\s*\))?.*/g;
      const colMatches = regex.exec(colLine.trim());
      if (!colMatches) { continue; }
      let length = 0;
      let precision = 0;
      if (!_.isNil(colMatches[3])) {
        const param = colMatches[3].trim();
        const ind = param.indexOf(',');
        if (ind > 0) {
          length = +(param.substring(1, ind));
          precision = +(param.substring(ind+1, param.length-1));
        } else {
          length = +param.substring(1, param.length-1);
        }
      }
      if (length > 0) {
        table.addColumn(colMatches[1], colMatches[2], length, precision);
      } else {
        table.addColumn(colMatches[1], colMatches[2]);
      }
    }

    return table;
  }
}
