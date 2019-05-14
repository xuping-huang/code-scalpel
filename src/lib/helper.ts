// import * as _ from 'lodash';

const INT_NAMES = ['int', 'int32', 'integer', 'smallint', 'tinyint', 'mediumint'];
const LONT_NAMES = ['long', 'int64', 'bigint'];
const FLOAT_NAMES = ['float'];
const DOUBLE_NAMES = ['double', 'real'];
const DECIMAL_NAMES = ['numeric', 'decimal'];
const BOOLEAN_NAMES = ['bool', 'boolean'];
const DATE_ONLY_NAMES = ['date'];
const DATETIME_NAMES = ['datetime', 'timestamp'];
const BLOB_NAMES = ['binary', 'varbinary', 'blob'];
const UUID_NAMES = ['uuid', 'guid'];
const JSON_NAMES = ['json'];
const TEXT_NAMES = ['text'];
const INT_MAX_LENGTH = 10;
const STRING_MAX_LENGTH = 4000;
export function isIntegerColumn(name: string, length: number = 10, precision: number = 0): boolean {
  if (INT_NAMES.includes(name)) {
    return true;
  } else if (name === 'numeric') {
    return precision < 1 && length < INT_MAX_LENGTH;
  }
  return false;
}

export function isLongColumn(name: string, length: number = 10, precision: number = 0): boolean {
  if (LONT_NAMES.includes(name)) {
    return true;
  } else if (name === 'numeric') {
    return precision < 1 && length > INT_MAX_LENGTH - 1;
  }
  return false;
}

export function isFloatColumn(name: string, length: number = 24, precision: number = 6): boolean {
  if (FLOAT_NAMES.includes(name)) {
    return true;
  }
  return false;
}

export function isDoubleColumn(name: string, length: number = 24, precision: number = 6): boolean {
  if (DOUBLE_NAMES.includes(name)) {
    return true;
  }
  return false;
}

export function isDecimalColumn(name: string, length: number = 24, precision: number = 6): boolean {
  if (DECIMAL_NAMES.includes(name)) {
    return true;
  }
  return false;
}

export function isByteArrayColumn(name: string): boolean {
  if (BLOB_NAMES.includes(name)) {
    return true;
  }
  return false;
}

export function isBooleanColumn(name: string): boolean {
  if (BOOLEAN_NAMES.includes(name)) {
    return true;
  }
  return false;
}

export function isDateColumn(name: string): boolean {
  if (DATE_ONLY_NAMES.includes(name)) {
    return true;
  }
  return false;
}

export function isDateTimeColumn(name: string): boolean {
  if (DATETIME_NAMES.includes(name)) {
    return true;
  }
  return false;
}

export function isUuidColumn(name: string): boolean {
  if (UUID_NAMES.includes(name)) {
    return true;
  }
  return false;
}

export function isJsonColumn(name: string): boolean {
  if (JSON_NAMES.includes(name)) {
    return true;
  }
  return false;
}

export function isStringColumn(name: string): boolean {
  return true;
}

export function isTextColumn(name: string, length: number = 100): boolean {
  if (TEXT_NAMES.includes(name)) {
    return true;
  } else if (name === 'varchar') {
    return length > STRING_MAX_LENGTH;
  }
  return false;
}
