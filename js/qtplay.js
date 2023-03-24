
//内容开始
var jx="./jx/index.html?url=";
var url4=appzy[id]["url"]+"/detail?vod_id=";
$(function (){
var dataroot=url4+lianjie;
$.getJSON(dataroot, function(data){
	var bolie1="";

  var neirong='';
  for (h=0;h<data.data.vod_play_list.length ;h++){
	  	var neirong1='';
    if(h==0){var neinei="am-tab-panel am-fade am-in am-active";var boliee='am-active';}else{var neinei="am-tab-panel am-fade tv-res"; var boliee='am';}
  bolie1 +='<li class="'+boliee+'" ><a href="#'+data.data.vod_play_list[h].from+'">⏳'+data.data.vod_play_list[h].from+'</a></li>';
    for (i=0;i<data.data.vod_play_list[h].urls.length ;i++)
    {
        neirong1 +='<button type="button" class="am-btn am-btn-sm am-round" title="'+data.data.vod_play_list[h].urls[i].name+'" value="'+jx+data.data.vod_play_list[h].urls[i].url+'"  onclick="GetHref(this);">'+data.data.vod_play_list[h].urls[i].name+'</button>';
    }
  neirong +='<div class="'+neinei+'" id="'+data.data.vod_play_list[h].from+'">'+neirong1+'</div>';
  }
  //console.log(str1);
  var vide1=data.data.vod_play_list[0].urls[0].name;
  var vide=data.data.vod_play_list[0].urls[0].url;  
  document.getElementById("demo1").innerHTML=vide1;
  document.getElementById("video").src="./jx/index.html?url="+vide ;
  document.getElementById("bolie2").innerHTML =bolie1;
  document.getElementById("neirong").innerHTML =neirong;
  document.getElementById("name").innerHTML =data.data.vod_name;
  document.getElementById("tu").src=data.data.vod_pic;
  document.getElementById("nian").innerHTML =data.data.vod_year;
  document.getElementById("diqu").innerHTML =data.data.vod_area;
  document.getElementById("daoyan").innerHTML =data.data.vod_director;
  document.getElementById("fenlei").innerText=data.data.vod_class;
  document.getElementById("yanyuan").innerText=data.data.vod_actor;
  document.getElementById("jiesao").innerText=data.data.vod_blurb;
  document.getElementById("jiesao1").innerText=data.data.vod_content;
	
});

})



//备用
function zy(){
 $.ajax({
 async: true,
 type: "GET",
 dataType: 'jsonp',
  cache: true,
 jsonp: 'callback',
 jsonpCallback: 'callbackfunction',
 url: appqt+url4+lianjie,
 data: "",
 timeout: 8000,
 contentType: "application/json;utf-8",
 success: function(data) {
 // console.log(data);
  var bolie=new Array();
  bolie=data.data.vod_play_from.split("$$$");
  var bolie1="";
  var neirong1='';
  var neirong='';
  var dianbo=data.data.vod_play_url;
  var dianbo1=dianbo.replace(/\r\n/g,"#") ;
  var dianbo2=dianbo1.replace(/\$/g,"#") ;
  var strs= new Array();
  strs=dianbo2.split("###");
 console.log(strs);
  var str1= new Array();
  for (h=0;h<strs.length ;h++){
    var strr=strs[h].replace(/\#\#/g,"#") ;
    str1[h]=strr.split("#");
    if(h==0){var neinei="am-tab-panel am-fade am-in am-active";var boliee='am-active';}else{var neinei="am-tab-panel am-fade tv-res"; var boliee='am';}
  bolie1 +='<li class="'+boliee+'" ><a href="#'+bolie[h]+'">'+bolie[h]+'</a></li>';
    for (i=0;i<str1[h].length ;i+=2)
    {
        neirong1 +='<li class="am-btn am-btn-sm btn-play-source"><a href="./jx/index.html?url='+str1[h][i+1]+'"  target="ajax" onclick="GetHref(this);return false;">'+str1[h][i]+'</a></li>';
    }
  neirong +='<div class="'+neinei+'" id="'+bolie[h]+'">'+neirong1+'</div>';
  var neirong1="";
  }
  //console.log(str1);
  var vide1=str1[0][0];
  var vide=str1[0][1];  
  document.getElementById("demo1").innerHTML=vide1;
  document.getElementById("video").src="./jx/index.html?url="+vide ;
  document.getElementById("bolie2").innerHTML =bolie1;
  document.getElementById("neirong").innerHTML =neirong;
  document.getElementById("name").innerHTML =data.data.vod_name;
  document.getElementById("tu").src=data.data.vod_pic;
  document.getElementById("nian").innerHTML =data.data.vod_year;
  document.getElementById("diqu").innerHTML =data.data.vod_area;
  document.getElementById("daoyan").innerHTML =data.data.vod_director;
  document.getElementById("fenlei").innerText=data.data.vod_class;
  document.getElementById("yanyuan").innerText=data.data.vod_actor;
  document.getElementById("jiesao").innerText=data.data.vod_blurb;
  document.getElementById("jiesao1").innerText=data.data.vod_content;
   }
   });
  }
