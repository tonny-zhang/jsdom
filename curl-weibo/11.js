var util = require('./util');
var select = require('soupselect').select,
    htmlparser = require("htmlparser");
var jsdom = require('jsdom');

var REG_SCRIPT_CONTENT = /<script>STK && STK.pageletM && STK.pageletM.view\((.*pl_content_hisFeed.*)\)<\/script>/;
function curl(weiboId){
	util.curl('e.weibo.com',80,'/'+weiboId,function(err,d){
		if(!err){
			var match = d.match(REG_SCRIPT_CONTENT);
			if(match){
				var contentJSON = JSON.parse(match[1]);
				parser(contentJSON.html);
			}
		}else{
			console.log(err);
		}
	});
}
function parser(html){
	jsdom.env({
		html: html,
		done: function (errors, window) {
			console.log(errors,window);
		}
	});
}
function praser1(html){
	var handler = new htmlparser.DefaultHandler(function(err, dom) {
	    if (err) {
	        sys.debug("Error: " + err);
	    } else {

	        // soupselect happening here...
	        dom = select(dom, '.feed_lists');
	        dom.forEach(function(v){
	        	v = select(v,'.feed_list');
	        	v.forEach(function(v1){
	        		v1 = select(v1,'.content');
	        		console.log(select(v1,'[data-type]'));
	        	});
	        });
	        // sys.puts("Top stories from reddit");
	        // titles.forEach(function(title) {
	        //     sys.puts("- " + title.children[0].raw + " [" + title.attribs.href + "]\n");
	        // })
	    }
	});

	var parser = new htmlparser.Parser(handler);
	parser.parseComplete(contentJSON.html);
}
curl('weather01');