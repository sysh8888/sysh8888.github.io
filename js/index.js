function ying(ying){
  var url1=jiekou4+"http://front-gateway.mtime.com/ticket/schedule/showing/movies.api?locationId="+ying;
  $(function(){
   $.ajax({
   async: true,
   type: "GET",
   dataType: 'jsonp',
   jsonp: 'callback',
   jsonpCallback: 'callbackfunction',
   url: url1,
   data: "",
   timeout: 3000,
   contentType: "application/json;utf-8",
   success: function(data) {
  //console.log(data);
  var timu="";
  for (var i=0,l=data.data.ms.length;i<l;i++)

  { timu+='<div class="module-item"><div class="module-item-cover"><div class="module-item-pic"><a href="./so.html?wd='+data.data.ms[i].t+'&html=1.html" title="'+data.data.ms[i].t+'"><i class="icon-play"></i></a><img class="lazyloaded" src="'+data.data.ms[i].img+'" alt="'+data.data.ms[i].t+'"/><div class="loading"></div></div><div class="module-item-caption"><span>'+data.data.ms[i].year+'</span><span class="video-class">'+data.data.ms[i].movieType+'</span><span>'+data.data.ms[i].r+'</span></div><div class="module-item-content"><div class="module-item-style video-name"><a href="./so.html?wd='+data.data.ms[i].t+'&html=1.html" title="'+data.data.ms[i].t+'">'+data.data.ms[i].t+'</a></div><div class="module-item-style video-tag"><a href="#" target="_blank">'+data.data.ms[i].dN+'</a></div><div class="module-item-style video-text">'+data.data.ms[i].commonSpecial+'</div></div></div><div class="module-item-titlebox"><a href="./so.html?wd='+data.data.ms[i].t+'&html=1.html" title="'+data.data.ms[i].t+'">'+data.data.ms[i].t+'</a></div><div class="module-item-text">'+data.data.ms[i].actors+'</div></div>';}
  
  document.getElementById("lie").innerHTML =timu;
   }
   });
  })
    }
//https://bird.ioliu.cn/v1?url=http://front-gateway.mtime.com/ticket/schedule/showing/movies.api?locationId=290
//https://bird.ioliu.cn/v1?url=http://front-gateway.mtime.com/library/index/app/topList.api
