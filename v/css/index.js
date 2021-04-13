      var url = new URL(window.location.href);
      var wd = url.searchParams.get("q");
function index(index){
   $("#list").hide();
   $.ajax({
    async: true,
    type: "GET",
    dataType: 'jsonp',
    jsonp: 'callback',
    jsonpCallback: 'callbackfunction',
    url:'https://bird.ioliu.cn/v1?url=https://movie.douban.com/j/search_subjects?type='+index+'&sort=recommend&page_limit=20&page_start=0',
    data: "",
    timeout: 3000,
    contentType: "application/json;utf-8",
                beforeSend:function(XMLHttpRequest){ 
                  var winNode = $("#loading");  
                      winNode.fadeIn("slow");  
            }, 
                success: function(data) {
                   // console.log(data);
                 if(null != data && "" != data){
                  var Node = $("#loading");  
                      Node.hide(); 
                      var timu="";
                      for (var i=0;i<20;i++)
                      { timu+='<li><a href="so.html?q='+data.subjects[i].title+'" target="_blank"><img  src="'+data.subjects[i].cover+'"  width="110" height="176"><em><b>豆瓣评分:'+data.subjects[i].rate+'分</b></em><span>'+data.subjects[i].title+'</span></a></li>';}
                      $("#list").html(timu);
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

//苹果接口
function from(id){
 var url1="";
        if (id=="0"){url1="https://kongbuya.com/api.php/provide/vod/"}else if(id=="1"){url1="https://www.kuaibozy.com/api.php/provide/vod/"}else if(id=="2"){url1="http://api.appearoo.top/api.php/provide/vod/"}else if(id=="3"){url1="http://98hyk.cn/api.php/provide/vod/"}else if(id=="4"){url1="http://zy.zcocc.com/api.php/provide/vod/"}
        else if(id=="5"){url1="https://www.hktvyb.com/api.php/provide/vod/"}else if(id=="6"){url1="https://www.beiwoysw.com/api.php/provide/vod/"}
   $("#list").hide();
            $.ajax({
                type: "get",
                url: "https://bird.ioliu.cn/v1?url="+url1,
                data: "ac=detail&wd=" + wd,
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
                       { jieguo+='<li><a href="play.html?q='+data.list[i].vod_id+'&id='+id+'&zy=pg" target="_blank"><img  src="'+data.list[i].vod_pic+'" width="120" height="176"><em><b>'+data.list[i].vod_remarks+'</b></em><span>'+data.list[i].vod_name+'</span></a></li>';}
                                
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

//天空资源
    function fromall(id){
        //console.log(id);
        var url1="";
        if (id=="0"){url1="http://v8.tiankongzy.cc/inc/feifei3/"}else if(id=="1"){url1="https://www.subo988.com/inc/feifei3.4/"}
        else if(id=="2"){url1="http://cj.1886zy.co/inc/feifei3/"}else if(id=="3"){url1="https://www.mhapi123.com/inc/feifei3/"}
        else if(id=="4"){url1="http://cj.bajiecaiji.com/inc/feifei3bjm3u8/index.php"}else if(id=="5"){url1="https://www.123ku.com/inc/feifei/"}else if(id=="6"){url1="http://api.wokuzy.com/feifei34/json/wokuzy_s/"}else if(id=="7"){url1="https://cj.okzy.tv/inc/feifei3ckm3u8s/"};
       $("#list").hide();
             $.ajax({
                type: "get",
                url:"https://bird.ioliu.cn/v1?url="+url1,
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
//2345
function fromlll(id){
    var url1="";
           if (id=="0"){url1="https://tv.2345.com/moviecore/server/search/?ctl=think"}
      $("#list").hide();
               $.ajax({
                   type: "get",
                   url: "https://bird.ioliu.cn/v1?url="+url1,
                   data: "q=" + wd,
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
                         for (var i=0;i<data.length;i++)
                          { jieguo+='<li><a href="play2.html?q='+data[i].id+'&type='+data[i].ctype+'&id=0" target="_blank"><img  src="'+data[i].img+'"  width="120" height="176"><em><b>'+data[i].cntype+'</b></em><span>'+data[i].title+'</span></a></li>';}
                                   
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
//360
function from2(id){
    var url1="";
           if (id=="1"){url1="http://7080.wang/json/360/so.php"}
      $("#list").hide();
               $.ajax({
                   type: "get",
                   url: "https://bird.ioliu.cn/v1?url="+url1,
                   data: "q=" + wd,
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
                         for (var i=0;i<data.id.length;i++)
                          { jieguo+='<li><a href="play2.html?q='+data.id[i]+'&type='+data.type[i]+'&id='+id+'" target="_blank"><img  src="'+data.tu[i]+'"  width="120" height="176"><em><b>'+data.leixing[i]+'</b></em><span>'+data.name[i]+'</span></a></li>';}         
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
