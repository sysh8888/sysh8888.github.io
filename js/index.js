   //https://bird.ioliu.cn/v1?url=http://front-gateway.mtime.com/ticket/schedule/showing/movies.api?locationId=290
//https://bird.ioliu.cn/v1?url=http://front-gateway.mtime.com/library/index/app/topList.api
   //热门电影
  $(function (){
  var url1="https://api.web.360kan.com/v1/block?blockid=90&size=16";
        $.ajax({
            type: "get",
       dataType: 'jsonp',
            url: url1,
            data: "", 
			cache: true,
          async: true,
		  jsonp: 'callback',
  jsonpCallback: '_jpg7',
          timeout: 8000,
    contentType: "application/json;utf-8",
             success: function(data) {
				 //console.log(data);
              var timu1="";
for(var i=0,l=data.data.lists.length;i<l;i++){
timu1+='<li><a class="movie-item" href="./play.html?q='+data.data.lists[i].ent_id+'&id='+data.data.lists[i].cat+'&zy=360&html=1.html" target="_blank"><div class="movie-cover"><img src="'+data.data.lists[i].pic_lists[0].url+'" ><span class="movie-description"><i class="description-bg"></i><p>主演：'+data.data.lists[i].actor[0]+'</p><p>ID：'+data.data.lists[i].ent_id+'</p><p>&gt; 在线观看</p></span></div><div class="movie-title"><p class="movie-name">'+data.data.lists[i].title+'</p><p class="movie-tags">'+data.data.lists[i].comment+'</p></div></a></li>'}
document.getElementById("lie1").innerHTML=timu1;
            }  })
    })
   //热门电视
  $(function (){
  var url2="https://api.web.360kan.com/v1/block?blockid=131&size=14";
        $.ajax({
            type: "get",
       dataType: 'jsonp',
            url: url2,
            data: "", 
			cache: true,
          async: true,
		  jsonp: 'callback',
  jsonpCallback: '_jpg3',
          timeout: 8000,
    contentType: "application/json;utf-8",
             success: function(data) {
				// console.log(data);
              var timu2="";
for(var i=0,l=data.data.lists.length;i<l;i++){
timu2+='<li><a class="movie-item" href="./play.html?q='+data.data.lists[i].ent_id+'&id='+data.data.lists[i].cat+'&zy=360&html=1.html" target="_blank"><div class="movie-cover"><img src="'+data.data.lists[i].pic_lists[0].url+'" ><span class="movie-description"><i class="description-bg"></i><p>主演：'+data.data.lists[i].title+'</p><p>ID：'+data.data.lists[i].ent_id+'</p><p>&gt; 在线观看</p></span></div><div class="movie-title"><p class="movie-name">'+data.data.lists[i].title+'</p><p class="movie-tags">'+data.data.lists[i].comment+'</p></div></a></li>'}
document.getElementById("lie2").innerHTML=timu2;
            }  })
    })