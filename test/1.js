var url = require('url');
console.log(new Buffer('wodexintiao@sina.com').toString('base64'));
console.log(url.parse('http://www.baidu.com/index.html?q=123'));

var crypto = require('crypto')
  , shasum = crypto.createHash('sha1');
shasum.update("hello");
console.log(shasum.digest('hex'));