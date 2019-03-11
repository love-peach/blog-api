/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-redeclare */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable block-scoped-var */
/* eslint-disable no-prototype-builtins */
var Promise = require('bluebird');

/**
 * @param {Object}              [query={}]
 * @param {Object}              [options={}]
 * @param {Object|String}         [options.select]
 * @param {Object|String}         [options.sort]
 * @param {Array|Object|String}   [options.populate]
 * @param {Boolean}               [options.lean=false]
 * @param {Boolean}               [options.leanWithId=true]
 * @param {Number}                [options.offset=0] - Use offset or page to set skip position
 * @param {Number}                [options.page=1]
 * @param {Number}                [options.limit=10]
 * @param {Function}            [callback]
 *
 * @returns {Promise}
 */
function paginate(query, options, callback) {
  query = query || {};
  options = Object.assign({}, paginate.options, options);

  const { select } = options;
  const { sort } = options;
  const { populate } = options;
  const lean = options.lean || false;
  const leanWithId = options.hasOwnProperty('leanWithId') ? options.leanWithId : true;

  const limit = options.hasOwnProperty('limit') ? options.limit : 10;
  let skip; let offset; let
    page;

  if (options.hasOwnProperty('offset')) {
    offset = options.offset;
    skip = offset;
  } else if (options.hasOwnProperty('page')) {
    page = options.page;
    skip = (page - 1) * limit;
  } else {
    offset = 0;
    page = 1;
    skip = offset;
  }

  const promises = {
    docs: Promise.resolve([]),
    count: this.countDocuments(query).exec(),
  };

  if (limit) {
    var query = this.find(query)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(lean);

    if (populate) {
      [].concat(populate).forEach((item) => {
        query.populate(item);
      });
    }

    promises.docs = query.exec();

    if (lean && leanWithId) {
      promises.docs = promises.docs.then((docs) => {
        docs.forEach((doc) => {
          doc.id = String(doc._id);
        });

        return docs;
      });
    }
  }

  return Promise.props(promises)
    .then((data) => {
      const result = {
        list: data.docs,
        total: data.count,
        limit,
      };

      if (offset !== undefined) {
        result.offset = offset;
      }

      if (page !== undefined) {
        result.page = page;
        result.pages = Math.ceil(data.count / limit) || 1;
      }

      return result;
    })
    .asCallback(callback);
}

/**
 * @param {Schema} schema
 */
module.exports = function (schema) {
  schema.statics.paginate = paginate;
};

module.exports.paginate = paginate;
