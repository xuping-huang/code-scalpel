import * as _ from 'lodash';
import * as helper from '../../../lib/helper';

export interface ColumnDefine {
  name: string;
  camelCaseName: string;
  snakeName: string;
  isString: boolean;
  isInteger: boolean;
  isLong: boolean;
  isFloat: boolean;
  isDouble: boolean;
  isDecimal: boolean;
  isByteArray: boolean;
  isBoolean: boolean;
  isDate: boolean;
  isDateTime: boolean;
  isUuid: boolean;
  isJson: boolean;
}

export interface TableDefine {
  name: string;
  snakeName: string;
  camelCaseName: string;
  columns: ColumnDefine[];
}

export class Table implements TableDefine {
  public _columns: ColumnDefine[] = [];
  private _name: string = '';
  private _snakeName: string = '';
  private _camelCaseName: string = '';
  private _schemaName: string = 'DBSchema';

  constructor(name: string) {
    let fullName = name.trim();
    const ind = fullName.indexOf('.');
    if ( ind > 0) {
      this._schemaName = fullName.substring(0, ind);
      fullName = fullName.substring(ind+1, fullName.length);
    }
    if (fullName.startsWith('"')) {
      fullName = fullName.substring(1, fullName.length - 1);
    }
    this._name = fullName;
    this._snakeName = _.snakeCase(fullName);
    this._camelCaseName = _.upperFirst(_.camelCase(fullName));
  }

  get name(): string {
    return this._name.trim();
  }
  get snakeName(): string {
    return this._snakeName;
  }
  get camelCaseName(): string {
    return this._camelCaseName;
  }
  get schemaName(): string {
    return this._schemaName;
  }

  get columns(): ColumnDefine[] {
    return this._columns;
  }

  addColumn(columnName: string, columnType: string, length?: number, precision?: number) {
    if (!_.isNil(length)) {
      this._columns.push(new TableColumn(columnName, columnType, length, precision));
    } else {
      this._columns.push(new TableColumn(columnName, columnType));
    }
  }
}

export class TableColumn implements ColumnDefine {
  private _name: string = '';
  private _snakeName: string = '';
  private _camelCaseName: string = '';
  private _isString: boolean = false;
  private _isText: boolean = false;
  private _isInteger: boolean = false;
  private _isLong: boolean = false;
  private _isFloat: boolean = false;
  private _isDouble: boolean = false;
  private _isDecimal: boolean = false;
  private _isByteArray: boolean = false;
  private _isBoolean: boolean = false;
  private _isDate: boolean = false;
  private _isDateTime: boolean = false;
  private _isUuid: boolean = false;
  private _isJson: boolean = false;

  constructor(name: string, columnType: string, length?: number, precision?: number) {
    let fullName = name.trim();
    if (fullName.startsWith('"')) {
      fullName = fullName.substring(1, fullName.length - 1);
    }
    this._name = fullName;
    this._snakeName = _.snakeCase(fullName);
    this._camelCaseName = _.camelCase(fullName);
    if (!_.isNil(length)) {
      this.columnTypeWithLength(columnType, length, precision);
    } else {
      this.columnType(columnType);
    }
  }

  columnType(columnType: string): void {
    const theType = columnType.trim().toLowerCase();
    if (helper.isIntegerColumn(theType)) { this._isInteger = true; }
    else if (helper.isLongColumn(theType)) { this._isLong = true; }
    else if (helper.isFloatColumn(theType)) { this._isFloat = true; }
    else if (helper.isDoubleColumn(theType)) { this._isDouble = true; }
    else if (helper.isDecimalColumn(theType)) { this._isDecimal = true; }
    else if (helper.isByteArrayColumn(theType)) { this._isByteArray = true; }
    else if (helper.isBooleanColumn(theType)) { this._isBoolean = true; }
    else if (helper.isDateColumn(theType)) { this._isDate = true; }
    else if (helper.isDateTimeColumn(theType)) { this._isDateTime = true; }
    else if (helper.isUuidColumn(theType)) { this._isUuid = true; }
    else if (helper.isJsonColumn(theType)) { this._isJson = true; }
    else if (helper.isTextColumn(theType)) { this._isText = true; }
    else if (helper.isStringColumn(theType)) { this._isString = true; }
  }

