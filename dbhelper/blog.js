const Model = require('../models/blog');

// TODO: 此文件中最好返回 Promise。通过 .exec() 可以返回 Promise。
// 需要注意的是 分页插件本身返回的就是 Promise 因此 Model.paginate 不需要 exec()。
// Model.create 返回的也是 Promise

const populateObj = [
  {
    path: 'tags',
    select: 'label value',
  },
  {
    path: 'author',
    select: 'userName avatar',
    populate: {
      path: 'avatar',
      select: 'path name',
      model: 'Upload',
    },
  },
  {
    path: 'category',
    select: 'label value',
  },
];

/**
 * 查找全部
 */
exports.findAll = () => Model.find().populate(populateObj).exec();

/**
 * 查找多个 筛选
 */
exports.findSome = (data) => {
  const {
    title, page = 1, limit = 10, sort = '-createdAt',
  } = data;
  const query = {};
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: sort || '-createdAt',
    populate: populateObj,
  };

  if (title) {
    const reg = new RegExp(title, 'i');
    query.title = { $regex: reg };
  }

  return Model.paginate(query, options);
};

/**
 * 查找单个 详情
 */
exports.findById = id => Model.findById(id).populate(populateObj).exec();

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
