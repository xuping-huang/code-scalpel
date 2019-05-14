import { CodeConvertor } from '../PasteNode';
import * as Mustache from 'mustache' ;

const template = `class {{camelCaseName}}Model extends Model {}
{{camelCaseName}}Model.init({
{{#columns}}
  {{camelCaseName}}: {
    {{#isUuid}}
    type: Sequelize.UUID,
    allowNull: true
    {{/isUuid}}
    {{#isInteger}}
    type: Sequelize.INTEGER,
    allowNull: true
    {{/isInteger}}
    {{#isLong}}
    type: Sequelize.BIGINT,
    allowNull: true
    {{/isLong}}
    {{#isFloat}}
    type: Sequelize.FLOAT,
    allowNull: true
    {{/isFloat}}
    {{#isDouble}}
    type: Sequelize.DOUBLE,
    allowNull: true
    {{/isDouble}}
    {{#isDecimal}}
    type: Sequelize.DECIMAL,
    allowNull: true
    {{/isDecimal}}
    {{#isByteArray}}
    type: Sequelize.BLOB,
    allowNull: true
    {{/isByteArray}}
    {{#isBoolean}}
    type: Sequelize.BOOLEAN,
    allowNull: true
    {{/isBoolean}}
    {{#isDate}}
    type: Sequelize.DATEONLY,
    allowNull: true
    {{/isDate}}
    {{#isDateTime}}
    type: Sequelize.DATE,
    allowNull: true
    {{/isDateTime}}
    {{#isString}}
    type: Sequelize.STRING,
    allowNull: true
    {{/isString}}
    {{#isText}}
    type: Sequelize.TEXT,
    allowNull: true
    {{/isText}}
    {{#isJson}}
    type: Sequelize.JSON,
    allowNull: true
    {{/isJson}}
  },
{{/columns}}
}, {
  schema: '{{schemaName}}',
  tableName: '{{name}}',
  timestamps: true,
  createdAt: 'createdOn',
  updatedAt: 'updatedOn',
  sequelize
})`;

export class SequelizeModelConvertor implements CodeConvertor {
  convert(config: any): string {
    const renderContent = Mustache.render(template, config);
    console.log('renderContent');
    console.log(renderContent);
    return renderContent;
  }
}
