const ApiError = require('../error/api_error');
const ApiErrorNames = require('../error/api_error_name');

const responseFormatter = apiPrefix => async (ctx, next) => {
  if (ctx.request.path.startsWith(apiPrefix)) {
    try {
      // 先去执行路由
      await next();

      if (ctx.response.status === 404) {
        throw new ApiError(ApiErrorNames.NOT_FOUND);
      } else {
        ctx.body = {
          code: 'success',
          message: '成功!',
          result: ctx.body,
        };
      }
    } catch (error) {
      // 如果异常类型是API异常，将错误信息添加到响应体中返回。
      if (error instanceof ApiError) {
        ctx.body = {
          code: error.code,
          message: error.message,
        };
      } else {
        // 走到这里 说明代码有错误 0_0
        /*
        error 对象解析:
        name: 错误名
        number: 错误号
        description: 描述
        message: 错误信息,多同description

        EvalError: 错误发生在eval()中
        SyntaxError: 语法错误,错误发生在eval()中,因为其它点发生SyntaxError会无法通过解释器
        RangeError: 数值超出范围
        ReferenceError: 引用不可用
        TypeError: 变量类型不是预期的
        URIError: 错误发生在encodeURI()或decodeURI()中
        */
        ctx.status = 400;
        ctx.response.body = {
          code: error.name,
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
