//内容开始
if (id=="0"){url1="http://v8.tiankongzy.cc/inc/feifei3/?vodids="}else if(id=="1"){url1="https://www.subo988.com/inc/feifei3.4/?vodids="}
else if(id=="2"){url1="http://cj.1886zy.co/inc/feifei3/?vodids="}else if(id=="3"){url1="https://www.mhapi123.com/inc/feifei3/?vodids="}
else if(id=="4"){url1="http://cj.bajiecaiji.com/inc/feifei3bjm3u8/index.php?vodids="}else if(id=="5"){url1="https://www.123ku.com/inc/feifei/?vodids="}else if(id=="6"){url1="http://api.wokuzy.com/feifei34/json/wokuzy_s?vodids="}else if(id=="7"){url1="https://cj.okzy.tv/inc/feifei3ckm3u8s/?vodids="};
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
document.getElementById("video").src="bo.html?url="+vide ;
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
