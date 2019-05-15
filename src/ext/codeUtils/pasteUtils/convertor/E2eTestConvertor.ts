import { CodeConvertor } from '../PasteNode';
import { TestUnitDefine } from '../TestUnitDefine';

export class E2eTestConvertor implements CodeConvertor {
  convert(testUnits: TestUnitDefine[]): string {
    const returnContents : string[] = [];

    const successTests = testUnits.filter(testUnit => {
      return String(testUnit.status).startsWith('2');
    });

    const failTests = testUnits.filter(testUnit => {
      return String(testUnit.status).startsWith('4');
    });

    returnContents.push(...this.getSuccessTests(successTests));
    returnContents.push(...this.getFailTests(failTests));

    return returnContents.join('\n');
  }

  private mayBeSearch(name: string): boolean {
    const searchs = ['search', 'findall'];
    const lowerName = name.toLowerCase();
    for (let search of searchs) {
      if (lowerName.includes(search)) { return true; }
    }
    return false;
  }

  private genGetTest(testUnit: TestUnitDefine): string[] {
    const contents: string[] = [];

    contents.push(`  const {`);
    for (let name of testUnit.pathParamNames) {
      contents.push(`    ${name},`);
    }
    contents.push(`  } = Payload`);
    contents.push(`  const res = await getRequest(formatSearchUrl(queryParams), USER1_TOKEN)`);
    contents.push(`  should.equal(res.status, httpStatus.OK);`);
    contents.push(`  const record = res.body;`);
    contents.push(`  const obj = await TheModel.findOne({ where: { id: 'get id' }, paranoid: false });`);
    contents.push(`  await assertGetBody(record, obj);`);

    return contents;
  }

  private genSearchTest(testUnit: TestUnitDefine): string[] {
    const contents: string[] = [];

    contents.push(`  const {`);
    for (let name of testUnit.pathParamNames) {
      contents.push(`    ${name},`);
    }
    contents.push(`  } = Payload`);
    contents.push(`  const res = await getRequest(formatGetUrl(queryParams), USER1_TOKEN)`);
    contents.push(`  should.equal(res.status, httpStatus.OK);`);
    contents.push(`  const record = res.body;`);
    contents.push(`  const filters = RECORDS.filter(item => String(item.id) === 'filter condition');`);
    contents.push(`  await assertSearchBody(record, filters);`);

    return contents;
  }

  private genPostTest(testUnit: TestUnitDefine): string[] {
    const contents: string[] = [];

    contents.push(`  const {`);
    for (let name of testUnit.pathParamNames) {
      contents.push(`    ${name},`);
    }
    contents.push(`    body`);
    contents.push(`  } = Payload`);
    contents.push(`  const oldObj = await TheModel.findOne({ where: { id: 'new id' }, paranoid: false });`);
    contents.push(`  should.equal(true, _.isNull(oldObj));`);
    contents.push(`  const before = moment()`);
    contents.push(`  const res = await postRequest(formatCreateUrl(id1, id2, id3), body, USER1_TOKEN)`);
    contents.push(`  should.equal(res.status, testData.HTTP_STATUS.CREATE_SUCCESS)`);
    contents.push(`  const obj = await TheModel.findOne({ where: { id: 'new id' }, paranoid: false });`);
    contents.push(`  const record = res.body`);
    contents.push(`  should.equal(true, moment(record.createOn.isAfter(before));`);
    contents.push(`  await assertCreateBody(record, obj, USER1_ID);`);
    contents.push(`  await assertCreateBody(record, body);`);

    return contents;
  }

  private genPutTest(testUnit: TestUnitDefine): string[] {
    const contents: string[] = [];

    contents.push(`  const {`);
    for (let name of testUnit.pathParamNames) {
      contents.push(`    ${name},`);
    }
    contents.push(`    body`);
    contents.push(`  } = Payload`);
    contents.push(`  const oldObj = await TheModel.findOne({ where: { id: 'updated id' }, paranoid: false });`);
    contents.push(`  const res = await putRequest(formatUpdateUrl(id1, id2, id3), body, USER1_TOKEN)`);
    contents.push(`  should.equal(res.status, httpStatus.OK)`);
    contents.push(`  const record = res.body`);
    contents.push(`  const obj = await TheModel.findOne({ where: { id: 'updated id' }, paranoid: false });`);
    contents.push(`  await assertUpdateBody(oldObj, obj)`);
    contents.push(`  await assertUpdateBody(record, obj, USER1_ID);`);
    contents.push(`  await assertUpdateBody(record, body)`);

    return contents;
  }

