;(function(){
	var http = require('http');
	exports.curl = function (host,port,path,callback,timeout){
		callback || (callback = function(){});
		//通过http得到内存中目录结构及要删除的信息
		var req = http.get({
			hostname: host,
			port: port,
			path: path||'/'
		},function(res){
			res.setEncoding('utf8');
			var data = '';
			res.on('data',function(d){
				data += d.toString();
			}).on('end',function(){
				callback(null,data);
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