var url1="https://bird.ioliu.cn/v1?url=http://ivi.bupt.edu.cn/";
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
  // console.log(data);
var timu =/<p>+[\s-\+-a-zA-Z0-9-\u4e00-\u9fa5]+<\/p>/g;//题目获取
var timu1 = data.match(timu);
//console.log(timu1);
//document.getElementById("video").innerHTML=timu1[0] ;
var lian =/hls\/+[a-zA-Z0-9]+.m3u8/g;
var lian1 = data.match(lian);
//console.log(lian1);
var iptv='';
for (i=0;i<timu1.length ;i++)
{
   iptv +='<li class="am-btn am-btn-sm btn-play-source"><a href="/ali.html?url=http://ivi.bupt.edu.cn/'+lian1[i]+'"  target="ajax" onclick="GetHref(this);return false;">'+timu1[i]+'</a></li>';
}
document.getElementById("iptv").innerHTML=iptv ;
//console.log(iptv);
}
});
})
