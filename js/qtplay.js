
//内容开始
url4=appzy[id]["url"]+"/detail?vod_id=";
$(function (){
var dataroot=url4+lianjie;
$.getJSON(dataroot, function(data){
	var bolie1="";

  var neirong='';
  for (h=0;h<data.data.vod_play_list.length ;h++){
	  	var neirong1='';
    if(h==0){var neinei="am-tab-panel am-fade am-in am-active";var boliee='am-active';}else{var neinei="am-tab-panel am-fade tv-res"; var boliee='am';}
  bolie1 +='<li class="'+boliee+'" ><a href="#'+data.data.vod_play_list[h].from+'">'+data.data.vod_play_list[h].from+'</a></li>';
    for (i=0;i<data.data.vod_play_list[h].urls.length ;i++)
    {
        neirong1 +='<li class="am-btn am-btn-sm btn-play-source"><a href="./jx/index.html?url='+data.data.vod_play_list[h].urls[i].url+'"  target="ajax" onclick="GetHref(this);return false;">'+data.data.vod_play_list[h].urls[i].name+'</a></li>';
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
