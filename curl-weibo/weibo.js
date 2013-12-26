var jsdom = require('jsdom');
var fs = require('fs');
var path = require('path');
var util = require('./util');
var curl = util.curl;
var base64_encode = util.base64_encode;
var sha1 = util.sha1;
var jquery = fs.readFileSync(path.join(__dirname,'jquery.js')).toString();

var REG_JSON = /{.*}/;

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
var toDate = parseInt(new Date().getTime()/1000) + 3600 * 5
console.log(toDate);
/*抓取微博核心方法*/
function getWeibo(url, callback) {
	var returnVal = {index:__index++}
	callback || (callback = function(){});
	jsdom.env({
		url: url,
		src: [jquery],
		headers: {
			'Cookie': 'SINAGLOBAL=3464053741190.5825.1382342748948; myuid=1174313174; SUB=ActnWcIlIgzc0q81ZGEd%2BoWD72%2F6bvVG1Qgp4D2%2B7TCk6YAksBKf3lx1AR7t1CAc%2B29u0QQJKjmgS9%2FpLMojqVmhh%2BJxp8AmbjBVAltWO6ie; UOR=,,history.gmw.cn; UV5PAGE=usr513_138; _s_tentry=-; Apache=8022246200125.664.1387760318123; ULV=1387760319835:7:2:1:8022246200125.664.1387760318123:1387415111071; V5REG=usr3133; UUG=usr431_24; SUE=es%3D82a4213813a087dabf45d586b2aa2d13%26ev%3Dv1%26es2%3De5a1f65afe063c2c610cb4f37c644997%26rs0%3Dmo88nEWEBkg5W9U%252BOU58pBaVvENUqiORr%252BE%252Bizv6rpL0J%252FBtd588diwZe5hxWzHc9wQ61%252Bzq3ZWLChlApmz2uDoqFRljExWehPGvkf%252BNejfbZI3s10vjHm9qV%252FfuwGj6HZiwowT0lpYGT1SkwVEPFnRb3w2LUiqqa%252BuQeM5pupE%253D%26rv%3D0; SUP=cv%3D1%26bt%3D1387760338%26et%3D1387846738%26d%3Dc909%26i%3D3d45%26us%3D1%26vf%3D0%26vt%3D0%26ac%3D0%26st%3D0%26uid%3D1174313174%26name%3Dwodexintiao%2540sina.com%26nick%3Dtonny_zhang%26fmp%3D%26lcp%3D; SUS=SID-1174313174-1387760338-JA-unmre-008c0358a87487c5c04b48b35cdc5952; ALF=1390352338; SSOLoginState='+toDate+'; un=wodexintiao@sina.com'
		},
		done: function(errors, window) {
			if(errors){
				callback(errors);
			}
			var $ = window.$;
			var code = $('script:contains(pl_leftNav_profilePersonal)').text();
			if(code){
				var m = code.match(REG_JSON);
				if (m) {
					var jsonObj = JSON.parse(m[0]);
					var logo_img = $(jsonObj.html).find('.logo_img');
					var title = logo_img.attr('title');
					var icon = logo_img.find('img').attr('src');
				}
			}else{
				code = $('script:contains("pl\.header\.head\.index")').text();
				if(code){
					var m = code.match(REG_JSON);
					if (m) {
						var jsonObj = JSON.parse(m[0]);
						var logo_img = $(jsonObj.html).find('.pf_head_pic img');
						var title = logo_img.attr('title')||logo_img.attr('alt');
						var icon = logo_img.attr('src');
					}
				}
			}		
			
			
			var itemList = [];
			var code = $("script:contains('pl_content_hisFeed')").text();
			code = code || ($("script:contains('pl.content.homeFeed.index')").text());
			var m = code.match(REG_JSON);
			if (m) {
				var jsonObj = JSON.parse(m[0]);
				$(jsonObj.html).find('[action-type=feed_list_item]').each(function() {
					var $this = $(this);
					var content = $this.find('[node-type=feed_list_content]').html();
					var info = $this.find('p.info');
					var time = new Date(+$this.find('a[node-type=feed_list_item_date]').attr('date')).format();
					var from = $this.find('a[rel=nofollow]').text();
					var nums = $this.find('a[action-type]');
					var commentStr = nums.filter(':contains(评论)').text();
					var match = commentStr.match(/\d+/);
					var commentNum = match ? match[0] : 0;
					var zhuanfaStr = nums.filter(':contains(转发)').text();
					var match = zhuanfaStr.match(/\d+/);
					var zhuanfaNum = match ? match[0] : 0;
					var img = $this.find('.lotspic_list,.piclist').find('img').filter(function(){
						if(!$(this).hasClass('loading_gif')){
							return $(this);
						}
					});
					var imgSrcs = [];
					img.each(function(){
						imgSrcs.push(img.attr('src'));
					});
					var obj = {
						'content': content,
						'time': time,
						'from': from,
						'commentNum': commentNum,
						'zhuanfaNum': zhuanfaNum,
						'img': imgSrcs.splice(0,2)
					}
					itemList.push(obj);
				});
			}
			returnVal.user = {'title':title,'icon':icon};
			returnVal.list = itemList.splice(0,3);
			callback(null,returnVal);
		}
	});
}

