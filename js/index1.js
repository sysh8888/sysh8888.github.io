 function ying(ying){
var url1="https://bird.ioliu.cn/v1?url=https://movie.douban.com/j/search_subjects?type="+ying+"&sort=recommend&page_limit=20&page_start=0";
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
console.log(data);
var timu="";
for (var i=0;i<20;i++)
{ timu+='<dl><dt><a target="_blank" href="./v/so.html?q='+data.subjects[i].title+'"><img src="'+data.subjects[i].cover+'"></a><span>豆瓣评分:'+data.subjects[i].rate+'分</span></dt><dd>'+data.subjects[i].title+'</dd></dl>';}
document.getElementById("lie").innerHTML =timu;
 }
 });
})
  }
