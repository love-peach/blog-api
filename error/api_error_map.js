const ApiErrorNames = require('./api_error_name');

const ApiErrorMap = new Map();

ApiErrorMap.set(ApiErrorNames.UNKNOW_ERROR, { code: ApiErrorNames.UNKNOW_ERROR, message: '未知错误' });
ApiErrorMap.set(ApiErrorNames.LEGAL_ID, { code: ApiErrorNames.LEGAL_ID, message: 'id 不合法' });

module.exports = ApiErrorMap;
