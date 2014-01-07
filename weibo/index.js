var weibo = require('node-weibo');

// change appkey to yours
var appkey = '2849184197';
var secret = '7338acf99a00412983f255767c7643d0';
var oauth_callback_url = 'your callback url';
appkey = '125935819';
secret = '6ec7a684dc000c8dcd036440d5f1f209';
oauth_callback_url = 'http://apps.weibo.com/jupianyiapp';
weibo.init('weibo', appkey, secret);

var user = { blogtype: 'weibo' };
var cursor = {count: 20};
weibo.public_timeline(user, cursor, function (err, statuses) {
  if (err) {
    console.error(1,err);
  } else {
    console.log(statuses);
  }
});