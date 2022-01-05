//苹果接口
function frompg(id){
  var url1=pingguoz[id];
  $("#list").hide();
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
                   { jieguo1+=' <li class="am-g am-list-item-desced am-list-item-thumbed am-list-item-thumb-left"><div class="am-u-sm-4 am-list-thumb"><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=pg" target="_blank" class="search-item-href"><img src="'+data.list[i].vod_pic+'"  alt="'+data.list[i].vod_name+'"></a></div><span class="video-score" title="国家">'+data.list[i].vod_remarks+'</span><div class="am-u-sm-8 am-list-main"><h3 class="am-list-item-hd"><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=pg" target="_blank" class="search-item-href">'+data.list[i].vod_name+'</a></h3><div class="am-list-item-text">'+data.list[i].vod_blurb+'</div><p class="am-list-item-text"><b>主演:</b><span>'+data.list[i].vod_actor+'</span></p><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=pg" target="_blank" class="am-btn am-btn-secondary am-btn-sm search-item-btn"><i class="am-icon-play"></i>在线播放  </a></div></li> ';}
         } 
                $("#list").html(jieguo1);
                 $("#list").slideDown();
              }else{
                alert("无结果,请切换其他资源！");
              }
            },
            error: function(a) {
                alert("失败，请检查关键字。");
            }
        })
        document.getElementById("bolei").innerHTML =pingguow[id]; 
    }
  
//其他资源接口1080tv
function zy2(id){
  var url2=appqt +qtzy[id]+ lianjie1;
  $(function (){
  $.ajax({
  async: true,
  type: "GET",
  dataType: 'jsonp',
    cache: true,
    async: true,
  jsonp: 'callback',
  jsonpCallback: 'callback2',
  url: url2,
  data: "",
  timeout: 8000,
  contentType: "application/json;utf-8",
  success: function(data)  {
      
    var jieguo2="";
    if(data.data.list.length==0){jieguo2='<P style="font-size:15px;"><SPAN><b style="color:#CC0033" >暂无资源，请查看其他资源！</b></SPAN></P>'} else{
  
          for (var i=0;i<data.data.list.length;i++)
           { jieguo2+=' <li class="am-g am-list-item-desced am-list-item-thumbed am-list-item-thumb-left"><div class="am-u-sm-4 am-list-thumb"><a href="./play.html?q='+data.data.list[i].vod_id+'&id='+id+'&zy=qt" target="_blank" class="search-item-href"><img src="'+data.data.list[i].vod_pic+'"  alt="'+data.data.list[i].vod_name+'"></a></div><span class="video-score" title="国家">'+data.data.list[i].vod_remarks+'</span><div class="am-u-sm-8 am-list-main"><h3 class="am-list-item-hd"><a href="./play.html?q='+data.data.list[i].vod_id+'&id='+id+'&zy=qt" target="_blank" class="search-item-href">'+data.data.list[i].vod_name+'</a></h3><div class="am-list-item-text">'+data.data.list[i].vod_blurb+'</div><p class="am-list-item-text"><b>主演:</b><span>'+data.data.list[i].vod_actor+'</span></p><a href="./play.html?q='+data.data.list[i].vod_id+'&id='+id+'&zy=qt" target="_blank" class="am-btn am-btn-secondary am-btn-sm search-item-btn"><i class="am-icon-play"></i>在线播放  </a></div></li> ';}

  }
   document.getElementById("list2").innerHTML =jieguo2;
  }
 })
})}
//其他资源接口HG
function zy3(id){
  var url3=appqt +qtzy[id]+ lianjie1;
  $(function (){
  $.ajax({
  async: true,
  type: "GET",
  dataType: 'jsonp',
    cache: true,
    async: true,
  jsonp: 'callback',
  jsonpCallback: 'callback3',
  url: url3,
  data: "",
  timeout: 8000,
  contentType: "application/json;utf-8",
  success: function(data)  {
      
    var jieguo3="";
    if(data.data.list.length==0){jieguo3='<P style="font-size:15px;"><SPAN><b style="color:#CC0033" >暂无资源，请查看其他资源！</b></SPAN></P>'} else{
  
          for (var i=0;i<data.data.list.length;i++)
           { jieguo3+=' <li class="am-g am-list-item-desced am-list-item-thumbed am-list-item-thumb-left"><div class="am-u-sm-4 am-list-thumb"><a href="./play.html?q='+data.data.list[i].vod_id+'&id='+id+'&zy=qt" target="_blank" class="search-item-href"><img src="'+data.data.list[i].vod_pic+'"  alt="'+data.data.list[i].vod_name+'"></a></div><span class="video-score" title="国家">'+data.data.list[i].vod_remarks+'</span><div class="am-u-sm-8 am-list-main"><h3 class="am-list-item-hd"><a href="./play.html?q='+data.data.list[i].vod_id+'&id='+id+'&zy=qt" target="_blank" class="search-item-href">'+data.data.list[i].vod_name+'</a></h3><div class="am-list-item-text">'+data.data.list[i].vod_blurb+'</div><p class="am-list-item-text"><b>主演:</b><span>'+data.data.list[i].vod_actor+'</span></p><a href="./play.html?q='+data.data.list[i].vod_id+'&id='+id+'&zy=qt" target="_blank" class="am-btn am-btn-secondary am-btn-sm search-item-btn"><i class="am-icon-play"></i>在线播放  </a></div></li> ';}

  }
   document.getElementById("list3").innerHTML =jieguo3;
  }
 })
})}
   //苹果接口番茄资源
  function zy4(id){
  var url4=fqzy[id];
        $.ajax({
            type: "get",
       dataType: 'jsonp',
          cache: true,
            url: appfq +url4 +"?ac=detail&wd=" + lianjie1,
            data: "",
            async: true,
          async: true,
            jsonp: 'callback',
  jsonpCallback: 'callback4',
          timeout: 8000,
    contentType: "application/json;utf-8",
             success: function(data) {
      
                  var jieguo4="";
            if(data.list.length==0){jieguo4='<P style="font-size:15px;"><SPAN><b style="color:#CC0033" >暂无资源，请查看其他资源！</b></SPAN></P>'} else{
          
                  for (var i=0;i<data.list.length;i++)
                   { jieguo4+=' <li class="am-g am-list-item-desced am-list-item-thumbed am-list-item-thumb-left"><div class="am-u-sm-4 am-list-thumb"><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=fq" target="_blank" class="search-item-href"><img src="'+data.list[i].vod_pic+'"  alt="'+data.list[i].vod_name+'"></a></div><span class="video-score" title="国家">'+data.list[i].vod_remarks+'</span><div class="am-u-sm-8 am-list-main"><h3 class="am-list-item-hd"><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=fq" target="_blank" class="search-item-href">'+data.list[i].vod_name+'</a></h3><div class="am-list-item-text">'+data.list[i].vod_blurb+'</div><p class="am-list-item-text"><b>主演:</b><span>'+data.list[i].vod_actor+'</span></p><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=fq" target="_blank" class="am-btn am-btn-secondary am-btn-sm search-item-btn"><i class="am-icon-play"></i>在线播放  </a></div></li> ';}
            }
                 document.getElementById("list4").innerHTML =jieguo4;
             
             
            }
        })
    }
