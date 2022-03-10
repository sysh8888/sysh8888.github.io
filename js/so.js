//苹果接口
function frompg(id){
  var url1=pingguozy[id]["url"];
  $("#list2").hide();
        $.ajax({
            type: "get",
            url: jiekou +url1 +"?ac=detail&wd=" + lianjie1,
      error: function (XMLHttpRequest, textStatus, errorThrown) {
                   alert(textStatus);
                   alert(errorThrown);
                   this; // 调用本次AJAX请求时传递的options参数
               },
          data: "",
               dataType: "jsonp",
          cache: true,
          async: true,
            jsonp: 'callback',
  jsonpCallback: 'callback1',
    contentType: "application/json;utf-8",
             success: function(data) {
              if(null != data && "" != data){
              var Node = $("#loading");  
                  Node.hide(); 
                  var jieguo1="";
          if(data.list.length==0){jieguo1='<P style="font-size:15px;"><SPAN><b style="color:#CC0033" >暂无资源，请查看其他资源！</b></SPAN></P>'} else{
                  for (var i=0;i<data.list.length;i++)
                   { jieguo1+='<li><a class="movie-item" href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=pg" target="_blank"><div class="movie-cover"><img src="'+data.list[i].vod_pic+'" ><span class="movie-description"><i class="description-bg"></i><p>状态：'+data.list[i].vod_remarks+'</p><p>年代：'+data.list[i].vod_year+'</p><p>&gt; 在线观看</p></span></div><div class="movie-title"><p class="movie-name">'+data.list[i].vod_name+'</p><p class="movie-tags">'+data.list[i].vod_actor+'</p></div></a></li>';}
         } 
                $("#list2").html(jieguo1);
                 $("#list2").slideDown();
              }else{
                alert("无结果,请切换其他资源！");
              }
            },
            error: function(a) {
                alert("失败，请检查关键字。");
            }
        })
        document.getElementById("bolei2").innerHTML =pingguozy[id]["name"]; 
    }
  
//其他资源接口APP
function zy2(id){
		$("#list1").hide();
  var url3=appzy[id]["url"]+"?page=1&wd="+ lianjie1;
var dataroot=url3;
$.getJSON(dataroot, function(data){
       var Node = $("#loading");  
                  Node.hide(); 
    var jieguo2="";
    if(data.data.list.length==0){jieguo2='<P style="font-size:15px;"><SPAN><b style="color:#CC0033" >暂无资源，请查看其他资源！</b></SPAN></P>'} else{
  
          for (var i=0;i<data.data.list.length;i++)
			       { jieguo2+='<li><a class="movie-item" href="./play.html?q='+data.data.list[i].vod_id+'&id='+id+'&zy=qt" target="_blank"><div class="movie-cover"><img src="'+data.data.list[i].vod_pic+'" ><span class="movie-description"><i class="description-bg"></i><p>状态：'+data.data.list[i].vod_remarks+'</p><p>年代：'+data.data.list[i].vod_year+'</p><p>&gt; 在线观看</p></span></div><div class="movie-title"><p class="movie-name">'+data.data.list[i].vod_name+'</p><p class="movie-tags" title="演员">'+data.data.list[i].vod_actor+'</p></div></a></li>';} 

  }
    $("#list1").html(jieguo2);
                 $("#list1").slideDown();

});
document.getElementById("bolei1").innerHTML =appzy[id]["name"]; 
}

   //站外资源
  function zy4(id){
	  $("#list4").hide();
  var url4=zwzy[id]["url"];
  var play4=zwzy[id]["play"];
        $.ajax({
            type: "get",
       dataType: 'jsonp',
            url: jiekou +url4 +"/index.php/ajax/suggest?mid=1&wd=" + lianjie1,
            data: "", 
			cache: true,
          async: true,
		  jsonp: 'callback',
  jsonpCallback: 'callback4',
          timeout: 3000,
    contentType: "application/json;utf-8",
             success: function(data) {
       var Node = $("#loading");  
                  Node.hide();
                  var jieguo4="";
            if(data.list.length==0){jieguo4='<P style="font-size:15px;"><SPAN><b style="color:#CC0033" >暂无资源，请查看其他资源！</b></SPAN></P>'} else{
          
                  for (var t=0;t<data.list.length;t++)
                   { var play5=play4.replace('{id}', data.list[t].id);
			  
			   jieguo4+='<li><a class="movie-item" href="./if/1.html?dz='+url4+play5+'" target="_blank"><div class="movie-cover"><img src="'+data.list[t].pic+'" ><span class="movie-description"><i class="description-bg"></i><p>en：'+data.list[t].en+'</p><p>点击详情</p><p>&gt; 在线观看</p></span></div><div class="movie-title"><p class="movie-name">'+data.list[t].name+'</p><p class="movie-tags">点击详情</p></div></a></li>';}
            }
                    $("#list4").html(jieguo4);
                 $("#list4").slideDown();
             
             
            }
        })
		document.getElementById("bolei4").innerHTML =zwzy[id]["name"]; 
    }