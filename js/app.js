//列表开始

$(function (){
  var url1=appzy[zyid]["url"]+"/types";
 
      $.getJSON(url1, function(data){
				//console.log(data);
              var lie="";
for ( a in data.data.list){
var fen=data.data.list[a].type_extend.class;
var strs= new Array();
strs=fen.split(",");
var lie1="";
for (b in strs){
	if (cat == strs[b] && catid == data.data.list[a].type_id){var cca='class="active"'}else{var cca=""};
	lie1+='<li '+cca+'><a href="?zy='+zyid+'&type='+data.data.list[a].type_id+'&class='+strs[b]+'&area=&year=&by=&limit=21&page=1">'+strs[b]+'</a></li>';
}
if(cat=="" && catid == data.data.list[a].type_id){var ccaaa='class="active"'; var caaaa='全部'}else{var ccaaa="";var caaaa=cat};
lie +=' <ul class="ty-screen__list clearfix"><li><span class="text-muted" class="active">'+data.data.list[a].type_name+':</span></li><li '+ccaaa+'><a href="?zy='+zyid+'&type='+data.data.list[a].type_id+'&class=&area=&year=&by=&limit=21&page=1">全部</a></li>'+lie1+'</ul>'

}


document.getElementById("liebiao").innerHTML=lie;
            }  )
    })
	
//内容开始	
function nei(zyid,catid,cat,pageno){
  var url1=appzy[zyid]["url"]+'?type='+catid+'&class='+cat+'&area=&year=&by=&limit=21&page='+pageno;
  //console.log(url1);
      $.getJSON(url1, function(data){
				//console.log(data);
              var timu="";

for(var i=0;i<data.data.list.length;i++){
timu+='<li><a class="movie-item" href="./play.html?q='+data.data.list[i].vod_id+'&id='+zyid+'&zy=qt&html=1.html" target="_blank"><div class="movie-cover"><img src="'+data.data.list[i].vod_pic+'" ><span class="movie-description"><i class="description-bg"></i><p>'+data.data.list[i].vod_remarks+'</p><p>DATE：'+data.data.list[i].vod_pubdate+'</p><p>&gt; 在线观看</p></span></div><div class="movie-title"><p class="movie-name">'+data.data.list[i].vod_name+'</p><p class="movie-tags">'+data.data.list[i].vod_tag+'</p></div></a></li>'}
document.getElementById("list").innerHTML=timu;
if(catid=="0"){var catid1="全部";}else{var catid1=data.data.list[0].type_name+'>>'+cat;}
document.getElementById("bolei").innerHTML =catid1;
            }  )
    }
