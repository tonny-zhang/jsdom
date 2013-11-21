var util = require('../curl-weibo/util');

util.curl('misc.weather.com.cn',80,'/',function(err,data){
	console.log(err,data);
});