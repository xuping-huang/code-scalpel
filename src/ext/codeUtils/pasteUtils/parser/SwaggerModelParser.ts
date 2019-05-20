import * as _ from 'lodash';
import * as yaml from 'js-yaml';
import { CodeParser } from '../PasteNode';
import { SwaggerModel, SwaggerModelProperty } from '../ParseResultDefine';

export class SwaggerModelParser implements CodeParser {
  match(content: string): boolean {
    try {
      const loaded = yaml.load(content);
      if (_.isObject(loaded)){
        const pair: any = _.toPairs(loaded);
        if (pair[0][1] && pair[0][1]['properties']) {
          return true;
        }
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  parse(content: string): SwaggerModel {
    const def = yaml.load(content);
    const models: SwaggerModel[] = [];
    const pair: any = _.toPairs(def);
    const model = new SwaggerModel(String(pair[0][0]));
    const defContent = pair[0][1]
    _.each(defContent.properties, (prop, propName) => {
      const modelProp = new SwaggerModelProperty(propName,
        prop,
        defContent.required!.includes(propName));
      model.addProperty(modelProp);
    });
    models.push(model);

    return models[0];
  }
}
