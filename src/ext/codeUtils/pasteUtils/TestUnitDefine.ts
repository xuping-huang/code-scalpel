/**
 * Test Unit define
 */
export interface TestUnitDefine {
  title: string;
  method: string;
  pathParams: string[];
  status: number;
  tokenType: TokenType;
  body: string;
  pathParamNames: string[]
}

export enum TokenType {
  Normal,
  Invalid,
  Expired,
  Forbidden
}
