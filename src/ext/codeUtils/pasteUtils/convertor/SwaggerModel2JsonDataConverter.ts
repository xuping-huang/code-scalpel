import * as _ from 'lodash';
import * as faker from 'faker';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { CodeConvertor, PasteNode } from '../PasteNode';
import { SwaggerModelDefine, SwaggerModelPropertyDefine } from '../ParseResultDefine';

interface FakerMatcher {
  include: string | string[];
  handler: Function;
}

export class SwaggerModel2JsonDataConverter implements CodeConvertor {
  convert(model: SwaggerModelDefine, node: PasteNode): string {
    let returnContent = '';
    try {
      const modelProp: any = {};
      _.each(model.properties, (prop) => {
        modelProp[prop.name] = this.fakerProperty(prop, node);
      });
      const modelJson: any = {};
      modelJson[model.name] = modelProp;
      returnContent = JSON.stringify(modelJson, null, 1);
    } catch (err) {
    }
    return returnContent;
  }

  private getFakeMatchers(): FakerMatcher[] {
    return [
      {
        include: 'zip',
        handler: faker.address.zipCode
      },
      {
        include: 'city',
        handler: faker.address.city
      },
      {
        include: 'street',
        handler: faker.address.streetName
      },
      {
        include: 'address',
        handler: faker.address.streetAddress
      },
      {
        include: ['second', 'address'],
        handler: faker.address.secondaryAddress
      },
      {
        include: 'county',
        handler: faker.address.county
      },
      {
        include: ['code', 'country'],
        handler: faker.address.countryCode
      },
      {
        include: 'country',
        handler: faker.address.country
      },
      {
        include: ['abbr', 'state'],
        handler: faker.address.stateAbbr
      },
      {
        include: 'state',
        handler: faker.address.state
      },
      {
        include: 'latitude',
        handler: faker.address.latitude
      },
      {
        include: 'longitude',
        handler: faker.address.longitude
      },
      {
        include: 'email',
        handler: faker.internet.email
      }
    ];
  }

  private fakeByConfig(prop: SwaggerModelPropertyDefine, node: PasteNode) {
    if (!node) { return undefined; }

    const propName = prop.name.toLowerCase().trim();

    if ( node.configFilePath ) {
      const buffer = fs.readFileSync(node.configFilePath);
      const records = yaml.load(buffer.toString());
      for (let record of records) {
        if (!record.name || !record.faker) { continue; }
        if (record.method) {
          const fun = propName[record.method];
          if (_.isFunction(fun)) {
            let result = false;
            if (record.method === 'endsWith') {
              result = propName.endsWith(record.name);
            } else if (record.method === 'startsWith') {
              result = propName.startsWith(record.name);
            } else if (record.method === 'includes') {
              result = propName.includes(record.name);
            }
            if (_.isBoolean(result) && result) {
              const fakeFun = _.get(faker, record.faker);
              if (_.isFunction(fakeFun)) {
                return fakeFun();
              }
            }
          }
        } else {
          if (record.name === propName) {
            const fakeFun = _.get(faker, record.faker);
            if (_.isFunction(fakeFun)) {
              return fakeFun();
            }
          }
        }
      }
    }
    return undefined;
  }

  private fakeByMatchers(prop: SwaggerModelPropertyDefine) {
    let returned : any = undefined;
    const propName = prop.name.toLowerCase().trim();
    const matchers = this.getFakeMatchers();
    for (let matcher of matchers) {
      if (_.isArray(matcher.include)) {
        if (_.every(matcher.include, include => propName.includes(include))) {
          returned = matcher['handler']();
          return returned;
        }
      } else {
        if (propName.includes(matcher.include)) {
          returned = matcher['handler']();
          return returned;
        }
      }
    }
    return returned;
  }

  private fakeByPropertyType(prop: SwaggerModelPropertyDefine) {
    let returned: any = undefined;
    if (prop.isEmail) {
      returned = faker.internet.email();
    } else if (prop.isGuid) {
      returned = faker.random.uuid();
    }
    else if (prop.isString) {
      if (prop.maxLength === 1) {
        returned = faker.random.alphaNumeric();
      } else if (prop.maxLength && prop.maxLength < 20) {
        returned = faker.random.word();
      }
      else {
        returned = faker.random.words();
      }
    } else if (prop.isDecimal) {
      let precision = 2;
      if (prop.minimum && prop.maximum) {
        returned = faker.random.number({
          min: prop.minimum,
          max: prop.maximum,
          precision
        });
      } else if (prop.maximum) {
        returned = faker.random.number({
          max: prop.maximum,
          precision
        });
      } else {
        returned = faker.random.number({ precision });
      }
    } else if (prop.isInteger) {
      if (prop.minimum && prop.maximum) {
        returned = faker.random.number({
          min: prop.minimum,
          max: prop.maximum,
          precision: 0
        });
      } else if (prop.maximum) {
        returned = faker.random.number({
          max: prop.maximum,
          precision: 0
        });
      } else {
        returned = faker.random.number({ precision: 0 });
      }
    } else if (prop.isNumber) {
      if (prop.minimum && prop.maximum) {
        returned = faker.random.number({
          min: prop.minimum,
          max: prop.maximum
        });
      } else if (prop.maximum) {
        returned = faker.random.number({
          max: prop.maximum
        });
      } else {
        returned = faker.random.number();
      }
    } else if (prop.isBoolean) {
      returned = faker.random.boolean();
    } else if (prop.isDate) {
      returned = faker.date.recent();
    } else if (prop.isDateTime) {
      returned = faker.date.recent();
    }
    return returned;
  }

  private fakerProperty(prop: SwaggerModelPropertyDefine, node: PasteNode) {
    let returned : any = undefined;
    returned = this.fakeByConfig(prop, node);
    if (!returned) {
      returned = this.fakeByMatchers(prop);
    }
    if (!returned) {
      returned = this.fakeByPropertyType(prop);
    }
    if (prop.isString && returned) {
      let str = String(returned);
      if (prop.maxLength) {
        if (str.length > prop.maxLength) {
          str = str.substring(0, prop.maxLength);
        }
        if (prop.maxLength <= 5) {
          str = str.toUpperCase();
        }
      }
      returned = str;
    }
    if (!returned) {
      returned = 'undefined';
    }
    return returned;
  }
}
