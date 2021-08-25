//内容开始飞飞
url1=feifeiz[id]+"?vodids=";
$(function(){
 $.ajax({
 async: true,
 type: "GET",
 dataType: 'jsonp',
 jsonp: 'callback',
 jsonpCallback: 'callbackfunction',
 url: "https://bird.ioliu.cn/v1?url="+url1+lianjie,
 data: "",
 timeout: 3000,
 contentType: "application/json;utf-8",
 success: function(data) {
//console.log(data);
var neirong='';
var dianbo=data.data[0].vod_url;
var dianbo1=dianbo.replace(/\r/g,",") ;
var dianbo2=dianbo1.replace(/\$/g,",") ;
var dianbo3=dianbo2.replace(",,,",",") ;
var strs= new Array();
strs=dianbo3.split(","); 
for (i=0;i<strs.length ;i+=2)
{
    neirong +="<button type='button' onclick='bofang(this)' class='lipbtn' data-href='"+strs[i+1]+"' title='"+strs[i]+"'>"+strs[i]+"</button>";
}
var vide=strs[1];  
document.getElementById("video").src="./bo.html?url="+vide ;
document.getElementById("neirong").innerHTML =neirong;
 document.getElementById("name").innerHTML =data.data[0].vod_name;
 document.getElementById("zhuang").innerHTML =data.data[0].vod_continu;
  document.getElementById("yuyan").innerHTML =data.data[0].vod_language;
   document.getElementById("time").innerHTML =data.data[0].vod_addtime;
 document.getElementById("nian").innerHTML =data.data[0].vod_year;
  document.getElementById("diqu").innerHTML =data.data[0].vod_area;
   document.getElementById("daoyan").innerHTML =data.data[0].vod_director;
document.getElementById("fenlei").innerText=data.data[0].list_name;
document.getElementById("yanyuan").innerText=data.data[0].vod_actor;
 document.getElementById("jiesao").innerText=data.data[0].vod_content;
 document.getElementById("tu").src=data.data[0].vod_pic;
  var lei=data.data[0].vod_play;
 var lei1=lei.replace(/\$\$\$/g,"+") ;
  document.getElementById("lei").innerText=lei1;
 }
 });
})