  columnTypeWithLength(columnType: string, length?: number, precision?: number): void {
    const theType = columnType.trim().toLowerCase();
    if (helper.isIntegerColumn(theType, length, precision)) { this._isInteger = true; }
    else if (helper.isLongColumn(theType, length, precision)) { this._isLong = true; }
    else if (helper.isFloatColumn(theType, length, precision)) { this._isFloat = true; }
    else if (helper.isDoubleColumn(theType, length, precision)) { this._isDouble = true; }
    else if (helper.isDecimalColumn(theType, length, precision)) { this._isDecimal = true; }
    else if (helper.isByteArrayColumn(theType)) { this._isByteArray = true; }
    else if (helper.isBooleanColumn(theType)) { this._isBoolean = true; }
    else if (helper.isDateColumn(theType)) { this._isDate = true; }
    else if (helper.isDateTimeColumn(theType)) { this._isDateTime = true; }
    else if (helper.isUuidColumn(theType)) { this._isUuid = true; }
    else if (helper.isJsonColumn(theType)) { this._isJson = true; }
    else if (helper.isTextColumn(theType)) { this._isText = true; }
    else if (helper.isStringColumn(theType)) { this._isString = true; }
  }

  get name(): string {
    return this._name;
  }
  get snakeName(): string {
    return this._snakeName;
  }
  get camelCaseName(): string {
    return this._camelCaseName;
  }
  get isString(): boolean {
    return this._isString;
  }
  get isText(): boolean {
    return this._isText;
  }
  get isInteger(): boolean {
    return this._isInteger;
  }
  get isLong(): boolean {
    return this._isLong;
  }
  get isFloat(): boolean {
    return this._isFloat;
  }
  get isDouble(): boolean {
    return this._isDouble;
  }
  get isDecimal(): boolean {
    return this._isDecimal;
  }
  get isByteArray(): boolean {
    return this._isByteArray;
  }
  get isBoolean(): boolean {
    return this._isBoolean;
  }
  get isDate(): boolean {
    return this._isDate;
  }
  get isDateTime(): boolean {
    return this._isDateTime;
  }
  get isUuid(): boolean {
    return this._isUuid;
  }
  get isJson(): boolean {
    return this._isJson;
  }
}

export interface SwaggerModelDefine {
  name: string;
  properties: SwaggerModelPropertyDefine[];
}

export interface SwaggerModelPropertyDefine {
  name: string;
  type: string | undefined;
  format: string | undefined;
  maxLength: number | undefined;
  minLength: number | undefined;
  maximum: number | undefined;
  minimum: number | undefined;
  enum: any[];
  isRequired: boolean;
  isDateTime: boolean;
  isDate: boolean;
  isEmail: boolean;
  isGuid: boolean;
  isInteger: boolean;
  isDecimal: boolean;
  isNumber: boolean;
  isString: boolean;
  isBoolean: boolean;
}

export class SwaggerModelProperty implements SwaggerModelPropertyDefine{
  private _isDate: boolean = false;
  private _isDateTime: boolean = false;
  private _isString: boolean = false;
  private _isEmail: boolean = false;
  private _isGuid: boolean = false;
  private _isInteger: boolean = false;
  private _isDecimal: boolean = false;
  private _isNumber: boolean = false;
  private _isBoolean: boolean = false;
  private _maxLength: number | undefined;
  private _minLength: number | undefined;
  private _maximum: number | undefined;
  private _minimum: number | undefined;
  private _enum: string[] | number[] = [];
  private _type: string | undefined;
  public get type(): string | undefined {
    return this._type;
  }
  public set type(value: string | undefined) {
    this._type = value;
  }
  private _format: string | undefined;
  public get format(): string | undefined {
    return this._format;
  }
  public set format(value: string | undefined) {
    this._format = value;
  }

