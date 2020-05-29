
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

function create_a_tag(src, title)
{
	var o = document.createElement('a');
	o.target = "_blank";
	o.href = src;
	o.download = title;
	document.body.appendChild(o);
	o.click();
}

if (document.getElementsByTagName('iframe').length > 0)
{
	try{
		var iframes = ['gdriveplayer', 'openload.co', 'goo.gl', 'vidstodo.me', 'vidtodo.com', 'streamango.com', 'verystream.com', '.ly', '.gd', '.by', 'rapidvideo', 'gounlimited', 'mixdrop'];
		var ifs = document.getElementsByTagName('iframe');
		for (var i=0; i<ifs.length; i++){
			for (var j=0; j<iframes.length; j++) {
				if (ifs[i].src.indexOf(iframes[j]) > -1) {
					location.href = ifs[i].src;
				}
			}
		}
	}
	catch(exception) {
	}
	finally {
	}
}
if ((document.getElementsByTagName('video').length > 0) && (document.getElementsByTagName('video')[0].src != "")) {
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
