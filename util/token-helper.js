const jwt = require('jsonwebtoken');
const config = require('../config/index');
const tool = require('../util/tool');

exports.createToken = (user) => {
  const token = jwt.sign({ userId: user._id }, config.tokenSecret, { expiresIn: '1h' });
  return token;
};

exports.checkToken = (shouldCheckPathArray, unlessCheckPathArray) => async (ctx, next) => {
  const currentUrl = ctx.request.url;
  const { method } = ctx.request;

  const unlessCheck = unlessCheckPathArray.some(url => currentUrl.indexOf(url) > -1);

  const shouldCheck = shouldCheckPathArray.some(url => currentUrl.indexOf(url) > -1) && method !== 'GET';

  if (shouldCheck && !unlessCheck) {
    const token = tool.getTokenFromCtx(ctx);
    if (token) {
      try {
        jwt.verify(token, config.tokenSecret, {
          complete: true,
        });
        await next();
      } catch (error) {
        ctx.status = 401;
        ctx.body = 'token 过期';
      }
    } else {
      ctx.status = 401;
      ctx.body = '无 token，请登录';
    }
  } else {
    await next();
  }
};
