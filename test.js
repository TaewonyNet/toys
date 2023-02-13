// 개발자 도구 방지 해제
if (typeof element == "object"){
	try{
		element.__defineGetter__("id", function() {});
	}
	catch(exception) {
	}
	finally {
	}
}

// https://drive.google.com/drive/
var tit = document.querySelector('.a-Mg-V-T');
if (tit != null){
	var title=tit.innerText.substr(0, tit.innerText.lastIndexOf('.'));
	var tempElem = document.createElement('textarea');
	tempElem.value=title;  
	document.body.appendChild(tempElem);
	tempElem.select();
	document.execCommand("copy");
	document.body.removeChild(tempElem);
	var src = ['//drive.google.com/file/d/', 
			document.querySelector('.GZwC2b').getAttribute('jsdata').split(';')[1], 
			'/view'];
	var ifr = document.querySelector('#viframe');
	if (ifr == null) {
		setInterval(function() { 
			if (ifr.src != ifr.getAttribute('bf_src')) {
				var v_ele = ifr.contentDocument.querySelector('#drive-viewer-video-player-object-0');
				if (v_ele != null) {
					if (v_ele.getAttribute('src') != null) {
						var o = document.createElement('a');
						o.target = "_blank";
						o.href = v_ele.src;
						document.body.appendChild(o);
						o.click();
						ifr.setAttribute('bf_src', ifr.src);
					}
				}
			}
			}, 1000); 
		ifr = document.createElement('iframe');
		ifr.id = 'viframe';
		ifr.setAttribute('style', 'display:none');
		document.body.insertBefore(ifr, document.body.firstChild);
	}
	ifr.setAttribute('bf_src', ifr.src);
	ifr.src = src.join('/');
}

// 주소에 http가 포함될 경우 해당 페이지로 이동
if (location.href.indexOf('http', 1) > 0 && location.host.indexOf('youtube.googleapis.com') == -1){
	var loc = location.href.substring(location.href.indexOf('http', 1));
	if (loc.indexOf('&') > 0){
		loc = loc.substring(0, loc.indexOf('&'));
	}
	location.href = decodeURIComponent(loc);
}
// var ele = document.getElementsByTagName('video')[0];
// var x = (ele.offsetWidth - ele.offsetLeft) / 2 + ele.offsetLeft;
// var y = (ele.offsetHeight - ele.offsetTop) / 2 + ele.offsetTop;
// document.elementFromPoint(x, y).click();
function create_a_tag(src, title)
{
	var o = document.createElement('a');
	o.target = "_blank";
	o.href = src;
	o.download = title;
	document.body.appendChild(o);
	o.click();
}

function get_iframe()
{
	if (document.getElementsByTagName('iframe').length > 0)
	{
		try{
			var iframes = ['gdriveplayer', 'openload.co', 'goo.gl', 'vidstodo.me', 'vidtodo.com', 'streamango.com', 'verystream.com', '.ly', '.gd', '.by', 'rapidvideo', 'gounlimited', 'mixdrop', 'youtube.googleapis.com', 'dvd.', 'embed.'];
			var ifs = document.getElementsByTagName('iframe');
			for (var i=0; i<ifs.length; i++){
				for (var j=0; j<iframes.length; j++) {
					if (ifs[i].src.indexOf(iframes[j]) > -1) {
						location.href = ifs[i].src;
						return;
					}
				}
			}
		}
		catch(exception) {
		}
		finally {
		}
	}
}

get_iframe();
if ((document.getElementsByTagName('video').length > 0) && (document.getElementsByTagName('video')[0].src != "")) {
	var videonode = document.getElementsByTagName('video')[0];
    var parentnode = videonode.parentNode;
	parentnode.remove(videonode);
    document.body.append(videonode);
	create_a_tag(document.getElementsByTagName('video')[0].src, document.title);
}
else if (location.host.indexOf('podbbang.com') > -1) { // 팟빵
	var cn=$('[name=podbbang_login]')[0];
	var no=Number(cn.getAttribute('width'));
	var dn=$('p.download > a')[no];
	var ep=episode[Number(dn.getAttribute('onclick').split('\'')[1])];
	dn.setAttribute('href',ep.link_file);
	dn.setAttribute('download',ep.title);
	cn.setAttribute('width', no+1);
	dn.click();
}
else if (location.host == 'moviewang.net') { // 무비왕
    var o = $('div[id=movie_bt] a.OpenLoad');
    if (o.length > 0) {
        o[0].target = '_self';
        o[0].click();
    }
}
else if ((location.host.indexOf('openload') > -1) 
    || (location.host.indexOf('oload.download') > -1)) { // 오픈로드
    //location.href = 'http://' + location.host + '/stream/' + $('[id*=stream]')[0].innerText;
    var c = '/stream/' + $('div p[style][class]').text();
	create_a_tag(c, document.title);
}
else if (location.host.indexOf('gdriveplayer') > -1) { 
	create_a_tag($('video')[0].src, document.title);
}
else if (location.host.indexOf('tvnamu') > -1) { // 티비나무
	create_a_tag($('#link_gogovid')[0].value, document.title)
}
else if (location.host.indexOf('gogovid') > -1) { // 고고vid
    var c = flowplayer('#player').conf;
	create_a_tag(c.clip.sources[0].src, document.title);
}
else if (location.host.indexOf('podty') > -1) { // PODTY
	if ($('video').length > 0)
	{
		create_a_tag($('video')[0].src, document.title);
	}
	if ($('audio').length > 0)
	{
		create_a_tag($('audio')[0].src, document.title);
	}
}
else if ((location.host.indexOf('vidstodo') > -1)
		|| (location.host.indexOf('vidtodo') > -1)) { // vidtodo.com
	if ($('video').length > 0)
	{
		create_a_tag($('video')[0].src, document.title);
	}
}
else if (location.host.indexOf('streamango') > -1) { // streamango.com
	if ($('video').length > 0)
	{
		create_a_tag($('#mgvideo_html5_api')[0].src, document.title);
	}
}
else if ($('[data-quality*=mp4]').length > 0) { //
	create_a_tag($('[data-quality*=mp4]')[0].attributes['data-quality'].value, document.title);
}



/*
var notin = [
'19[0-9]{2}[)]|20[01][0-9][)]|2020[)]'
].map(function(f){ return new RegExp(f, 'i')});
function e_r(d, t) { return [...d.querySelectorAll(t)].reverse(); }
e_r(document, 'div, ul, table').forEach(function(ele) {
	var children = [];
	if (ele.nodeName == 'DIV') { children = e_r(ele, 'article'); }
	if (ele.nodeName == 'UL') { children = e_r(ele, 'li'); }
	if (ele.nodeName == 'TABLE') { children = e_r(ele, 'tr'); }
	if (children.length >= 10) {
		for (var i = children.length - 1; i >= 0 ; i--) {
			for (var j = 0; j < notin.length; j++) {
				if (notin[j].exec(children[i].outerHTML) != null) {
					//console.log(ele, children[i]);
					children[i].remove();
					break;
				}
			}
		}
	}
})

*/