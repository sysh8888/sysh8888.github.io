
//内容开始
url4="http://yzapi.laohushipin.com/api/v1/vod_item_detail?vid=";
$(function(){
 $.ajax({
 async: true,
 type: "GET",
 dataType: 'jsonp',
 jsonp: 'callback',
 jsonpCallback: 'callbackfunction',
 url: jiekou+url4+lianjie,
 data: "",
 timeout: 3000,
 contentType: "application/json;utf-8",
 success: function(data) {
  console.log(data);
  var vide="";
  var bolie1="";
  var neirong1='';
  var neirong='';
     if(typeof(data.data.vod_play_list[0]) =="undefined"){vide=data.data.vod_name;bolie1='<li class="am-active" id="tttest"><a href="#imgo">暂无资源</a></li>';
     neirong='<div class="am-tab-panel am-fade am-in am-active" id="imgo"><li class="am-btn am-btn-sm btn-play-source"><a href="#"  target="ajax" onclick="GetHref(this);return false;">暂无资源</a>';
    }else{
      vide= data.data.vod_play_list[0].urls[0].url;
     document.getElementById("video").src="./v/bo.html?url="+vide ;
           vide1= data.data.vod_play_list[0].urls[0].name;
     document.getElementById("demo1").innerHTML=vide1 ;
  for (var h=0;h<data.data.vod_play_list.length;h++){
    if(h==0){var neinei="am-tab-panel am-fade am-in am-active";var boliee='am-active';}else{var neinei="am-tab-panel am-fade tv-res"; var boliee='am';}
  bolie1 +='<li class="'+boliee+'" ><a href="#'+data.data.vod_play_list[h].from+'">'+data.data.vod_play_list[h].note+'</a></li>';
  for (var i=0;i<data.data.vod_play_list[h].urls.length;i++){
    neirong1 +='<li class="am-btn am-btn-sm btn-play-source"><a href="./v/bo.html?url='+data.data.vod_play_list[h].urls[i].url+'"  target="ajax" onclick="GetHref(this);return false;">'+data.data.vod_play_list[h].urls[i].name+'</a>';
  }
  neirong +='<div class="'+neinei+'" id="'+data.data.vod_play_list[h].from+'">'+neirong1+'</div>';
  var neirong1="";
  }
   }
 // console.log(vide); 
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
})
