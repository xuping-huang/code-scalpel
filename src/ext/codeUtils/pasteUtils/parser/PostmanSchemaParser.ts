import * as _ from 'lodash';
import * as json5 from 'json5';
import { CodeParser } from '../PasteNode';
import { TestUnitDefine, TokenType } from '../TestUnitDefine';

export class PostmanSchemaParser implements CodeParser {
  match(content: string): boolean {
    try {
      const items = json5.parse(content);
      let item = items;
      if (_.isArray(items)) { item = items[0] }

      const requiredProps = ['name', 'event', 'request', 'response'];
      for (let prop of requiredProps) {
        if (_.isUndefined(item[prop])) { return false; }
      }
      return true;
    } catch(err) {
      return false;
    }
  }

  parse(content: string): TestUnitDefine[] {
    const parseResult = json5.parse(content);
    let items = parseResult;
    if (!_.isArray(parseResult)) { items = [parseResult]; }

    const testUnits: TestUnitDefine[] = [];
    for (let item of items) {
      const status = this.getStatusByNameAndTests(item.name, item!.event[0]!.script!.exec);
      const testUnit: TestUnitDefine = {
        title: item.name,
        method: String(item!.request!.method).toLowerCase(),
        pathParams: this.getPathParamsByUrl(item!.request!.url),
        pathParamNames: this.getPathParamNamesByUrl(item!.request!.url),
        status,
        tokenType: this.getTokenTypeByNameAndStatus(item.name, status),
        body: item!.request!.body!.raw
      };
      testUnits.push(testUnit);
    }

    return testUnits;
  }

  private getStatusByNameAndTests(name: string, tests: string[]): number {
    const nameMatch = name.match(/(4|2)\d\d/gi);
    if (_.isArray(nameMatch)) {
      return Number.parseInt(nameMatch[0]);
    }

    for (let test of tests) {
      if ( /\s*pm\.response.*\.status\(\s*((4|2)\d\d)/gi.test(test) ) {
        const groups = /\s*pm\.response.*\.status\(\s*((4|2)\d\d)/gi.exec(test);
        if (groups && groups[1]) { return Number.parseInt(groups![1]); }
      }
    }

    if (name.toLowerCase().includes('success') || name.includes('ok')) { return 200; }
    if (name.toLowerCase().includes('fail')) { return 400; }
    return 200;
  }

  private getPathParamsByUrl(url: any): string[] {
    const params: string[] = [];

    if (url.path && _.isArray(url.path)) {
      for (let path of url.path) {
        if (this.isIdLike(path)) {
          params.push(path);
        }
      }
    }

    let queryStr = '?';
    if (url.query && _.isArray(url.query)) {
      let perfix = '';
      for (let query of url.query) {
        queryStr += `${perfix}${query.key}=${query.value}`;
        perfix = '&'
      }
      params.push(queryStr);
    }

    return params;
  }

  private getPathParamNamesByUrl(url: any): string[] {
    const params: string[] = [];

    if (url.path && _.isArray(url.path)) {
      for (let path of url.path) {
        if (!this.isIdLike(path)) {
          params.push(path);
        }
      }
    }
    return params;
  }

  private isIdLike(content: string): boolean {
    if (/\d+/.test(content) || /[0-9A-F]{8}[-]([0-9A-F]{4}[-]){3}[0-9A-F]{12}/gi.test(content)) { return true; }
    return false;
  }

  private getTokenTypeByNameAndStatus(name: string, status: number): TokenType {
    if (status >= 200 && status < 299) {
      return TokenType.Normal;
    }
    if (status === 401) {
      if (name.toLowerCase().includes('unauth')) { return TokenType.Invalid; }
      if (name.toLowerCase().includes('expired')) { return TokenType.Expired; }
      return TokenType.Invalid;
    }
    if (status === 403) {
      return TokenType.Forbidden;
    }
    return TokenType.Normal;
  }
}
