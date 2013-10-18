;(function(){
	var http = require('http');
	var iconv = require('iconv-lite'); 
	var BufferHelper = require('bufferhelper');
	exports.curl = function (host,port,path,callback,timeout){
		callback || (callback = function(){});
		//通过http得到内存中目录结构及要删除的信息
		var req = http.get({
			hostname: host,
			port: port,
			path: path||'/'
		},function(res){
			var m = res.headers['content-type'].match(/charset=(.*)/);
			// console.log(m);return;
			var charset = 'utf8';
			if(m){
				charset = m[1];
			}
			// res.setEncoding('gb2312');
			// var data = '';
			var bufferHelper = new BufferHelper();
			res.on('data',function(d){
				// data += d.toString();
				bufferHelper.concat(d);
			}).on('end',function(){
				var content = iconv.decode(bufferHelper.toBuffer(),charset);
				callback(null,content);
				// console.log(content);
			});
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
})();