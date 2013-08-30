this.test = function(str){
	console.log(1,str);
}
global.test = function(str){
	console.log(12,str);
}
new Function('console.log(this);test("hello")').call({
	'test': function(str){
		console.log(str);
	}
});
this.abc = 123;