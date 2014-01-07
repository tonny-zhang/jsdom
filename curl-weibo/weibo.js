var jsdom = require('jsdom');
var fs = require('fs');
var path = require('path');
//引入包
var weibo = require("weiboapi");

var __index = 0;
/*时间格式化*/
Date.prototype.format = function(format){
	format || (format = 'yyyy-MM-dd hh:mm:ss');
	var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(),    //day
		"h+" : this.getHours(),   //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3),  //quarter
		"S" : this.getMilliseconds() //millisecond
	}
	if(/(y+)/.test(format)){
		format = format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length));
	} 
	for(var k in o){
		if(new RegExp("("+ k +")").test(format)){
			format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] :("00"+ o[k]).substr((""+ o[k]).length));
		}
	}
	
	return format;
}
var username = 'info@weather.com.cn';
var pwd = '!@#123';
var checkloginUrl = 'http://weibo.com/u/3972127579/home?wvr=5'
weibo.login(username, pwd,checkloginUrl, function(err, API) {
	function getWeibo(conf,callback){
		var returnVal = {index:__index++}
		var m = conf.url.match(/http:\/\/weibo.com\/(\w+?)$/);
		if(m){
			var id = m[1];
			var nick = conf.desc;
			API.getTimeline(id, 1, function(err, result) {
	            if (!err) {
	                var data = result.data;
	                data = data.splice(0,3);
	                data.forEach(function(v){
	                	if(v.pic){
	                		v.bpic = v.pic.replace('thumbnail','large');
	                	}
	                });
	                returnVal.list = data;
	                API.getShow(result.uid||id, function(err1, result) {
			           if(err){
			           		callback(err1);
			           }else{
			           		var d = result.data;
			           		returnVal.user = {'title':d.nick||nick,'icon':d.icon};
			           	 	callback(null,returnVal);
			           }
			        })
	            }else{
	            	callback(err);
	            }
	        })
		}
	}
	function weibo_list(){
		var conf = require('./conf');
		var weiboConfig = conf.conf;
		var startTime = +new Date();
		var num = weiboConfig.length;
		var totalNum = num;
		var dataArr = [];
		weiboConfig.forEach(function(v) {
			getWeibo(v, function(err,data) {
				if(err){
					console.log(err);
				}else{
					data.special = v.special || 0;
					dataArr.push(data);
					console.log('\n===', data.user.title, '===\n');
					console.log(data);
				}
				if(--num == 0){
					console.log('==== 共',totalNum,'个微博，总用时 ',+new Date()-startTime,' ms ===',dataArr);
					var ejs = require('ejs')
						, fs = require('fs')
		  				, str = fs.readFileSync(conf.tplFilePath, 'utf8');
					var ret = ejs.render(str,{
						dataArr: dataArr,
						cDate: new Date().format(),
						escape: function(html){
							return String(html).replace(/^\s+|\s+$/,'').replace('\'',"\'")
						}
					});
					fs.writeFileSync(conf.resultFilePath,ret, 'utf8');
				}
			});
		});
	}
	weibo_list();
});

