'use strict';
import * as vscode from 'vscode';

export interface PropertyConvertResult {
  propertyName?: string;
  description?: string;
  snippetDescription?: string | vscode.SnippetString;
}

export class PropertyDescriptionProcess {

  constructor() { }
  private regexWord: RegExp = /description:\s+"?(\w+)"?/;

  convert(text: string): PropertyConvertResult | undefined{
    const match = text.match(this.regexWord);
    if (!match || match.length <= 1) {
      return undefined;
    }

    return this.creatSnippet(match[1]);
  }

  private creatSnippet(word: string): PropertyConvertResult | undefined{
    const desc = this.findDescription(word);
    if ( desc ){
      return { 
        propertyName: word,
        description: `${word} -> ${desc.title}`,
        snippetDescription: new vscode.SnippetString(`${desc.code}`)
      }
    }

    return { 
      propertyName: word,
      description: `${word} -> ${word}`,
      snippetDescription: word
    }
  }

  private findDescription(word: string) {
    const dict = new Map();
    dict.set("type", { title: "Types of object", code: "Types of ${1|object,product,item|}"});
    dict.set("length", { title: "Length of the object", code: "Length of the ${1|object,car|}"});
    dict.set("createtime", { title: "Time the object was created", code: "type of ${1|object,order,item|}"});
    const wordKey = word.toLowerCase().trim();
    for( let key of dict.keys() ){
      if( key === wordKey ){
        return dict.get(key);
      }
    }
    return null;
  }
}
