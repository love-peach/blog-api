const dbHelper = require('../dbhaper/blog');
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
      result = await dbHelper.findById(reqQuery.id);
    } else {
      result = await dbHelper.findSome(reqQuery);
    }
  } else {
    result = await dbHelper.findAll();
  }

  ctx.body = result;
};

/**
 * 查 动态路由 id
 */
exports.detail = async (ctx) => {
  const { id } = ctx.params;
  if (!tool.validatorsFun.numberAndCharacter(id)) {
    throw new ApiError(ApiErrorNames.LEGAL_ID);
  }
  const result = await dbHelper.findById(id).catch((err) => {
    throw new ApiError(err.name, err.message);
  });
  ctx.body = result;
};

/**
 * 添加
 */
exports.add = async (ctx) => {
  const dataObj = ctx.request.body;
  const result = await dbHelper.add(dataObj);

  ctx.body = result;
};

/**
 * 更新
 */
exports.update = async (ctx) => {
  const ctxParams = ctx.params;
  // 合并 路由中的参数 以及 发送过来的参数
  // 路由参数 以及发送的参数可能都有 id 以 发送的 id 为准，如果没有，取路由中的 id
  const dataObj = Object.assign({}, ctxParams, ctx.request.body);
  const result = await dbHelper.update(dataObj);

  ctx.body = result;
};

/**
 * 删除
 */
exports.delete = async (ctx) => {
  const ctxParams = ctx.params;
  // 合并 路由中的参数 以及 发送过来的参数
  // 路由参数 以及发送的参数可能都有 id 以 发送的 id 为准，如果没有，取路由中的 id
  const dataObj = Object.assign({}, ctxParams, ctx.request.body);
  const result = await dbHelper.delete(dataObj.id);
  if (result) {
    ctx.body = true;
  } else {
    throw new ApiError(ApiErrorNames.UNEXIST_ID);
  }
};
