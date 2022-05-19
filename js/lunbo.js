
  $(function (){
  var url1="https://api.web.360kan.com/v1/block?blockid=522";
        $.ajax({
            type: "get",
       dataType: 'jsonp',
            url: url1,
            data: "", 
			cache: true,
          async: true,
		  jsonp: 'callback',
  jsonpCallback: '__jp2',
          timeout: 8000,
    contentType: "application/json;utf-8",
             success: function(data) {
				// console.log(data);
              var luntu="";var luntu1="";
for(var i=0,l=3;i<l;i++){
luntu+='<li><a href="./play.html?q='+data.data.lists[i].ent_id+'&id='+data.data.lists[i].cat+'&zy=360&html=1.html" target="_blank"><img src="'+data.data.lists[i].pic_lists[0].url+'"></a></li>';
//luntu1+='<li jumpImg="'+i+'"></li>';
}
document.getElementById("lunbotu").innerHTML=luntu;
//document.getElementById("lunbotu1").innerHTML=luntu;
console.log(luntu);
            }  })
    })

//定时器返回值
var time=null;
//记录当前位子
var nexImg = 0;
//用于获取轮播图图片个数
var imgLength = $(".c-banner .banner ul li").length;
//当时动态数据的时候使用,上面那个删除
// var imgLength =0;
//设置底部第一个按钮样式
$(".c-banner .jumpBtn ul li[jumpImg="+nexImg+"]").css("background-color","black");

//页面加载
$(document).ready(function(){
	// dynamicData();
	//启动定时器,设置时间为3秒一次
	time =setInterval(intervalImg,3000);
});



//轮播图
function intervalImg(){
	if(nexImg<imgLength-1){
		nexImg++;
	}else{
		nexImg=0;
	}
	
	//将当前图片试用绝对定位,下一张图片试用相对定位
	$(".c-banner .banner ul img").eq(nexImg-1).css("position","absolute");
	$(".c-banner .banner ul img").eq(nexImg).css("position","relative");
	
	$(".c-banner .banner ul li").eq(nexImg).css("display","block");
	$(".c-banner .banner ul li").eq(nexImg).stop().animate({"opacity":1},1000);
	$(".c-banner .banner ul li").eq(nexImg-1).stop().animate({"opacity":0},1000,function(){
		$(".c-banner .banner ul li").eq(nexImg-1).css("display","none");
	});
	$(".c-banner .jumpBtn ul li").css("background-color","white");
	$(".c-banner .jumpBtn ul li[jumpImg="+nexImg+"]").css("background-color","black");
}

//轮播图底下按钮
//动态数据加载的试用应放在请求成功后执行该代码,否则按钮无法使用
$(".c-banner .jumpBtn ul li").each(function(){
	//为每个按钮定义点击事件
	$(this).click(function(){
		clearInterval(time);
		$(".c-banner .jumpBtn ul li").css("background-color","white");
		jumpImg = $(this).attr("jumpImg");
		if(jumpImg!=nexImg){
			var after =$(".c-banner .banner ul li").eq(jumpImg);
			var befor =$(".c-banner .banner ul li").eq(nexImg);
			
			//将当前图片试用绝对定位,下一张图片试用相对定位
			$(".c-banner .banner ul img").eq(nexImg).css("position","absolute");
			$(".c-banner .banner ul img").eq(jumpImg).css("position","relative");
			
			after.css("display","block");
			after.stop().animate({"opacity":1},1000);
			befor.stop().animate({"opacity":0},1000,function(){
				befor.css("display","none");
			});
			nexImg=jumpImg;
		}
		$(this).css("background-color","black");
		time =setInterval(intervalImg,3000);
	});
});