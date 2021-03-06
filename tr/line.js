$(document).ready(function(){
	var draw3hGraph = function(data){
		var dl_items = "",col_items = "",sp_items = [],oldIndex = 0,
			row_num = data.it.it4.length,
			col_num = data.it.it3.length,
		    cel_width = 67,
			cel_height = 38,
			width = cel_width * 8,
            height = cel_height*row_num,
			leftgutter = 11;
		//记录柱状区域
		var rects = [];
		//记录等级
		var levels = [];
		//记录点
		var dots = [];
		//记录路径
		var path=[];
		//记录8个点的临时路径
		var t_path="";
		//记录8个点的色谱值
		var t_sp=[];
		//初始化画布
		var paper = Raphael("svgArea", width, height);
		var drawPath = paper.path(); 
		//设置曲线样式
		drawPath.attr({stroke: "#94c05a", "stroke-width": 2, "stroke-linejoin": "round"});
		for(var i = 0;i < row_num;i++){
			if(i == (Math.round(row_num / 2)-1))
				dl_items += "<dl class='midline'><dt>"+data.it.it4[i].it41+"</dt><dd><span>"+data.it.it4[i].it42+"</span></dd></dl>";
			else
				dl_items += "<dl><dt>"+data.it.it4[i].it41+"</dt><dd><span>"+data.it.it4[i].it42+"</span></dd></dl>";
		}
		//初始化等级
		$("#forecast .items").eq(0).prepend(dl_items);
		for(var i = 0;i < col_num;i++){
			var t = 0,colorItem;
			for(var j = 0;j < row_num;j++){
				if(data.it.it4[j].it41 === data.it.it3[i].it31){
					t=j;
					levels.push(t);
					break;
				}
			}
			var x = cel_width * (i % 8 + 0.5)+leftgutter;
			var y = cel_height * (t + 0.5);
			//初始化路径
			if(i % 8 == 0){
				if(t_path.length != 0)
					path.push(t_path);
				t_path = "";
				t_path = ["M", x, y, "C", x, y];
				if(t_sp.length != 0)
					sp_items.push(t_sp.join(""));
				t_sp.length = 0;
			}
			else{
				t_path = t_path.concat([x, y, x, y]);
			}
			//绘制点
			if(i < 8){
				var dot = paper.circle(x,y,6).attr({fill: "#076ea8", stroke: "#94c05a", "stroke-width": 1});
				dots.push(dot);
				//绘制柱状区域
				rects.push(paper.rect(cel_width*i+leftgutter, 0, cel_width, height).attr({stroke: "none", fill: "#fff", opacity: 0}));
			}
			else{
				var dot = paper.circle(x,y,6).attr({fill: "#076ea8", stroke: "#94c05a", "stroke-width": 1}).hide();
				dots.push(dot);
			}
			var date = data.it.it3[i].it33;
			col_items += "<li>"+date.substring(6,8)+"日"+date.substring(8,10)+"时</li>";
			$.each(color[levels[i]],function(k,v){colorItem = v;});
			t_sp.push("<li style=\"background-color:"+colorItem+"\">"+data.it.it3[i].it31+"</li>");
		}
		//最后8个点
		path.push(t_path);
		//最后8个点色谱
		sp_items.push(t_sp.join(""));
		//初始化时间
		$("#forecast .items").eq(0).find(".time ul").html(col_items);
		//初始化曲线
		drawPath.animate({path: path[0]}, 500);
		//初始化色谱
		$(".items .sp ul").html(sp_items[0]);
		//第一个点增大
		var processFirstDot = function(i){
			var initLevel = levels[i];
			$("#labelText b").html(data.it.it3[i].it31+"&nbsp;:&nbsp;"+data.it.it3[i].it32.substring(0,20));
			$("#labelText").stop().animate({top:cel_height*initLevel,left:(cel_width*0.5+110)});
			dots[i].attr({"r": 9,"stroke-width":3});
		}
		processFirstDot(oldIndex);
		// $("#labelText").show();
		// var forecast_scroll = new weather.scroll({container:'#forecast .time ul',el:'li',flag:8});
		// //记录当前路径的index
		// var path_index = 0;

		// $("#forecast .time .lBtn").click(function(){
		// 	var startIndex = path_index*8;
		// 	index3hGraph.hide(startIndex,dots);
		// 	path_index++;
		// 	if(path_index >= path.length)
		// 		path_index = 0;
		// 	drawPath.animate({path: path[path_index]}, 500);
		// 	startIndex = path_index*8;
		// 	index3hGraph.show(startIndex,dots);
		// 	forecast_scroll.go(8);
		// 	$(".items .sp ul").html(sp_items[path_index]);
		// 	dots[oldIndex].attr({"r": 6,"stroke-width":1});
		// 	processFirstDot(startIndex);
		// 	oldIndex = startIndex;
		// })
		// $("#forecast .time .rBtn").click(function(){
		// 	var startIndex = path_index*8;
		// 	index3hGraph.hide(startIndex,dots);
		// 	path_index--;
		// 	if(path_index < 0)
		// 		path_index = path.length - 1;
		// 	drawPath.animate({path: path[path_index]}, 500);
		// 	startIndex = path_index*8;
		// 	index3hGraph.show(startIndex,dots);
		// 	forecast_scroll.go(-8);
		// 	$(".items .sp ul").html(sp_items[path_index]);
		// 	dots[oldIndex].attr({"r": 6,"stroke-width":1});
		// 	processFirstDot(startIndex);
		// 	oldIndex = startIndex;
		// })
		
		// //鼠标事件
		// for(var i = 0;i < 8;i++){
		// 	(function(i){
		// 		rects[i].hover(function(){
		// 			var curIndex = path_index*8+i,
		// 				level = levels[curIndex],
		// 			    left = cel_width*(i+0.5)+110;
		// 			dots[oldIndex].attr({"r": 6,"stroke-width":1});
		// 			$("#labelText b").html(data.it.it3[curIndex].it31+"&nbsp;:&nbsp;"+data.it.it3[curIndex].it32.substring(0,20));
		// 			dots[curIndex].attr({"r": 9,"stroke-width":3});
		// 			if(left > 450)
		// 				left = cel_width*(i+0.5) - 115;
		// 			$("#labelText").stop().animate({top:cel_height*level,left:left});
		// 			oldIndex = curIndex;
		// 		})
		// 	})(i)
		// }

		// for(var i=0,ii = dots.length;i<ii;i++){
		// 		(function(i){
		// 			dots[i].hover(function(){
		// 			var level = levels[i];
		// 			var left = cel_width*(i%8+0.5)+110;
		// 			$("#labelText b").html(data.it.it3[i].it31+"&nbsp;:&nbsp;"+data.it.it3[i].it32.substring(0,20));
		// 			dots[i].attr({"r": 9,"stroke-width":3});
		// 			if(left > 450)
		// 				left = cel_width*(i+0.5) - 115;
		// 			$("#labelText").stop().animate({top:cel_height*level,left:left});
		// 			dots[oldIndex].attr({"r": 6,"stroke-width":1});
		// 			oldIndex = i;
		// 		})
		// 		})(i)
		// }
	}
	//3天精细化指数预报数据地址
	//var index3hUrl = "data/index3h/"+zstype+"/"+cityid+".html";

	//初始化指数预报
	var index3h = function(){
		//$.ajax({url:index3hUrl,
			//type:'GET',
			//cache:false,
			//success:function(data){
				//data = eval('(' + data + ')');
				//draw3hGraph(data);
				//$("#forecast .items").eq(0).show();
			//},
			//error:function(){
				//$("#forecast .items").eq(0).html("数据加载失败，请<b style=\"color:#076EA8\">重试</b>！").show();
			//}
		//});
		var data = eval('(' + aaa + ')');
		draw3hGraph(data);
	};
	index3h();

})