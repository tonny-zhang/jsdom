var jsdom = require('jsdom');
var fs = require('fs');
var path = require('path');

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

/*抓取微博核心方法*/
function getWeibo(url, callback) {
	var returnVal = {index:__index++}
	callback || (callback = function(){});
	jsdom.env({
		url: url,
		src: [jquery],
		headers: {
			'Cookie': 'SINAGLOBAL=3464053741190.5825.1382342748948; _s_tentry=pm25.in; UUG=usr431_27; UV5=usr313_126; UV5PAGE=usr513_135; Apache=8094938197173.178.1387415111066; ULV=1387415111071:6:1:1:8094938197173.178.1387415111066:1385429274695; myuid=1174313174; SUB=AcucHTmDLSPYWBegy39GoXkZ0%2FvLs8w%2Bz0FTlYSeEOyGp7pX3e5I1GtZGYE%2Fm6mz28zI04ROXLK%2BbhV9Rtpeeu1eqpNcG9%2FURUXlcHmjzxWV; login_sid_t=c37bfb7ea3e906ea893473e9502e34f4; UOR=,,login.sina.com.cn; V5REG=usr3138; appkey=; SUE=es%3Ddeb2836c180cdf1389cd6bcc446f3f76%26ev%3Dv1%26es2%3Db2064d7cb853dc76380bb375d66fca63%26rs0%3DsrMncov%252FVPKPDTKQYGcRwVzRJqAJf9nvYzhgOYlfb97lQP3SUMyl2iMXGMKrw%252B8Hcd%252FNPGiRjUpoHH1jn9zDI3jou0Mt8FTAwJJts2snFEjkF5ZvcqA0arVfNvp5QEHH7qtjNkG1D8C32OuQvSdnjFVX7BGuOp%252BXwt18d9DxYTo%253D%26rv%3D0; SUP=cv%3D1%26bt%3D1387421916%26et%3D1387508316%26d%3Dc909%26i%3Dc718%26us%3D1%26vf%3D0%26vt%3D0%26ac%3D0%26st%3D0%26uid%3D1174313174%26name%3Dwodexintiao%2540sina.com%26nick%3Dtonny_zhang%26fmp%3D%26lcp%3D; SUS=SID-1174313174-1387421916-XD-q1vbd-b8f6bf67ec2a71d4fb87dcc9fc515952; ALF=1390013916; SSOLoginState=1387421916; un=wodexintiao@sina.com; wvr=5'
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