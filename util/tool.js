exports.isEmptyObject = obj => Object.keys(obj).length === 0;

/**
 * @description 从 ctx 中 获取 token
 */
exports.getTokenFromCtx = (ctx) => {
  let myToken;
  const authorization = ctx.get('Authorization');
  if (authorization) {
    [, myToken] = authorization.split(' ');
  } else if (ctx.request && ctx.request.body && ctx.request.body.token) {
    myToken = ctx.request.body.token;
  } else if (ctx.query && ctx.query.token) {
    myToken = ctx.query.token;
  }
  return myToken;
};

/**
 * @description 常规正则校验表达式
 */
exports.validatorsExp = {
  number: /^[0-9]*$/,
  numberAndCharacter: /^[0-9a-zA-Z]+$/,
  nameLength: n => new RegExp(`^[\\u4E00-\\u9FA5]{${n},}$`),
  idCard: /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/,
  backCard: /^([1-9]{1})(\d{15}|\d{18})$/,
  phone: /^1[23456789]\d{9}$/,
  email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
};

/**
 * @description 常规正则校验方法
 */
exports.validatorsFun = {
  number: val => exports.validatorsExp.number.test(val),
  numberAndCharacter: val => exports.validatorsExp.numberAndCharacter.test(val),
  idCard: val => exports.validatorsExp.idCard.test(val),
  backCard: val => exports.validatorsExp.backCard.test(val),
};
