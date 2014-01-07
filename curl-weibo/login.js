var util = require('./util');
var curl = util.curl;
var base64_encode = util.base64_encode;
var sha1 = util.sha1;
var sinaSSOEncoder = util.sinaSSOEncoder;
var querystring = require("querystring");

var REG_JSON = /{.*}/;
var weibo_conf = {
	'username': 'wodexintiao@sina.com',
	'pwd': '1988221'
}

var username = weibo_conf.username;
username = sinaSSOEncoder.base64.encode(querystring.stringify({'':username}).substring(1));
// console.log(username);
// console.log(base64_encode(weibo_conf.username));
// console.log(base64_encode(querystring.stringify({'':weibo_conf.username}).substring(1)));
curl("http://login.sina.com.cn/sso/prelogin.php?entry=sso&callback=sinaSSOController.preloginCallBack&su="+username+"&rsakt=mod&client=ssologin.js(v1.4.4)",function(err,data){
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

					var servertime = prelogin_data['servertime'];
					var nonce = prelogin_data['nonce'];
					var rsakv = prelogin_data['rsakv'];
					var rsaPubkey = prelogin_data['pubkey'];
					var RSAKey = new sinaSSOEncoder.RSAKey();
					RSAKey.setPublic(rsaPubkey, "10001");
					var password = RSAKey.encrypt([servertime, nonce].join("\t") + "\n" + password);
					// console.log('----',password);return;
					var post_data = {
				        'entry': 'weibo',
				        'gateway': '1',
				        'from': '',
				        'savestate': '7',
				        'userticket': '1',
				        'ssosimplelogin': '1',
				        'vsnf': '1',
				        'vsnval': '',
				        'su': username,
				        'service': 'miniblog',
				        'servertime': servertime,
				        'nonce': nonce,
				        'pwencode': 'rsa2',
				        'sp': password,
				        'encoding': 'UTF-8',
				        'prelt': '115',
				        'rsakv' : rsakv,
				        'url': 'http://weibo.com/ajaxlogin.php?framelogin=1&callback=parent.sinaSSOController.feedBackUrlCallBack',
				        'returntype': 'META'
				    }
				    curl.post('http://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.4.4)',post_data,function(err,data){
						if(!err){
							console.log(data);
							// callback && callback();
						}
					});
				}
		}
	}
});