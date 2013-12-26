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
			'Cookie': 'SINAGLOBAL=3464053741190.5825.1382342748948; UUG=usr431_25; UV5=usr315_204; _s_tentry=login.sina.com.cn; Apache=8133481512777.507.1388021763794; ULV=1388021763807:8:3:2:8133481512777.507.1388021763794:1387760319835; login_sid_t=0400e467dce9489103b59cb15eb74ab8; myuid=1174313174; SUB=AR2RVf27RUt4f3AWlUpkG%2BQYmeWFwe9mBLJ%2FMzwF6AVeW1%2BS%2Fxg2Ip46paKd2NMClJYojm8Px9unWEVROAuU5iRBDkGfumZAEm%2FeSfV0qNSU; UOR=,,login.sina.com.cn; SUE=es%3D5459a78a653a892c803410f0b76c9a32%26ev%3Dv1%26es2%3D25b6f79de165691270291ef18406362d%26rs0%3D5%252BoLZ0kTIj9325xKO90I05l8WmeOQOIh7AVi4FxZoiHClYWc%252FWRP7I0eV7WzHMIXdBB%252BX3hAU8wX3EmlVGx5U8r5xM710oGMtEth5ArfC95I%252FRsCVbdb5F64sDPPoR4k%252BRQ3raP0hkCMu4L0vCjPpGXP67ocoqRnmjNL8Zt%252BymA%253D%26rv%3D0; SUP=cv%3D1%26bt%3D1388034201%26et%3D1388120601%26d%3Dc909%26i%3D7081%26us%3D1%26vf%3D0%26vt%3D0%26ac%3D0%26st%3D0%26uid%3D1174313174%26name%3Dwodexintiao%2540sina.com%26nick%3Dtonny_zhang%26fmp%3D%26lcp%3D; SUS=SID-1174313174-1388034201-JA-gkmih-e8dd2ac067914e48755c7d74e4925952; ALF=1390626195; SSOLoginState=1388034201; un=wodexintiao@sina.com'
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