  constructor(
    readonly name: string,
    readonly prop: any,
    readonly isRequired: boolean) {
    this.type = String(prop['type']).toLowerCase().trim();
    this.format = String(prop['format']).toLowerCase().trim();

    switch (this.type) {
      case "integer":
        this.isInteger = true;
        break;
      case "number":
      this.isNumber = true;
        if ( this.format === 'float' || this.format === 'double' ){
          this.isDecimal = true;
        }
        break;
      case "string":
        switch (this.format) {
          case "date":
            this.isDate = true;
            break;
          case "date-time":
            this.isDateTime = true;
            break;
          case "email":
            this.isEmail = true;
            break;
          case "guid":
            this.isGuid = true;
            break;
          default:
            this.isString = true;
        }
        break;
      case "boolean":
        this.isBoolean = true;
        break;
    }

    if (prop['maxLength']) {
      this.maxLength = +prop['maxLength'];
    }

    if (prop['minLength']) {
      this.maxLength = +prop['minLength'];
    }

    if (prop['maximum']) {
      this.maxLength = +prop['maximum'];
    }

    if (prop['maxLength']) {
      this.maxLength = +prop['maxLength'];
    }

    if (prop['enum']) {
      this.enum = prop['enum'];
    }
  }

  public get enum(): string[] | number[] {
    return this._enum;
  }
  public set enum(value: string[] | number[]) {
    this._enum = value;
  }
  public get maximum(): number | undefined{
    return this._maximum;
  }
  public set maximum(value: number | undefined) {
    this._maximum = value;
  }
  public get minLength(): number | undefined {
    return this._minLength;
  }
  public set minLength(value: number | undefined) {
    this._minLength = value;
  }
  public get maxLength(): number | undefined {
    return this._maxLength;
  }
  public set maxLength(value: number | undefined) {
    this._maxLength = value;
  }
  public get isBoolean(): boolean {
    return this._isBoolean;
  }
  public set isBoolean(value: boolean) {
    this._isBoolean = value;
  }
  public get isNumber(): boolean {
    return this._isNumber;
  }
  public set isNumber(value: boolean) {
    this._isNumber = value;
  }
  public get isGuid(): boolean {
    return this._isGuid;
  }
  public set isGuid(value: boolean) {
    this._isGuid = value;
  }
  public get isDecimal(): boolean {
    return this._isDecimal;
  }
  public set isDecimal(value: boolean) {
    this._isDecimal = value;
  }
  public get isString(): boolean {
    return this._isString;
  }
  public set isString(value: boolean) {
    this._isString = value;
  }
  public get isInteger(): boolean {
    return this._isInteger;
  }
  public set isInteger(value: boolean) {
    this._isInteger = value;
  }
  public get isEmail(): boolean {
    return this._isEmail;
  }
  public set isEmail(value: boolean) {
    this._isEmail = value;
  }
  public get isDate(): boolean {
    return this._isDate;
  }
  public set isDate(value: boolean) {
    this._isDate = value;
  }
  public get isDateTime(): boolean {
    return this._isDateTime;
  }
  public set isDateTime(value: boolean) {
    this._isDateTime = value;
  }
  public get minimum(): number | undefined {
    return this._minimum;
  }
  public set minimum(value: number | undefined) {
    this._minimum = value;
  }
}

export class SwaggerModel implements SwaggerModelDefine {
  private _properties: SwaggerModelPropertyDefine[] = [];

  constructor(public readonly name: string) {
  }

  get properties() {
    return this._properties;
  }

  addProperty(prop: SwaggerModelPropertyDefine) {
    this._properties.push(prop);
  }

}
