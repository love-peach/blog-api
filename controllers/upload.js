const { tengxunCosUploader, aliOssUploader, checkFileType } = require('../util/upload-helper');

const dbHelper = require('../dbhelper/upload');
const tool = require('../util/tool');

const ApiError = require('../error/api_error');
const ApiErrorNames = require('../error/api_error_name');


/**
 * 查
 */
exports.find = async (ctx) => {
  let result;
  const reqQuery = ctx.request.query;

  if (reqQuery && !tool.isEmptyObject(reqQuery)) {
    if (reqQuery.id) {
      result = dbHelper.findById(reqQuery.id);
    } else {
      result = dbHelper.findSome(reqQuery);
    }
  } else {
    result = dbHelper.findAll();
  }

  await result.then((res) => {
    if (res) {
      ctx.body = res;
    } else {
      throw new ApiError(ApiErrorNames.UNEXIST_ID);
    }
  }).catch((err) => {
    throw new ApiError(err.name, err.message);
  });
};

/**
 * 查 动态路由 id
 */
exports.detail = async (ctx) => {
  const { id } = ctx.params;
  if (!tool.validatorsFun.numberAndCharacter(id)) {
    throw new ApiError(ApiErrorNames.LEGAL_ID);
  }
  await dbHelper.findById(id).then((res) => {
    if (res) {
      ctx.body = res;
    } else {
      throw new ApiError(ApiErrorNames.UNEXIST_ID);
    }
  }).catch((err) => {
    throw new ApiError(err.name, err.message);
  });
};


/**
 * 添加
 */
exports.addTengxun = async (ctx) => {
  // 上传文件三种方式
  // 1、创建可读流(fs.createReadStream )、创建可写流 (fs.createWriteStream)、可读流通过管道写入可写流 (reader.pipe)
  // 2、直接使用 koa-body 中间件，设置 uploadDir 即可；
  // 3、对接第三方sdk 七牛云 腾讯cos 阿里 oss,返回 可访问地址。

  const { file } = ctx.request.files;
  const params = ctx.request.body;

  if (!checkFileType(file.type)) {
    throw new ApiError(ApiErrorNames.LEGAL_FILE_TYPE);
  }

  await tengxunCosUploader(file, params)
    .then(async (data) => {
      const dataObj = {
        name: file.name,
        path: data.Location,
        size: file.size,
        usedFor: params.usedFor,
      };
      await dbHelper
        .add(dataObj)
        .then((res) => {
          ctx.body = res;
        })
        .catch((err) => {
          throw new ApiError(err.name, err.message);
        });
    })
    .catch((err) => {
      if (typeof err.error === 'string') {
        throw new ApiError('cos 配置错误', err.error);
      } else {
        throw new ApiError(err.Code, err.error.Message);
      }
    });
};


/**
 * 添加
 */
exports.add = async (ctx) => {
  // 上传文件三种方式
  // 1、创建可读流(fs.createReadStream )、创建可写流 (fs.createWriteStream)、可读流通过管道写入可写流 (reader.pipe)
  // 2、直接使用 koa-body 中间件，设置 uploadDir 即可；
  // 3、对接第三方sdk 七牛云 腾讯cos 阿里 oss,返回 可访问地址。

  const { file } = ctx.request.files;
  const params = ctx.request.body;

  if (!checkFileType(file.type)) {
    throw new ApiError(ApiErrorNames.LEGAL_FILE_TYPE);
  }

  await aliOssUploader(file, params)
    .then(async (data) => {
      const dataObj = {
        name: file.name,
        path: data.url,
        size: file.size,
        usedFor: params.usedFor,
      };
      await dbHelper
        .add(dataObj)
        .then((res) => {
          ctx.body = res;
        })
        .catch((err) => {
          throw new ApiError(err.name, err.message);
        });
    })
    .catch((err) => {
      if (typeof err.error === 'string') {
        throw new ApiError('cos 配置错误', err.error);
      } else {
        throw new ApiError(err.Code, err.error.Message);
      }
    });
};


/**
 * 更新
 */
exports.update = async (ctx) => {
  const ctxParams = ctx.params;
  // 合并 路由中的参数 以及 发送过来的参数
  // 路由参数 以及发送的参数可能都有 id 以 发送的 id 为准，如果没有，取路由中的 id
  const dataObj = Object.assign({}, ctxParams, ctx.request.body);
  await dbHelper
    .update(dataObj)
    .then((res) => {
      if (res) {
        ctx.body = res;
      } else {
        throw new ApiError(ApiErrorNames.UNEXIST_ID);
      }
    })
    .catch((err) => {
      throw new ApiError(err.name, err.message);
    });
};

/**
 * 删除
 */
exports.delete = async (ctx) => {
  const ctxParams = ctx.params;
  // 合并 路由中的参数 以及 发送过来的参数
  // 路由参数 以及发送的参数可能都有 id 以 发送的 id 为准，如果没有，取路由中的 id
  const dataObj = Object.assign({}, ctxParams, ctx.request.body);

  await dbHelper.delete(dataObj.id).then((res) => {
    if (res) {
      ctx.body = res;
    } else {
      throw new ApiError(ApiErrorNames.UNEXIST_ID);
    }
  }).catch((err) => {
    throw new ApiError(err.name, err.message);
  });
};
