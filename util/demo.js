const debug = require('debug')('qcloud-sdk[CosUploader]');
const multiparty = require('multiparty');
const readChunk = require('read-chunk');
const shortid = require('shortid');
const fs = require('fs');
const fileType = require('file-type');
const CosSdk = require('cos-nodejs-sdk-v5');
const config = require('../config');


const regionMap = {
  'ap-beijing-1': 'tj',
  'ap-beijing': 'bj',
  'ap-shanghai': 'sh',
  'ap-guangzhou': 'gz',
  'ap-chengdu': 'cd',
  'ap-singapore': 'sgp',
  'ap-hongkong': 'hk',
  'na-toronto': 'ca',
  'eu-frankfurt': 'ger',
};

const ERRORS = {
  // 初始化错误
  ERR_WHEN_INIT_SDK: 'ERR_WHEN_INIT_SDK',
  ERR_INIT_SDK_LOST_CONFIG: 'ERR_INIT_SDK_LOST_CONFIG',
  ERR_WHEN_INIT_MYSQL: 'ERR_WHEN_INIT_MYSQL',

  // 腾讯云代小程序登录
  ERR_REQUEST_PARAM: 'ERR_REQUEST_PARAM',

  // 授权模板错误
  ERR_HEADER_MISSED: 'ERR_HEADER_MISSED',
  ERR_GET_SESSION_KEY: 'ERR_GET_SESSION_KEY',
  ERR_IN_DECRYPT_DATA: 'ERR_IN_DECRYPT_DATA',
  ERR_SKEY_INVALID: 'ERR_SKEY_INVALID',

  // COS 模块错误
  ERR_REQUEST_LOST_FIELD: 'ERR_REQUEST_LOST_FIELD',
  ERR_UNSUPPORT_FILE_TYPE: '不支持的文件类型',
  ERR_FILE_EXCEEDS_MAX_SIZE: '超过文件大小限制',

  // 信道服务错误
  ERR_REMOTE_TUNNEL_SERVER_ERR: 'ERR_REMOTE_TUNNEL_SERVER_ERR',
  ERR_REMOTE_TUNNEL_SERVER_RESPONSE: 'ERR_REMOTE_TUNNEL_SERVER_RESPONSE',
  ERR_UNKNOWN_TUNNEL_ERROR: 'ERR_UNKNOWN_TUNNEL_ERROR',
  ERR_UNLOGIN: 'ERR_UNLOGIN',
  ERR_INVALID_RESPONSE: 'ERR_INVALID_RESPONSE',

  // 数据库错误
  DBERR: {
    ERR_WHEN_INSERT_TO_DB: 'ERR_WHEN_INSERT_TO_DB',
    ERR_NO_SKEY_ON_CALL_GETUSERINFOFUNCTION: 'ERR_NO_SKEY_ON_CALL_GETUSERINFOFUNCTION',
    ERR_NO_OPENID_ON_CALL_GETUSERINFOFUNCTION: 'ERR_NO_OPENID_ON_CALL_GETUSERINFOFUNCTION',
  },
};


