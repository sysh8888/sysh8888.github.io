 function ying(ying){
var url1="https://bird.ioliu.cn/v1?url=https://api.jackeriss.com/api/v1/recommend/?subject="+ying+"&page_start=0&page_limit=20";
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
for (var i=0;i<20;i++)
{ timu+='<dl><dt><a target="_blank" href="./v/so.html?q='+data.subjects[i].title+'&html=1.html"><img src="'+data.subjects[i].cover+'" class="img-responsive" alt="'+data.subjects[i].title+'"></a><span>豆瓣评分:'+data.subjects[i].rating.value+'分</span></dt><dd>'+data.subjects[i].title+'</dd></dl>';}
  document.getElementById("lie").innerHTML =timu;
 }
 });
})
  }
