//内容开始
if (id=="0"){url1="https://kongbuya.com/api.php/provide/vod/"}else if (id=="1"){url1="https://www.kuaibozy.com/api.php/provide/vod/"}else if (id=="2"){url1="http://api.appearoo.top/api.php/provide/vod/"}else if (id=="3"){url1="http://98hyk.cn/api.php/provide/vod/"}else if (id=="4"){url1="http://zy.zcocc.com/api.php/provide/vod/"}
else if (id=="5"){url1="https://www.hktvyb.com/api.php/provide/vod/"}else if (id=="6"){url1="https://www.beiwoysw.com/api.php/provide/vod/"}
$(function(){
 $.ajax({
 async: true,
 type: "GET",
 dataType: 'jsonp',
 jsonp: 'callback',
 jsonpCallback: 'callbackfunction',
 url: "https://bird.ioliu.cn/v1?url="+url1+"?ac=detail&ids="+lianjie,
 data: "",
 timeout: 3000,
 contentType: "application/json;utf-8",
 success: function(data) {
//console.log(data);
var neirong='';
var dianbo=data.list[0].vod_play_url;
var dianbo1=dianbo.replace(/\r\n/g,",") ;
var dianbo2=dianbo1.replace(/\$/g,",") ;
var dianbo3=dianbo2.replace(/#/g,",") ;
var dianbo4=dianbo3.replace(",,,",",") ;
var strs= new Array();
strs=dianbo4.split(","); 
for (i=0;i<strs.length ;i+=2)
{
    neirong +="<button type='button' onclick='bofang(this)' class='lipbtn' data-href='"+strs[i+1]+"' title='"+strs[i]+"'>"+strs[i]+"</button>";
}
var vide=strs[1];  
document.getElementById("video").src="bo.html?url="+vide ;
document.getElementById("neirong").innerHTML =neirong;
 document.getElementById("name").innerHTML =data.list[0].vod_name;
 document.getElementById("zhuang").innerHTML =data.list[0].vod_remarks;
  document.getElementById("yuyan").innerHTML =data.list[0].vod_lang;
   document.getElementById("time").innerHTML =data.list[0].vod_time;
 document.getElementById("nian").innerHTML =data.list[0].vod_year;
  document.getElementById("diqu").innerHTML =data.list[0].vod_area;
   document.getElementById("daoyan").innerHTML =data.list[0].vod_director;
document.getElementById("fenlei").innerText=data.list[0].type_name;
document.getElementById("yanyuan").innerText=data.list[0].vod_actor;
 document.getElementById("jiesao").innerText=data.list[0].vod_content;
 document.getElementById("tu").src=data.list[0].vod_pic;
 var lei=data.list[0].vod_play_from;
 var lei1=lei.replace(/\$\$\$/g,"+") ;
  document.getElementById("lei").innerText=lei1;
 }
 });
})