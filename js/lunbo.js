
  $(function (){
  var url1="https://api.web.360kan.com/v1/block?blockid=522";
        $.ajax({
            type: "get",
       dataType: 'jsonp',
            url: url1,
            data: "", 
			cache: true,
          async: true,
		  jsonp: 'callback',
  jsonpCallback: '__jp2',
          timeout: 8000,
    contentType: "application/json;utf-8",
             success: function(data) {
				// console.log(data);
              var luntu="";var luntu1="";
for(var i=0,l=7;i<l;i++){
luntu+='<div class="swiper-slide"><a href="./play.html?q='+data.data.lists[i].ent_id+'&id='+data.data.lists[i].cat+'&zy=360&html=1.html" target="_blank"><img src="'+data.data.lists[i].pic_lists[0].url+'"></a></div>';
//luntu1+='<li jumpImg="'+i+'"></li>';
}
document.getElementById("lunbotu").innerHTML=luntu;
//document.getElementById("lunbotu1").innerHTML=luntu;
console.log(luntu);
            }  })
    })

 $(function() {
    $('#mySwiper').swiper({
      //分页器
      pagination:'#mySwiper .swiper-pagination'
      ,paginationClickable:true
      //自动播放
      ,autoplay:2000
      ,autoplayDisableOnInteraction:false
      //循环
      , loop:true
      //左右按钮
      ,prevButton:'.swiper-button-prev'
      ,nextButton:'.swiper-button-next'
    });
  });
