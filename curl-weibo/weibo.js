var jsdom = require('jsdom');

var REG_JSON = /{.*}/;

function getWeibo(url, callback) {
	callback || (callback = function(){});
	jsdom.env(
		url, ["http://code.jquery.com/jquery.js"],
		function(errors, window) {
			if(errors){
				callback(errors);
			}
			var $ = window.$;
			var data = [];
			var code = $("script:contains('pl_content_hisFeed')").text();
			var m = code.match(REG_JSON);
			if (m) {
				var jsonObj = JSON.parse(m[0]);
				$(jsonObj.html).find('[action-type=feed_list_item]').each(function() {
					var $this = $(this);
					var content = $this.find('p[node-type=feed_list_content]').text();
					var info = $this.find('p.info');
					var time = info.find('a[node-type=feed_list_item_date]').attr('date');
					var from = info.find('a[rel=nofollow]').text();
					var nums = info.find('a[action-type]');
					var commentStr = nums.filter(':contains(评论)').text();
					var match = commentStr.match(/\d+/);
					var commentNum = match ? match[0] : 0;
					var zhuanfaStr = nums.filter(':contains(转发)').text();
					var match = zhuanfaStr.match(/\d+/);
					var zhuanfaNum = match ? match[0] : 0;

					var obj = {
						'content': content,
						'time': time,
						'from': from,
						'commentNum': commentNum,
						'zhuanfaNum': zhuanfaNum
					}
					data.push(obj);
				});
			}
			callback(null,data);
		}
	);
}
var weiboConfig = [{
		'desc': '气象北京',
		'url': 'http://e.weibo.com/qixiangbj'
	}
	// ,{
	// 	'desc': '中国天气网'
	// 	,'url': 'http://e.weibo.com/weather01'
	// }
	// ,{
	// 	'desc': '浙江天气'
	// 	,'url': 'http://e.weibo.com/u/1917050314'
	// }
	// ,{
	// 	'desc': '内蒙古气象服务'
	// 	,'url': 'http://e.weibo.com/u/2735907942'
	// }
	// ,{
	// 	'desc': '吉林气象'
	// 	,'url': 'http://e.weibo.com/u/2506600245'
	// }
	// ,{
	// 	'desc': '中国天气生活'
	// 	,'url': 'http://e.weibo.com/u/1400737000'
	// }
	// ,{
	// 	'desc': '江西气象微博'
	// 	,'url': 'http://e.weibo.com/u/2730752854'
	// }
	// ,{
	// 	'desc': '黑龙江省气象服务中心'
	// 	,'url': 'http://e.weibo.com/hljqxfw'
	// }
	, {
		'desc': '宁夏天气-宁夏气象',
		'url': 'http://e.weibo.com/u/2642215773'
	}
	// ,{
	// 	'desc': ''
	// 	,'url': ''
	// }
	// ,{
	// 	'desc': ''
	// 	,'url': ''
	// }
];
var weiboConfig = [{
	"desc": "旅游天气网",
	"url": "http://weibo.com/2678492723"
}, {
	"desc": "中国天气通",
	"url": "http://weibo.com/2319195074"
}
// , {
// 	"desc": "天气插件",
// 	"url": "http://weibo.com/3002685275"
// }
, {
	"desc": "中国天气网生活",
	"url": "http://weibo.com/1400737000"
}, {
	"desc": "中国天气网气候变化频道",
	"url": "http://weibo.com/2625476957"
}, {
	"desc": "中国兴农网",
	"url": "http://weibo.com/xn121"
}
// , {
// 	"desc": "气象知识",
// 	"url": "http://weibo.com/qixiangzhishi"
// }
, {
	"desc": "气象北京",
	"url": "http://weibo.com/qixiangbj"
}, {
	"desc": "广东天气",
	"url": "http://weibo.com/gdweather"
}, {
	"desc": "浙江天气",
	"url": "http://weibo.com/1917050314"
}, {
	"desc": "内蒙古气象服务",
	"url": "http://weibo.com/2735907942"
}, {
	"desc": "吉林气象",
	"url": "http://weibo.com/2506600245"
}
// , {
// 	"desc": "杨柳青青随风杨",
// 	"url": "http://weibo.com/xzqxgov"
// }
, {
	"desc": "江西气象微博",
	"url": "http://weibo.com/2730752854"
}, {
	"desc": "黑龙江省气象服务中心",
	"url": "http://weibo.com/hljqxfw"
}, {
	"desc": "宁夏天气-宁夏气象",
	"url": "http://weibo.com/2642215773"
}, {
	"desc": "黔气象",
	"url": "http://weibo.com/2735745062"
}
// , {
// 	"desc": "此围脖暂停______",
// 	"url": "http://weibo.com/hnmo"
// }
, {
	"desc": "河北天气",
	"url": "http://weibo.com/hebeiqixiang"
}, {
	"desc": "湖北天气",
	"url": "http://weibo.com/2384152914"
}, {
	"desc": "湖南省天气",
	"url": "http://weibo.com/hunanweather001"
}, {
	"desc": "甘肃气象",
	"url": "http://weibo.com/gsqx"
}, {
	"desc": "江苏气象",
	"url": "http://weibo.com/jsqx"
}, {
	"desc": "四川气象",
	"url": "http://weibo.com/scqx"
}, {
	"desc": "上海市天气",
	"url": "http://weibo.com/2635818911"
}, {
	"desc": "河南气象",
	"url": "http://weibo.com/2202083193"
}, {
	"desc": "辽宁气象",
	"url": "http://weibo.com/1948750172"
}, {
	"desc": "重庆市气象局",
	"url": "http://weibo.com/2143462671"
}, {
	"desc": "新疆气象",
	"url": "http://weibo.com/2268282742"
}, {
	"desc": "山西省气象局",
	"url": "http://weibo.com/2396585524"
}, {
	"desc": "广西气象",
	"url": "http://weibo.com/guangxiweather"
}, {
	"desc": "云南气象",
	"url": "http://weibo.com/2592786632"
}, {
	"desc": "江淮气象",
	"url": "http://weibo.com/anhuiqixiang"
}, {
	"desc": "青海气象",
	"url": "http://weibo.com/qhqxj"
}, {
	"desc": "天津天气",
	"url": "http://weibo.com/qxfwzx"
}, {
	"desc": "山东省气象台",
	"url": "http://weibo.com/sdqx"
}, {
	"desc": "陕西气象",
	"url": "http://weibo.com/qx4006000121"
}, {
	"desc": "福建气象",
	"url": "http://weibo.com/2729096334"
}
// , {
// 	"desc": "白静玉",
// 	"url": "http://weibo.com/weatherbai"
// }
// , {
// 	"desc": "--紫藤花--",
// 	"url": "http://weibo.com/xiaoli01"
// }
// , {
// 	"desc": "李小泉",
// 	"url": "http://weibo.com/lixiaoquan"
// }
// , {
// 	"desc": "斯基慕斯",
// 	"url": "http://weibo.com/shenmemao"
// }
// , {
// 	"desc": "墨-迹生活",
// 	"url": "http://weibo.com/mo1985"
// }
// , {
// 	"desc": "粥粥粥稀稀",
// 	"url": "http://weibo.com/1941391114"
// }
// , {
// 	"desc": "fighterxi",
// 	"url": "http://weibo.com/fighterxi"
// }
// , {
// 	"desc": "开心慧媛",
// 	"url": "http://weibo.com/1182947827"
// }
// , {
// 	"desc": "文静在2013",
// 	"url": "http://weibo.com/1884518661"
// }
// , {
// 	"desc": "劉小珺哇",
// 	"url": "http://weibo.com/1893683844"
// }
// , {
// 	"desc": "动力学的空间",
// 	"url": "http://weibo.com/2189585244"
// }
// , {
// 	"desc": "盈盈猫",
// 	"url": "http://weibo.com/alaly"
// }
];
var startTime = +new Date();
var num = weiboConfig.length;
var totalNum = num;
weiboConfig.forEach(function(v) {
	getWeibo(v.url, function(err,data) {
		if(err){
			console.log(err);
		}else{
			console.log('\n===', v.desc, '===\n');
			console.log(data);
			// console.log(data.length);return;
			// if(data.length){
			// 	// console.log(data);
			// }else{
			// 	console.log(v.desc);
			// }
		}
		if(--num == 0){
			console.log('==== 共',totalNum,'个微博，总用时 ',+new Date()-startTime,' ms ===');
		}
	});
});