var weibo_conf = {
	'user': 'wodexintiao@sina.com',
	'pwd': '1988221'
}
function weibo_list(){
	var conf = require('./conf');
	var weiboConfig = conf.conf;
	var startTime = +new Date();
	var num = weiboConfig.length;
	var totalNum = num;
	var dataArr = [];
	weiboConfig.forEach(function(v) {
		getWeibo(v.url, function(err,data) {
			if(err){
				console.log(err);
			}else{
				data.special = v.special || 0;
				dataArr.push(data);
				console.log('\n===', data.user.title, '===\n');
				console.log(data);
			}
			if(--num == 0){
				console.log('==== 共',totalNum,'个微博，总用时 ',+new Date()-startTime,' ms ===');
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
function login(callback){
	curl("http://login.sina.com.cn/sso/prelogin.php?entry=weibo&callback=sinaSSOController.preloginCallBack&su=" + base64_encode(weibo_conf['user']) + "&client=ssologin.js(v1.4.11)",function(err,data){
		if(!err){			
			var m = data.match(REG_JSON);
			if(m){
				var prelogin_data = JSON.parse(m[0]);
				console.log(prelogin_data);
				if(prelogin_data && 
					prelogin_data['retcode'] === 0 && 
					prelogin_data['servertime'] != null && 
					prelogin_data['nonce'] && 
					prelogin_data['servertime'] != null){

					var post_data = {
						'entry': 'weibo',
			            'gateway': 1,
			            'from': '',
			            'savestate': 7,
			            'useticket': 1,
			            'ssosimplelogin': 1,
			            'su': base64_encode(weibo_conf['user']),
			            'service': 'miniblog',
			            'servertime': prelogin_data['servertime'],
			            'nonce': prelogin_data['nonce'],
			            'pwencode': 'wsse',
			            'sp': sha1(sha1(sha1(weibo_conf['pwd'])) + prelogin_data['servertime'] + prelogin_data['nonce']),
			            'encoding': 'UTF-8',
			            'url': 'http://weibo.com/ajaxlogin.php?framelogin=1&callback=parent.sinaSSOController.feedBackUrlCallBack',
			            'returntype': 'META'
					}
					curl.post('http://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.4.11)',post_data,function(err,data){
						if(!err){
							console.log(data);
							callback && callback();
						}
					});
				}
			}
		}
	});
}
// function login(){
// 	jsdom.env({
// 		url: 'http://weibo.com/',
// 		done: function(errors, window) {
// 			console.log(window.$);
// 		}
// 	});
// 	// curl('http://weibo.com/',function(err,data){
// 	// 	console.log(data);
// 	// });
// }
login();
// weibo_list();

