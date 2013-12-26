;(function(){
	var http = require('http');
	var url = require('url');
	var resFn = function(res,callback){
		res.setEncoding('utf8');
		var data = '';
		res.on('data',function(d){
			data += d.toString();
		}).on('end',function(){
			callback(null,data);
		});
	}
	exports.curl = function (get_url,callback,timeout){
		callback || (callback = function(){});
		var url_arr = url.parse(get_url);
		var options = {
			host: url_arr.host,
			port: 80,
			path: url_arr.path,
			method: 'GET',
			headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.64 Safari/537.31'}
		}
		//通过http得到内存中目录结构及要删除的信息
		var req = http.get(options,function(res){
			resFn(res,callback);
		});
		req.on('error', function(e) {
			callback(e);
		});
		if(timeout > 0){
			req.setTimeout(timeout,function(){
				req.abort();
				callback(new Error('timeout'));
			});
		}
	}
	var querystring = require('querystring');
	exports.curl.post = function(post_url,post_data,callback){
		var url_arr = url.parse(post_url);
		var options = {
			host: url_arr.host,
			port: 80,
			path: url_arr.path,
			method: 'POST',
			headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.64 Safari/537.31'}
		}
		var req = http.request(options,function(res){
			resFn(res,callback);
		});
		req.on('error', function(e) {
			callback(e);
		});
		req.write(querystring.stringify(post_data)+'\n');
		req.end();
	}
	exports.base64_encode = function(str){
		return new Buffer(str).toString('base64') 
	}
	var crypto = require('crypto');
	exports.sha1 = function(str){
		var shasum = crypto.createHash('sha1');
		shasum.update(str);
		return shasum.digest('hex');
	}
})();