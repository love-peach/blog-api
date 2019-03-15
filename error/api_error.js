const ApiErrorMap = require('./api_error_map');

/**
 * 自定义Api异常
 */
class ApiError extends Error {
  // 构造方法
  constructor(errorName, errorMsg) {
    super();

    let errorInfo = {};
    if (errorMsg) {
      errorInfo = {
        code: errorName,
        message: errorMsg,
      };
    } else {
      errorInfo = ApiErrorMap.get(errorName);
    }
    // TODO: 这句话 很重要。刚开始 我把这句话注释了，会导致一个问题。
    // 就是在 controllers 中 无法返回正确的 code。
    /*
      await dbHelper.update(dataObj).then((res) => {
        if (res) {
          ctx.body = res;
        } else {
          throw new ApiError(ApiErrorNames.UNEXIST_ID);
        }
      }).catch((err) => {
        throw new ApiError(err.name, err.message);
      });
    */
    // catch 本来是捕获那些意外的错误。但是 在 then 中 我们 抛出了一个错误，这样的话，也会被 catch 捕获到，
    // 所以需要 this.name = errorInfo.code; 这样，在 catch 中 err.name 就能返回正确的错误码了 不然 就是 'Error'
    this.name = errorName;
    this.code = errorInfo.code;
    this.message = errorInfo.message;
  }
}

module.exports = ApiError;
