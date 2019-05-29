const Model = require('../models/upload');

/**
 * 查找全部
 */
exports.findAll = () => Model.find().exec();

/**
 * 查找多个 筛选
 */
exports.findSome = (data) => {
  const {
    page = 1, limit = 10, sort = '-createdAt',
  } = data;
  const query = {};
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: sort || '-createdAt',
  };

  const result = Model.paginate(query, options);

  return result;
};

/**
 * 查找单个 详情
 */
exports.findById = id => Model.findById(id).exec();

/**
 * 新增
 */
exports.add = data => Model.create(data);

/**
 * 更新
 */
// TODO: 当更新一个不存在的 合法id 时，会返回 204
exports.update = (data) => {
  const { id, ...restData } = data;
  return Model.findOneAndUpdate({ _id: id }, {
    ...restData,
  }, {
    new: true, // 返回修改后的数据
  }).exec();
};

/**
 * 删除
 */
exports.delete = id => Model.findByIdAndDelete(id).exec();