var jsdom = require('jsdom');

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
function getWeibo(url, callback) {
	var returnVal = {index:__index++}
	callback || (callback = function(){});
	jsdom.env(
		url, ["http://code.jquery.com/jquery.js"],
		function(errors, window) {
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
				code = $('script:contains(pl.header.head.index)').text();
				if(code){
					var m = code.match(REG_JSON);
					if (m) {
						var jsonObj = JSON.parse(m[0]);
						var logo_img = $(jsonObj.html).find('.pf_head_pic img');
						var title = logo_img.attr('title');
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
	);
}

var weiboConfig = require('./conf').conf;
var startTime = +new Date();
var num = weiboConfig.length;
var totalNum = num;
var dataArr = [];
weiboConfig.forEach(function(v) {
	getWeibo(v.url, function(err,data) {
		if(err){
			console.log(err);
		}else{
			dataArr.push(data);
			console.log('\n===', data.user.title, '===\n');
			console.log(data);
		}
		if(--num == 0){
			console.log('==== 共',totalNum,'个微博，总用时 ',+new Date()-startTime,' ms ===');
			var ejs = require('ejs')
				, fs = require('fs')
  				, path = __dirname + '/weibo.html'
  				, str = fs.readFileSync(path, 'utf8');
			var ret = ejs.render(str,{dataArr:dataArr,escape:function(html){return String(html).replace(/^\s+|\s+$/,'').replace('\'',"\'")}});
			fs.writeFileSync(__dirname+'/result.html',ret, 'utf8');
		}
	});
});