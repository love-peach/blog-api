module.exports = {
  name: 'blog-api',
  port: process.env.PORT || 3000,
  apiPrefix: 'api',
  database: 'mongodb://localhost:27017/blog-api',
  tokenSecret: 'my_token',
};
