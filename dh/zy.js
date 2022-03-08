var tuiyingshi=[{"name":"影视搜索","url":"http://so.7080.wang/"},
	{"name":"九一剧","url":"https://www.91kju.com/"},
{"name":"蛋蛋影视","url":"https://www.dandanzan.top/"},
{"name":"电影先生","url":"http://www.hnpu.cn/"},
{"name":"剧好看","url":"https://www.juhaokan.cc/"},
{"name":"青豆影视","url":"https://www.pa755.com/"},
{"name":"八仟网","url":"http://vip.8kvod.com:888/"},
{"name":"橘子影视","url":"https://www.juztv.com/"},
{"name":"速速动漫","url":"http://susudm.com/"},
{"name":"看八经典","url":"https://www.k8ba.com/"},
{"name":"1080P","url":"https://1080p.tv/"},
{"name":"空闲影视","url":"http://gv2010.com/"},
{"name":"玛格影视","url":"https://loli.magedn.com"},
{"name":"奈落影视","url":"https://www.newfii.com/"},
{"name":"安特网","url":"https://auete.com/"}
];
var move='<li class="title"><svg class="icon" aria-hidden="true"> <use xlink:href="#icon-remen"></use></svg>影视推荐</li>';
for (a=0;a<tuiyingshi.length ;a++){
move +='<li class="col-3 col-sm-3 col-md-3 col-lg-1"><a rel="nofollow" href="../if/?mc=bidi&amp;dz='+tuiyingshi[a].url+'" target="_blank"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-yingshi"></use></svg><span>'+tuiyingshi[a].name+'</span></a></li>';
}
document.getElementById('moves').innerHTML = move ;


var qttuijian=[{"name":"桌面壁纸","url":"https://www.vvhan.com/wallpaper/"},
	{"name":"百度识图","url":"https://graph.baidu.com/pcpage/index?tpl_from=pc"},
{"name":"以图搜图","url":"https://yandex.com/images/"},
{"name":"视频解析","url":"https://video.isyour.love/"},
{"name":"工具箱","url":"https://www.qtool.net/"},
{"name":"音乐搜索","url":"http://www.xmsj.org/"},
{"name":"视频助手","url":"http://v.ranks.xin/"},
{"name":"视频解析","url":"https://pv.vlogdownloader.com/"},
{"name":"哨兵小说","url":"https://m.xdhtxt.com/"}
];
var qitatui='<li class="title"><svg class="icon" aria-hidden="true"> <use xlink:href="#icon-remen"></use></svg>其他推荐</li>';
for (a=0;a<qttuijian.length ;a++){
qitatui +='<li class="col-3 col-sm-3 col-md-3 col-lg-1"><a rel="nofollow" href="../if/?mc=bidi&amp;dz='+qttuijian[a].url+'" target="_blank"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-ai-tool"></use></svg><span>'+qttuijian[a].name+'</span></a></li>';
}
document.getElementById('qitatuij').innerHTML = qitatui ;