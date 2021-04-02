//内容开始
if (id=="0"){var yuming="http://7080.wang/json/2345/"}else if(id=="1"){var yuming="http://7080.wang/json/360/"};

if (type=="tv"){url1="tv.php"}else if (type=="dy"||type=="m"){url1="m.php"}else if (type=="dm"||type=="ct"){url1="dm.php"}else if (type=="zy"||type=="va"){url1="zy.php"}
$(function(){
 $.ajax({
 async: true,
 type: "GET",
 dataType: 'jsonp',
 jsonp: 'callback',
 jsonpCallback: 'callbackfunction',
 url: "https://bird.ioliu.cn/v1?url="+yuming+url1+"?q="+lianjie,
 data: "",
 timeout: 3000,
 contentType: "application/json;utf-8",
 success: function(data) {
console.log(data);
var neirong='';
for (var i=0;i<data.url.length;i++)
	{  
	neirong +="<button type='button' onclick='bofang(this)' class='lipbtn' data-href='"+data.url[i]["value"]+"' title='"+data.url[i]["name"]+"'>"+data.url[i]["name"]+"</button>";    
} 

console.log(neirong);
document.getElementById("neirong").innerHTML =neirong;

var vide=data.url[0]["value"];  
document.getElementById("video").src="bo.html?url="+vide ;
document.getElementById("neirong").innerHTML =neirong;
 document.getElementById("name").innerHTML =data.name;
 document.getElementById("zhuang").innerHTML =data.zhuangtai;
  document.getElementById("yuyan").innerHTML ="暂无";
   document.getElementById("time").innerHTML ="暂无";
 document.getElementById("nian").innerHTML ="暂无";
  document.getElementById("diqu").innerHTML ="暂无";
   document.getElementById("daoyan").innerHTML ="暂无";
document.getElementById("fenlei").innerText=data.leixing;
document.getElementById("yanyuan").innerText=data.yanyuan;
 document.getElementById("jiesao").innerText=data.jianjie;
 document.getElementById("tu").src=data.pic;
  document.getElementById("lei").innerText=data.laiyuan;
 }
 });
})