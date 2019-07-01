const dbHelper = require('../dbhelper/resource');
const tool = require('../util/tool');

const ApiError = require('../error/api_error');
const ApiErrorNames = require('../error/api_error_name');

const resourceTypeDbHelper = require('../dbhelper/resourceType');

const { screenshot, uploadScreenshot } = require('../util/puppeteer-helper');

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
exports.add = async (ctx) => {
  const dataObj = ctx.request.body;
  const token = tool.getTokenFromCtx(ctx);

  const resourcePoster = await screenshot(dataObj);


  console.log(resourcePoster, 'resourcePoster');

  uploadScreenshot(resourcePoster, token, ctx.request.header.origin);

  await dbHelper.add(dataObj).then((res) => {
    // 添加resource item 的同时 更新 resourceType 的 resource 属性
    resourceTypeDbHelper.updateResource({
      resourceTypeId: res.resourceTypeId,
      resourceId: res._id,
    });
    ctx.body = res;
  }).catch((err) => {
    throw new ApiError(err.name, err.message);
  });
  console.log('00');
};

/**
 * 更新
 */
exports.update = async (ctx) => {
  const ctxParams = ctx.params;
  // 合并 路由中的参数 以及 发送过来的参数
  // 路由参数 以及发送的参数可能都有 id 以 发送的 id 为准，如果没有，取路由中的 id
  const dataObj = Object.assign({}, ctxParams, ctx.request.body);
  await dbHelper.update(dataObj).then((res) => {
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
 * 删除
 */
exports.delete = async (ctx) => {
  const ctxParams = ctx.params;
  // 合并 路由中的参数 以及 发送过来的参数
  // 路由参数 以及发送的参数可能都有 id 以 发送的 id 为准，如果没有，取路由中的 id
  const dataObj = Object.assign({}, ctxParams, ctx.request.body);

  await dbHelper.delete(dataObj.id).then((res) => {
    if (res) {
      // 删除回复的同时 更新评论的回复
      resourceTypeDbHelper.deleteResource({
        resourceTypeId: res.resourceTypeId,
        resourceId: res._id,
      });
      ctx.body = res;
    } else {
      throw new ApiError(ApiErrorNames.UNEXIST_ID);
    }
  }).catch((err) => {
    throw new ApiError(err.name, err.message);
  });
};