  private genPatchTest(testUnit: TestUnitDefine): string[] {
    const contents: string[] = [];

    contents.push(`  const {`);
    for (let name of testUnit.pathParamNames) {
      contents.push(`    ${name},`);
    }
    contents.push(`    body`);
    contents.push(`  } = Payload`);
    contents.push(`  const oldObj = await TheModel.findOne({ where: { id: 'updated id' }, paranoid: false });`);
    contents.push(`  const res = await putRequest(formatPartialUpdateUrl(id1, id2, id3), body, USER1_TOKEN)`);
    contents.push(`  should.equal(res.status, httpStatus.OK)`);
    contents.push(`  const record = res.body`);
    contents.push(`  const obj = await TheModel.findOne({ where: { id: 'updated id' }, paranoid: false });`);
    contents.push(`  await assertPartialUpdateBody(oldObj, obj)`);
    contents.push(`  await assertPartialUpdateBody(record, obj, USER1_ID);`);
    contents.push(`  await assertPartialUpdateBody(record, body)`);

    return contents;
  }

  private genDeleteTest(testUnit: TestUnitDefine): string[] {
    const contents: string[] = [];

    contents.push(`  const {`);
    for (let name of testUnit.pathParamNames) {
      contents.push(`    ${name},`);
    }
    contents.push(`  } = Payload`);
    contents.push(`  const oldObj = await TheModel.findOne({ where: { id: 'deleted id' }, paranoid: false });`);
    contents.push(`  should.exist(oldObj);`);
    contents.push(`  const res = await deleteRequest(formatDeleteUrl(id1, id2, id3), USER1_TOKEN)`);
    contents.push(`  should.equal(res.status, testData.HTTP_STATUS.DELETE_SUCCESS)`);
    contents.push(`  const obj = await TheModel.findOne({ where: { id: 'deleted id' }, paranoid: false });`);
    contents.push(`  should.equal(true, _.isNull(obj));`);

    return contents;
  }

  private getSuccessTests(testUnits: TestUnitDefine[]): string[] {
    const contents: string[] = [];

    for (let testUnit of testUnits) {
      contents.push(`xit('${testUnit.title}', async () => {`);
      switch(testUnit.method.toLowerCase().trim()) {
        case 'get':
          if (this.mayBeSearch(testUnit.title)) {
            contents.push(...this.genSearchTest(testUnit));
          } else {
            contents.push(...this.genGetTest(testUnit));
          }
          break;
        case 'post':
          contents.push(...this.genPostTest(testUnit));
          break;
        case 'put':
          contents.push(...this.genPutTest(testUnit));
          break;
        case 'patch':
          contents.push(...this.genPatchTest(testUnit));
          break;
        case 'delete':
          contents.push(...this.genDeleteTest(testUnit));
          break;
      }
      contents.push(`});`);
    }
    return contents;
  }

  private getFailTests(testUnits: TestUnitDefine[]): string[] {
    const contents: string[] = [];
    if (testUnits.length === 0 ) { return contents; }

    contents.push(`const requests = [`);
    for (let testUnit of testUnits) {
      contents.push(`  {`);
      contents.push(`    title: '${testUnit.title}',`);
      contents.push(`    params,`);
      contents.push(`    status: ${this.getHttpStatus(testUnit.status)},`);
      contents.push(`    message: 'Jom.mustPositive().message'`);
      contents.push(`  },`);
    }
    contents.push(`];`);

    return contents;
  }

  private getHttpStatus(status: number): string {
    let ret = 'httpStatus.OK';
    switch(status) {
      case 201:
        ret = 'httpStatus.CREATED';
        break;
      case 204:
        ret = 'httpStatus.NO_CONTENT';
        break;
      case 400:
        ret = 'httpStatus.BAD_REQUEST';
        break;
      case 401:
        ret = 'httpStatus.UNAUTHORIZED';
        break;
      case 403:
        ret = 'httpStatus.FORBIDDEN';
        break;
      case 404:
        ret = 'httpStatus.NOT_FOUND';
        break;
      case 409:
        ret = 'httpStatus.CONFLICT';
        break;
    }
    return ret;
  }
}
