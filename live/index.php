<?php
include "../inc/aik.config.php";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"> 
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN / DENY "> 
<meta name="referrer" content="never"/>
<title>北邮IPTV测试频道-7080网</title>
<meta name="keywords" content="北邮IPTV,<?php echo $aik['keywords'];?>"/>
<meta name="description" content="北邮IPTV,<?php echo $aik['description'];?>"/>
<link href="http://7080.wang/css/style_index.css" type="text/css" rel="stylesheet" />
<link href="http://7080.wang/css/iptv.css" rel="stylesheet" type="text/css">
<script src="http://7080.wang/css/jquery.min.js"></script>
<style type="text/css">
  body{
  background-color:#00acdd;
  }
  </style>
</head>
<body >
<header style="opacity: 0.7;">
    <div class="container" style="padding-right: 0px;padding-left: 0px;">
        <div class="main">
            <h1 class="logo">
                <a href="index.html">
                    <img src="../img/ico.png">
                    <span>7080网</span>

                </a>
            </h1>
        </div>
	</div>
	<div class="not_operational"></div>
</header>
<!-- IPTV开始 -->  
 <center><p><font size="20%" color="#ffffff">北邮IPTV测试频道</font></p><span>测试使用~</span></center>
 <div class="icon">
<div class="container izb">
<nav class="zb-nav">
<a href="javascript:;" class="cur">
<font size="3%" color="#ffffff"> 北邮IPTV </font>
</a>
<a href="javascript:;" class="">
<font size="3%" color="#ffffff"> 频道添加中.. </font>
</a>
<a href="javascript:;" class="">
<font size="3%" color="#ffffff"> 频道添加中.. </font>
</a>
</nav>
<div class="zb-con">
<ul class="zb-list hide show">
 <?php $live="http://ivi.bupt.edu.cn/";
 $live1=file_get_contents($live);preg_match_all('#<p>(.*?)</p>#', $live1,$pin);
 preg_match_all('#channel=(.*?)"#', $live1,$lian);
 foreach($pin[1] as $i=>$name){ echo '<li><a href="javascript:;" data-url="http://ivi.bupt.edu.cn/player.html?channel='.$lian[1][$i].'">
<b><img src="http://7080.wang/css/iptv.png"></b>
<span>'.$pin[1][$i].'</span></a></li>' ;}
 ?>
<ul class="zb-list hide">
<p style="text-align: center;padding: 25px">
敬请期待
</p>
</ul>
<ul class="zb-list hide">
<p style="text-align: center;padding: 25px">
敬请期待
</p>
</ul>
</div>
</div>
</div>
<div class="zb-plays">
<div class="mask"></div>
<div class="zb-play"><a href="javascript:;" class="close"><i class="iconfont">&#xe622;</i></a>
<div class="ipcon" id="ipcon">
<iframe id="frmLive" frameborder="0" scrolling="no" width="100%" src=""></iframe>
</div>
</div>
</div>
<script>
    
    var $a = $('.zb-nav a'),
        $ul = $('.zb-con ul'),
        $alast = $('.sitenav a:last-child'),
        $abtn = $('.zb-list li a');
    $alast.addClass('cur');
    $a.click(function() {
        var $this = $(this);
        var $t = $this.index();
        $a.removeClass();
        $this.addClass('cur');
        $ul.addClass('hide').removeClass('show');
        $ul.eq($t).addClass('show');
    });
    $abtn.on('click', function(e) {
        var vurl = $(this).attr("data-url");
        var w = document.documentElement ? document.documentElement.clientWidth : document.body.clientWidth;
        $('#frmLive').attr('src', vurl);
        if (w < 767) {
            $('#frmLive').height = 260;
        } else {
            $('#frmLive').height = 600;
        };
        $('html').addClass('show');
        e.stopPropagation();
    });
    $('.zb-plays .mask,.zb-plays .close').on('click', function() {
        $('html').removeClass('show');
        document.getElementById('frmLive').src = '';
    })
    $('.izbs').addClass('cur');
    $('.iapp').removeClass('cur');
    </script>
<!-- 尾巴 -->
<footer class="footer text-center bg-white">
    <div class="container">
		<span style="float:left">Copyright &copy; http://7080.wang 所有资源均为网络抓取,<a href="http://www.miibeian.gov.cn/" target="_blank">浙ICP备2020039513号</a></span>
<span style="float:right"><a href="http://7080.wang" target="_blank">本站不存储内容</a></span>
    </div>
</footer>
<?php echo $aik['tongji'];?>
</body>
</html>