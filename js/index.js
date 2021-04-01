var url1="https://bird.ioliu.cn/v1?url=https://api.jackeriss.com/api/v1/recommend/?subject=mover_%E7%83%AD%E9%97%A8&page_start=0&page_limit=21";
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
for (var i=0;i<21;i++)
{ timu+='<dl><dt><a target="_blank" href="/subject/'+data.subjects[i].id+'/?fname='+data.subjects[i].title+'"><img src="'+data.subjects[i].cover+'"></a><span>豆瓣评分:'+data.subjects[i].rate+'分</span></dt><dd>'+data.subjects[i].title+'</dd></dl>';}
document.getElementById("lie").innerHTML =timu;
 }
 });
})
