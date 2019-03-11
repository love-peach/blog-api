const Model = require('../models/blog');

/**
 * 查找全部
 */
exports.findAll = async () => {
  const query = await Model.find();
  return query;
};

/**
 * 查找多个 筛选
 */
exports.findSome = async (data) => {
  const {
    title, page = 1, limit = 10, sort = '-createdAt',
  } = data;
  const query = {};
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: sort || '-createdAt',
  };

  if (title) {
    const reg = new RegExp(title, 'i');
    query.title = { $regex: reg };
  }

  const result = await Model.paginate(query, options);

  return result;
};

/**
 * 查找单个 详情
 */
exports.findById = async (id) => {
  const query = await Model.findById(id);
  return query;
};

/**
 * 新增
 */
exports.add = async (data) => {
  // const result = new Model(data).save();
  const result = await Model.create(data);
  return result;
};

/**
 * 更新
 */
exports.update = async (data) => {
  const { id, ...restData } = data;
  const result = await Model.findByIdAndUpdate(id, {
    $set: { ...restData },
  }, {
    new: true, // 返回修改后的数据
  });
  return result;
};

/**
 * 删除
 */
exports.delete = async (id) => {
  const result = await Model.findByIdAndDelete(id);
  return result;
};