const uploader = async (req) => {
  // console.log(req);
  // 初始化 sdk
  const cos = new CosSdk({
    AppId: config.qcloudAppId,
    SecretId: config.qcloudSecretId,
    SecretKey: config.qcloudSecretKey,
    Domain: `http://${req.bucketType}-${config.qcloudAppId}.cos.${config.cos.region}.myqcloud.com/`,
  });

  const maxSize = req.maxSize ? req.maxSize : 10;
  const fieldName = config.cos.fieldName ? config.cos.fieldName : 'file';

  debug('Cos sdk init finished');

  // 初始化 multiparty
  const form = new multiparty.Form({
    encoding: 'utf8',
    maxFilesSize: maxSize * 1024 * 1024,
    autoFiles: true,
    uploadDir: '/tmp',
  });

  return new Promise((resolve, reject) => {
    // 从 req 读取文件
    form.parse(req, (err, fields = {}, files = {}) => {
      err ? reject(err) : resolve({
        fields,
        files,
      });
    });
  }).then(({
    files,
  }) => {
    if (!(fieldName in files)) {
      debug('%s: 请求中没有名称为 %s 的field，请检查请求或 SDK 初始化配置', ERRORS.ERR_REQUEST_LOST_FIELD, fieldName);
      throw new Error(ERRORS.ERR_REQUEST_LOST_FIELD);
    }

    const imageFile = files.file[0];

    /**
     * 判断文件类型
     * 为保证安全默认支持的文件类型有：
     * 图片：jpg jpg2000 git bmp png
     * 音频：mp3 m4a
     * 文件：pdf
     */
    const buffer = readChunk.sync(imageFile.path, 0, 262);
    let resultType = fileType(buffer);

    // 如果无法获取文件的 MIME TYPE 就取 headers 里面的 content-type
    if (!resultType && imageFile.headers && imageFile.headers['content-type']) {
      const tmpPathArr = imageFile.path ? imageFile.path.split('.') : [];
      const extName = tmpPathArr.length > 0 ? tmpPathArr[tmpPathArr.length - 1] : '';
      resultType = {
        mime: imageFile.headers['content-type'],
        ext: extName,
      };
    }

    const allowMimeTypes = req.mimetypes
      ? req.mimetypes : ['image/jpeg', 'image/jp2', 'image/jpm', 'image/jpx', 'image/gif', 'image/bmp', 'image/png', 'audio/mpeg', 'audio/mp3', 'audio/m4a', 'application/pdf'];
    if (!resultType || !allowMimeTypes.includes(resultType.mime)) {
      debug('%s: 不支持类型的文件', ERRORS.ERR_UNSUPPORT_FILE_TYPE, imageFile);
      throw new Error(ERRORS.ERR_UNSUPPORT_FILE_TYPE);
    }

    // 生成上传参数
    const srcpath = imageFile.path;
    const imgKey = `${Date.now()}-${shortid.generate()}${resultType.ext ? `.${resultType.ext}` : ''}`;
    const uploadFolder = config.cos.uploadFolder ? `${config.cos.uploadFolder}/` : '';
    const params = {
      Bucket: req.bucketType,
      Region: config.cos.region,
      Key: `${uploadFolder}${imgKey}`,
      Body: fs.createReadStream(srcpath),
      ContentLength: imageFile.size,
    };

    return new Promise((resolve, reject) => {
      // 检查 bucket 是否存在，不存在则创建 bucket
      cos.getService(params, (err, data) => {
        if (err) {
          reject(err);
          // remove uploaded file
          fs.unlink(srcpath, () => { });
          return;
        }

        // 检查提供的 Bucket 是否存在
        const hasBucket = data.Buckets && data.Buckets.reduce((pre, cur) => pre || cur.Name === `${req.bucketType}-${config.qcloudAppId}`, false);

        if (data.Buckets && !hasBucket) {
          cos.putBucket({
            Bucket: req.bucketType,
            Region: config.cos.region,
            ACL: 'public-read',
          }, (err, data) => {
            if (err) {
              reject(err);
              // remove uploaded file
              fs.unlink(srcpath, () => { });
              return;
            }

            resolve();
          });
        }

        resolve();
      });
    }).then(() => new Promise((resolve, reject) => {
      // 上传图片
      cos.putObject(params, (err, data) => {
        if (err) {
          reject(err);
          // remove uploaded file
          fs.unlink(srcpath, () => { });
          return;
        }

        resolve({
          imgUrl: `https://${req.bucketType}-${config.qcloudAppId}.cos.${config.cos.region}.myqcloud.com/${uploadFolder}${imgKey}`,
          imgUrlv4: `http://${req.bucketType}-${config.qcloudAppId}.cos${regionMap[config.cos.region]}.myqcloud.com/${uploadFolder}${imgKey}`,
          size: imageFile.size,
          mimeType: resultType.mime,
          name: imgKey,
          fileBucket: req.bucketType,
          qcloudAppId: config.qcloudAppId,
          region: config.cos.region,
          uploadFolder,
          imgKey,
        });

        // remove uploaded file
        fs.unlink(srcpath, () => { });
      });
    }));
  }).catch((e) => {
    if (e.statusCode === 413) {
      debug('%s: %o', ERRORS.ERR_FILE_EXCEEDS_MAX_SIZE, e);
      throw new Error(`${ERRORS.ERR_FILE_EXCEEDS_MAX_SIZE}\n${e}`);
    } else {
      throw e;
    }
  });
};

module.exports = {
  uploader,
};
