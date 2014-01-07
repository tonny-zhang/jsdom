//引入包
var weibo = require("weiboapi")
//输入账号和密码 ，成功返回API对象
weibo.login('wodexintiao@gmail.com', '!@#123','', function(err, API) {
// weibo.login('info@weather.com.cn', '!@#123','http://weibo.com/u/3972127579/home?wvr=5', function(err, API) {
    if (!err) {
        //并发请求
        API.getTimeline('weather01', 1, function(err, result) {
            if (!err) {
                var data = result.data
                console.log(result);
                //do something
            }else{
                console.log('--',err);
            }
        })
        // API.getShow('weather01', function(err, result) {
        //     console.log(err,result);
        // })
    }else{
        console.log('--1',err);
    }
});