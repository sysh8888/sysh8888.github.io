// JavaScript Document
var wubizg = {
	g:"王青戋五一",
	f:"土士二干十寸雨革",
	d:"大犬三羊古石厂镸丆",
	s:"木丁西",
	a:"工戈艹廾匚七廿",
	h:"目具上止卜虍",
	j:"日早刂虫",
	k:"口川",
	l:"田甲囗四车力皿罒",
	m:"山由贝冂几冎",
	t:"禾竹丿彳攵夂",
	r:"白手扌看头斤",
	e:"月彡乃用豕爫豸舟衣",
	w:"人八癶",
	q:"金钅勹鱼犭乂夕",
	y:"言文方广亠圭讠丶",
	u:"立辛冫六门疒丬",
	i:"水氵兴氺小",
	o:"火业米灬亦",
	p:"之冖宀礻衤辶廴",
	n:"已巳己乙尸心羽忄",
	b:"子孑耳了也凵卩阝",
	v:"女刀九臼彐巛",
	c:"又巴马厶",
	x:"弓匕幺纟",

};

var yijicode = {
			g:"一",
			f:"地",
			d:"在",
			s:"要",
			a:"工",
			h:"上",
			j:"是",
			k:"中",
			l:"国",
			m:"同",
			t:"和",
			r:"的",
			e:"有",
			w:"人",
			q:"我",
			y:"主",
			u:"产",
			i:"不",
			o:"为",
			p:"这",
			n:"民",
			b:"了",
			v:"发",
			c:"以",
			x:"经",
};

	var erjicode = {
			gg:"五",
			ff:"寺",
			dd:"大",
			ss:"林",
			aa:"式",
			hh:"止",
			jj:"昌",
			kk:"吕",
			ll:"男",
			mm:"册",
			tt:"笔",
			rr:"折",
			ee:"朋",
			ww:"从",
			qq:"多",
			yy:"方",
			uu:"立",
			ii:"水",
			oo:"炎",
			pp:"这",
			nn:"忆",
			bb:"子",
			vv:"妇",
			cc:"双",
			xx:"比",
		};

	var jmingcode = {
			"金":"qqqq",
			"人":"wwww",
			"月":"eeee",
			"白":"rrrr",
			"禾":"tttt",
			"言":"yyyy",
			"立":"uuuu",
			"水":"iiii",
			"火":"oooo",
			"之":"pppp",
			"工":"aaaa",
			"木":"ssss",
			"大":"dddd",
			"土":"ffff",
			"王":"gggg",
			"目":"hhhh",
			"日":"jjjj",
			"口":"kkkk",
			"田":"llll",
			"纟":"xxxx",
			"又":"cccc",
			"女":"vvvv",
			"子":"bbbb",
			"已":"nnnn",
			"山":"mmmm",
		};

	var jmengcode = {
			"儿":"qtn",
			"八":"wty",
			"用":"etnh",
			"手":"rtgh",
			"斤":"rtth",
			"竹":"ttgh",
			"文":"yygy",
			"方":"yygn",
			"六":"uygy",
			"门":"uyhn",
			"小":"ihty",
			"米":"oyty",
			"七":"agn",
			"戈":"agnt",
			"丁":"sgh",
			"西":"sghg",
			"犬":"dgty",
			"古":"dghg",
			"石":"dgtg",
			"厂":"dgt",
			"士":"fghg",
			"干":"fggh",
			"十":"fgh",
			"寸":"fghy",
			"五":"gghg",
			"早":"jhnh",
			"虫":"jhny",
			"川":"kthh",
			"甲":"lhnh",
			"四":"lhng",
			"力":"ltn",
			"匕":"xtn",
			"马":"cnng",
			"九":"vtn",
			"耳":"bghg",
			"羽":"nnyg",
			"由":"mhng",

		};

	var qmcode = {
			"用":"etnh",
			"手":"rtgh",
			"斤":"rtth",
			"竹":"ttgh",
			"文":"yygy",
			"方":"yygn",
			"六":"uygy",
			"门":"uyhn",
			"米":"oyty",
			"戈":"agnt",
			"西":"sghg",
			"犬":"dgty",
			"古":"dghg",
			"石":"dgtg",
			"士":"fghg",
			"干":"fggh",
			"寸":"fghy",
			"五":"gghg",
			"早":"jhnh",
			"虫":"jhny",
			"川":"kthh",
			"甲":"lhnh",
			"四":"lhng",
			"马":"cnng",
			"耳":"bghg",
			"羽":"nnyg",
			"由":"mhng",
		};

	var czcode = {
			"中华人民共和国":"kwwl",
			"江西":"iasg",
			"山东":"mmai",
			"河南":"isfm",
			"湖北":"idux",
			"湖南":"idfm",
			"广东":"yyai",
			"海南":"itfm",
			"四川":"lhkt",
			"贵州":"khyt",
			"云南":"fcfm",
			"河北":"isux",
			"山西":"mmsg",
			"辽宁":"bpps",
			"吉林":"fkss",
			"黑龙江":"ldia",
			"江苏":"iaal",
			"浙江":"iria",
			"安徽":"pvtm",
			"福建":"pyvf",
			"陕西":"bgsg",
			"甘肃":"afvi",
			"青海":"geit",
			"台湾":"ckiy",
			"广西":"yysg",
		};


//控制菜单鼠标靠近样式
	document.getElementById("yqzg").addEventListener("mouseover",stylein);
	document.getElementById("yqzg").addEventListener("mouseout",styleout);
	document.getElementById("czlx").addEventListener("mouseover",stylein);
	document.getElementById("czlx").addEventListener("mouseout",styleout);
	document.getElementById("qmlx").addEventListener("mouseover",stylein);
	document.getElementById("qmlx").addEventListener("mouseout",styleout);
	document.getElementById("jmlx").addEventListener("mouseover",stylein);
	document.getElementById("jmlx").addEventListener("mouseout",styleout);
	document.getElementById("zglx").addEventListener("mouseover",stylein);
	document.getElementById("zglx").addEventListener("mouseout",styleout);
	document.getElementById("yiji").addEventListener("mouseover",stylein);
	document.getElementById("yiji").addEventListener("mouseout",styleout);
	document.getElementById("erji").addEventListener("mouseover",stylein);
	document.getElementById("erji").addEventListener("mouseout",styleout);
	document.getElementById("jmhz").addEventListener("mouseover",stylein);
	document.getElementById("jmhz").addEventListener("mouseout",styleout);
	function stylein(){
		this.style.color = "#000000";
		this.style.border = "#000000 solid 2px";
	}
	function styleout(){
		this.style.color = "#FFFFFF";
		this.style.border = "#FBF7F7 solid 2px";
	}
//控制菜单鼠标靠近样式end