
//内容开始
var jx="./jx/index.html?url=";
var url1="https://api.web.360kan.com/v1/detail?cat="+id;
$(function(){
$.ajax({
          type: "get",
 url:url1+"&id="+lianjie,//%3Fac=detail%26ids=
 data: "",
    error: function (XMLHttpRequest, textStatus, errorThrown) {
                 alert(textStatus);
                 alert(errorThrown);
                 this; // 调用本次AJAX请求时传递的options参数
             },
             dataType: "jsonp",
	cache: true,
			 contentType: "application/json;utf-8",
           success: function(data) {
			  // console.log(data);
			   var bolie1="";
			   var neirong="";
			   var neirong1="";
			   if(id=="1"){
			   var bolie=data.data.playlinksdetail;
			   bolie1 +='<li class="am-active" ><a href="#dy">播放地址</a></li>'; 
			   for (var key in bolie){
				   neirong1 +='<li class="am-btn am-btn-sm btn-play-source"><button type="button" class="am-btn am-btn-sm am-round" title="'+bolie[key].site+'" value="'+jx+bolie[key].default_url+'"  onclick="GetHref(this);">'+bolie[key].site+'</button></li>';
				   var vide=bolie[key].default_url;var vide1=bolie[key].site;
			   }
			    neirong ='<div class="am-tab-panel am-fade am-in am-active" id="dy">'+neirong1+'</div>';
			   }
			   else if (id=="2"||id=="4"){var bolie=data.data.allepidetail;
			    for (var key in bolie){
				  var neinei="am-tab-panel am-fade am-in am-active";var boliee='am-active';
bolie1 +='<li class="'+boliee+'" ><a href="#'+key+'">'+key+'</a></li>';  		   
	for (i=0;i<bolie[key].length ;i++){
		neirong1 +='<li class="am-btn am-btn-sm btn-play-source"><button type="button" class="am-btn am-btn-sm am-round" title="'+bolie[key][i].playlink_num+'" value="'+jx+bolie[key][i].url+'"  onclick="GetHref(this);">'+bolie[key][i].playlink_num+'</button></li>';
		var vide=bolie[key][i].url;var vide1=bolie[key][i].playlink_num;
	}
	neirong +='<div class="'+neinei+'" id="'+key+'">'+neirong1+'</div>';
	var neirong1="";
	break;
}
			   
			   }
			   else if (id=="3"){var bolie=data.data.defaultepisode;
			   bolie1 +='<li class="am-active" ><a href="#zy">播放地址</a></li>'; 
			   	for (i=0;i<bolie.length ;i++){
		neirong1 +='<li class="am-btn am-btn-sm btn-play-source"><button type="button" class="am-btn am-btn-sm am-round" title="'+bolie[i].period+'" value="'+jx+bolie[i].url+'"  onclick="GetHref(this);">'+bolie[i].period+'</button></li>';
	}neirong ='<div class="am-tab-panel am-fade am-in am-active" id="zy">'+neirong1+'</div>';
	var vide=bolie[0].url;var vide1=bolie[0].period;
			   }
			  

//console.log(vide);
document.getElementById("demo1").innerHTML =vide1;
document.getElementById("video").src="./jx/index.html?url="+vide ;
document.getElementById("neirong").innerHTML =neirong;
document.getElementById("bolie2").innerHTML =bolie1;
document.getElementById("name").innerHTML =data.data.title;
document.getElementById("tu").src=data.data.cdncover;
document.getElementById("nian").innerHTML =data.data.pubdate;
document.getElementById("diqu").innerHTML =data.data.area[0];
document.getElementById("daoyan").innerHTML =data.data.director[0];
document.getElementById("fenlei").innerText=data.data.moviecategory[0];
document.getElementById("yanyuan").innerText=data.data.actor[0];
document.getElementById("jiesao").innerText=data.data.comment;
document.getElementById("jiesao1").innerText=data.data.description;
 }
 });
})