
process.env.DEBUG = 'test*';

import { JoiSchemaParser } from './JoiSchemaParser';
const cnt = `{
  payload: Joi.array().items(Joi.object().keys({
    eid: Joi.string().trim().required(),
    employeeName: Joi.string(),
    assignmentDate: Joi.string(),
    assignmentDueDate: Joi.string(),
    assignmentState: Joi.string(),
    assignmentType: Joi.string(),
    businessGroup: Joi.string(),
    code: Joi.string(),
    country: Joi.string(),
    courseName: Joi.string().trim().required(),
    hireDate: Joi.string(),
    email: Joi.string(),
    manager: Joi.string(),
    primaryJob: Joi.string(),
    region: Joi.string()
  })).required(),
  ids: Joi.object().keys({
    compId: Joi.id(),
    subCompId: Joi.id(),
    levelId: Joi.id(),
    activityId: Joi.id()
  }).required(),
  ids2: Joi.object().keys({
    compId: Joi.id(),
    subCompId: Joi.id(),
    levelId: Joi.id(),
    activityId: Joi.id()
  }).required(),
  ids3: Joi.object().keys({
    compId: Joi.id(),
    subCompId: Joi.id(),
    levelId: Joi.id(),
    activityId: Joi.id()
  }).required(),
  currentUserEID: Joi.EID()
};`;
// const FIND_ARRAY_ITEMS = /(\w+)\s*:\s*(\s*Joi\.array\(\).items)\(([\s\S]*)\)\)/gmi
// const objItems = cnt.match(FIND_ARRAY_ITEMS);
// console.log(objItems);
const fields = new JoiSchemaParser().parse(cnt);
console.log(fields);
// const FIND_OBJ_KEYS = /(\w+)\s*:\s*([^,]+)((keys\(((?:[^()]*\([^()]*\))*[^()]*?)\)(\.required\(\)|\.optional\(\))?))/gi

// const matches = cnt.match(FIND_OBJ_KEYS);
// console.log(matches);
// const last = cnt.replace(FIND_OBJ_KEYS, '');
// console.log(last);
// console.log('matches![0]')
// console.log(matches![0])
// console.log('matches![1]')
// console.log(matches![1])
// console.log('matches![2]')
// console.log(matches![2])
// console.log('matches![3]')
// console.log(matches![3])
// console.log('matches![4]')
// console.log(matches![4])
// console.log('matches![5]')
// console.log(matches![5])
// console.log('matches![6]')
// console.log(matches![6])

// const FIND_VALUES = /(\w+)\s*:\s*([^,]+\(\w*\))\s*,?/gi;

// const joiParams = [
//   { field: 'criteria', items: testData.Criteria },
//   { field: 'criteria.page', items: testData.JodPage },
//   { field: 'criteria.pageSize', items: testData.JodPageSize },
//   { field: 'criteria.query', items: testData.CriteriaQuery }
// ];
// importEmployeeCourses.schema = {
//   payload: Joi.array().items(Joi.object().keys({
//     eid: Joi.string().trim().required(),
//     employeeName: Joi.string(),
//     assignmentDate: Joi.string(),
//     assignmentDueDate: Joi.string(),
//     assignmentState: Joi.string(),
//     assignmentType: Joi.string(),
//     businessGroup: Joi.string(),
//     code: Joi.string(),
//     country: Joi.string(),
//     courseName: Joi.string().trim().required(),
//     hireDate: Joi.string(),
//     email: Joi.string(),
//     manager: Joi.string(),
//     primaryJob: Joi.string(),
//     region: Joi.string()
//   })).required(),
//   currentUserEID: Joi.EID()
// };
