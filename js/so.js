//苹果接口
function frompg(id){
var url1=pingguoz[id];
$("#list").hide();
      $.ajax({
          type: "get",
          url: jiekou +url1,
          data: "ac=detail&wd=" + lianjie1,
          async: true,
          beforeSend:function(XMLHttpRequest){ 
            var winNode = $("#loading");  
                winNode.fadeIn("slow");  
      }, 
           success: function(data) {
            if(null != data && "" != data){
            var Node = $("#loading");  
                Node.hide(); 
                var jieguo="";
                for (var i=0;i<data.list.length;i++)
                 { jieguo+=' <li class="am-g am-list-item-desced am-list-item-thumbed am-list-item-thumb-left"><div class="am-u-sm-4 am-list-thumb"><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=pg" target="_blank" class="search-item-href"><img src="'+data.list[i].vod_pic+'"  alt="'+data.list[i].vod_name+'"></a></div><span class="video-score" title="国家">'+data.list[i].vod_remarks+'</span><div class="am-u-sm-8 am-list-main"><h3 class="am-list-item-hd"><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=pg" target="_blank" class="search-item-href">'+data.list[i].vod_name+'</a></h3><div class="am-list-item-text">'+data.list[i].vod_blurb+'</div><p class="am-list-item-text"><b>主演:</b><span>'+data.list[i].vod_actor+'</span></p><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=pg" target="_blank" class="am-btn am-btn-secondary am-btn-sm search-item-btn"><i class="am-icon-play"></i>在线播放  </a></div></li> ';}
                          
              $("#list").html(jieguo);
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

//飞飞资源
function fromff(id){
  //console.log(id);
  var url1=feifeiz[id];
 $("#list").hide();
       $.ajax({
          type: "get",
          url:jiekou +url1,
          data: "wd=" + wd,
          async: true,
          beforeSend:function(XMLHttpRequest){ 
            var winNode = $("#loading");  
                winNode.fadeIn("slow");  
      }, 
          success: function(data) {
            if(null != data && "" != data){
            var Node = $("#loading");  
                Node.hide(); 
                var jieguo="";
                for (var i=0;i<data.data.length;i++)
                 { jieguo+='<li><a href="play.html?q='+data.data[i].vod_id+'&id='+id+'&zy=ff" target="_blank"><img  src="'+data.data[i].vod_pic+'"  width="120" height="176"><em><b>'+data.data[i].vod_continu+'</b></em><span>'+data.data[i].vod_name+'</span></a></li>';}
                          
              $("#list").html(jieguo);
               $("#list").slideDown();
               }else{
              alert("无结果,请切换其他资源！");
            }
          },
          error: function(a) {
              alert("失败，请检查关键字。");
          }
      })
}
//其他资源接口
function qitaziyuan(id){
  var url4=jiekou +"http://yzapi.laohushipin.com/api/v1/get_search?word="+ lianjie1;
  $(function (){
  $.ajax({
  async: true,
  type: "GET",
  dataType: 'jsonp',
  jsonp: 'callback',
  jsonpCallback: 'callbackfunction',
  url: url4,
  data: "",
  timeout: 3000,
  contentType: "application/json;utf-8",
  success: function(data)  {
  //console.log(data);
  var timu1="";
  
  for (var i=0,l=data.data.length;i<l;i++){

    
 timu1 +='<li class="am-g am-list-item-desced am-list-item-thumbed am-list-item-thumb-left"><div class="am-u-sm-4 am-list-thumb"><a href="./play.html?q='+data.data[i].vid+'&id='+id+'&zy=qt" target="_blank" class="search-item-href"><img src="'+data.data[i].vod_pic+'"  alt="'+data.data[i].vod_name+'" ></a></div><span class="video-score" title="国家">'+data.data[i].vod_remarks+'</span><div class="am-u-sm-8 am-list-main"><h3 class="am-list-item-hd"><a href="./play.html?q='+data.data[i].vid+'&id='+id+'&zy=qt" target="_blank" class="search-item-href">'+data.data[i].vod_name+'</a></h3><div class="am-list-item-text">'+data.data[i].vod_blurb+'</div><p class="am-list-item-text"><b>主演:</b><span>'+data.data[i].vod_actor+'</span></p><a href="./play.html?q='+data.data[i].vid+'&id='+id+'&zy=qt" target="_blank" class="am-btn am-btn-secondary am-btn-sm search-item-btn"><i class="am-icon-play"></i>在线播放  </a></div></li>';}
 document.getElementById("qtlist").innerHTML =timu1;
    }
  });
 })
 }
 //苹果接口番茄资源
function zhanwai(id){
var url5="http://api.fqzy.cc/api.php/provide/vod/at/json/";
      $.ajax({
          type: "get",
          url: jiekou +url5,
          data: "ac=detail&wd=" + lianjie1,
          async: true,
           success: function(data) {
    
                var jieguo1="";
                for (var i=0;i<data.list.length;i++)
                 { jieguo1+=' <li class="am-g am-list-item-desced am-list-item-thumbed am-list-item-thumb-left"><div class="am-u-sm-4 am-list-thumb"><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=fq" target="_blank" class="search-item-href"><img src="'+data.list[i].vod_pic+'"  alt="'+data.list[i].vod_name+'"></a></div><span class="video-score" title="国家">'+data.list[i].vod_remarks+'</span><div class="am-u-sm-8 am-list-main"><h3 class="am-list-item-hd"><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=fq" target="_blank" class="search-item-href">'+data.list[i].vod_name+'</a></h3><div class="am-list-item-text">'+data.list[i].vod_blurb+'</div><p class="am-list-item-text"><b>主演:</b><span>'+data.list[i].vod_actor+'</span></p><a href="./play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=fq" target="_blank" class="am-btn am-btn-secondary am-btn-sm search-item-btn"><i class="am-icon-play"></i>在线播放  </a></div></li> ';}
                document.getElementById("zwlist").innerHTML =jieguo1;           
           
           
          }
      })
  }
