var statTime = +new Date();
var jsdom = require('jsdom');
var util = require('../curl-weibo/util');
util.curl('tianqi.2345.com',80,'/air-54511.htm?qq-pf-to=pcqq.c2c',function(err,data){
	jsdom.env(
		data, ["http://code.jquery.com/jquery.js"],
		function(errors, window) {
			var $ = window.$;
			// console.log(iconv.decode($('body').html(),'GBK'));
			console.log($('.phrase').text());
			console.log(+new Date()-statTime);
		});
});
