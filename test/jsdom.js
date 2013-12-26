var jsdom = require('jsdom');
jsdom.defaultDocumentFeatures = {
    FetchExternalResources: ["script"],
    ProcessExternalResources: false
};
jsdom.env({
	url: 'http://www.baidu.com',
	done: function(errors, window) {

	}
})