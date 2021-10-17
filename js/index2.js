function ying(ying){
  var url1=jiekou+"http://front-gateway.mtime.com/ticket/schedule/showing/movies.api?locationId="+ying;
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
  { timu+='<dl><dt><a target="_blank" href="./so.html?wd='+data.data.ms[i].t+'&html=1.html"><img src="'+data.data.ms[i].img+'" class="img-responsive" alt="'+data.data.ms[i].t+'"></a><span>年份:'+data.data.ms[i].year+'</span></dt><dd>'+data.data.ms[i].t+'</dd></dl>';}
    document.getElementById("lie").innerHTML =timu;
   }
   });
  })
    }
//https://bird.ioliu.cn/v1?url=http://front-gateway.mtime.com/ticket/schedule/showing/movies.api?locationId=290
//https://bird.ioliu.cn/v1?url=http://front-gateway.mtime.com/library/index/app/topList.api
