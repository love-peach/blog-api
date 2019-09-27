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
 * 生成密码字符串
 * 33~47：!~/
 * 48~57：0~9
 * 58~64：:~@
 * 65~90：A~Z
 * 91~96：[~`
 * 97~122：a~z
 * 123~127：{~
 * @param length 长度
 * @param hasNum 是否包含数字 1-包含 0-不包含
 * @param hasChar 是否包含字母 1-包含 0-不包含
 * @param hasSymbol 是否包含其他符号 1-包含 0-不包含
 * @param caseSense 是否大小写敏感 1-敏感 0-不敏感
 * @param lowerCase 是否只需要小写，只有当hasChar为0且caseSense为1时起作用 1-全部小写 0-全部大写
 */

exports.genEnCode = (length, hasNum, hasChar, hasSymbol, caseSense, lowerCase) => {
  let m = '';
  if (hasNum === 0 && hasChar === 0 && hasSymbol === 0) return m;
  for (let i = length; i >= 0; i--) {
    const num = Math.floor((Math.random() * 94) + 33);
    if (
      (
        (hasNum === 0) && ((num >= 48) && (num <= 57))
      ) || (
        (hasChar === 0) && ((
          (num >= 65) && (num <= 90)
        ) || (
          (num >= 97) && (num <= 122)
        ))
      ) || (
        (hasSymbol === 0) && ((
          (num >= 33) && (num <= 47)
        ) || (
          (num >= 58) && (num <= 64)
        ) || (
          (num >= 91) && (num <= 96)
        ) || (
          (num >= 123) && (num <= 127)
        ))
      )
    ) {
      i++;
      /* eslint-disable-next-line */
      continue;
    }
    m += String.fromCharCode(num);
  }
  if (caseSense === 0) {
    m = (lowerCase === 0) ? m.toUpperCase() : m.toLowerCase();
  }
  return m;
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
