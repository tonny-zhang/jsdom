var util = require('../curl-weibo/util');
util.curl('tianqi.2345.com',80,'/air-54511.htm?qq-pf-to=pcqq.c2c',function(err,data){
	console.log(err,data);
});