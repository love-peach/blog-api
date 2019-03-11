const ApiError = require('../error/api_error');

const responseFormatter = apiPrefix => async (ctx, next) => {
  if (ctx.request.path.startsWith(apiPrefix)) {
    try {
      // 先去执行路由
      await next();
      ctx.body = {
        code: 0,
        message: 'success',
        result: ctx.body,
      };
    } catch (error) {
      console.log(error);
      // 如果异常类型是API异常，将错误信息添加到响应体中返回。
      if (error instanceof ApiError) {
        ctx.body = {
          code: error.code,
          message: error.message,
        };
      }
      // 继续抛，让外层中间件处理日志
      // throw error;
    }
  } else {
    await next();
  }
};

module.exports = responseFormatter;
