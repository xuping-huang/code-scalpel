import { CodeConvertor } from '../PasteNode';
import { TestUnitDefine } from '../TestUnitDefine';

export class UnitTestConvertor implements CodeConvertor {
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

    contents.push(`  const record = await theService.get(params)`);
    contents.push(`  const obj = await TheModel.findOne({ where: { id: 'get id' }, paranoid: false });`);
    contents.push(`  await assertGetBody(record, obj);`);

    return contents;
  }

  private genSearchTest(testUnit: TestUnitDefine): string[] {
    const contents: string[] = [];

    contents.push(`  const record = await theService.search(params)`);
    contents.push(`  const filters = RECORDS.filter(item => String(item.id) === 'filter condition');`);
    contents.push(`  await assertSearchBody(record, filters)`);

    return contents;
  }

  private genPostTest(testUnit: TestUnitDefine): string[] {
    const contents: string[] = [];

    contents.push(`  const oldObj = await TheModel.findOne({ where: { id: 'new id' }, paranoid: false });`);
    contents.push(`  should.equal(true, _.isNull(oldObj));`);
    contents.push(`  const before = moment()`);
    contents.push(`  const record = await theService.create(params, USER1)`);
    contents.push(`  const obj = await TheModel.findOne({ where: { id: 'new id' }, paranoid: false });`);
    contents.push(`  should.equal(true, moment(record.createdOn.isAfter(before));`);
    contents.push(`  await assertCreateBody(record, obj, USER1_ID);`);
    contents.push(`  await assertCreateBody(record, params);`);

    return contents;
  }

  private genPutTest(testUnit: TestUnitDefine): string[] {
    const contents: string[] = [];

    contents.push(`  const oldObj = await TheModel.findOne({ where: { id: 'updated id' }, paranoid: false });`);
    contents.push(`  const record = await theService.update(params, USER1)`);
    contents.push(`  const obj = await TheModel.findOne({ where: { id: 'updated id' }, paranoid: false });`);
    contents.push(`  await assertUpdateBody(oldObj, obj)`);
    contents.push(`  await assertUpdateBody(record, obj, USER1_ID);`);
    contents.push(`  await assertUpdateBody(record, params)`);

    return contents;
  }

  private genPatchTest(testUnit: TestUnitDefine): string[] {
    const contents: string[] = [];

    contents.push(`  const oldObj = await TheModel.findOne({ where: { id: 'updated id' }, paranoid: false });`);
    contents.push(`  const record = await theService.partiallyUpdate(params, USER1)`);
    contents.push(`  const obj = await TheModel.findOne({ where: { id: 'updated id' }, paranoid: false });`);
    contents.push(`  await assertPartialUpdateBody(oldObj, obj)`);
    contents.push(`  await assertPartialUpdateBody(record, obj, USER1_ID);`);
    contents.push(`  await assertPartialUpdateBody(record, params)`);

    return contents;
  }

  private genDeleteTest(testUnit: TestUnitDefine): string[] {
    const contents: string[] = [];

    contents.push(`  const oldObj = await TheModel.findOne({ where: { id: 'deleted id' }, paranoid: false });`);
    contents.push(`  should.exist(oldObj);`);
    contents.push(`  await theService.delete(params, USER1)`);
    contents.push(`  const obj = await TheModel.findOne({ where: { id: 'deleted id' }, paranoid: false });`);
    contents.push(`  should.equal(true, _.isNull(obj));`);

    return contents;
  }

  private getSuccessTests(testUnits: TestUnitDefine[]): string[] {
    const contents: string[] = [];

    for (let testUnit of testUnits) {
      contents.push(`xit('${testUnit.title}', async () => {`);
      contents.push(`  const params = merge(Payload, { });`);
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
        ret = 'httpStatus.BAD_REqUEST';
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
