if (document.getElementsByTagName('iframe').length > 0)
{
	try{
		var iframes = ['gdriveplayer.us', 'openload.co', 'goo.gl'];
		for (var i=0; i<iframes.length; i++) {
			var ifopenload = $('iframe[src*="'+iframes[i]+'"]');
			if ((ifopenload != null)
				&& (ifopenload.length > 0))
			{
				location.href = ifopenload[0].src;
			}
		}
	}
	catch(exception) {
	}
	finally {
	}
}
if (location.host.indexOf('podbbang.com') > -1) { // 팟빵
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
else if (location.host.indexOf('openload') > -1) { // 오픈로드
    //location.href = 'http://' + location.host + '/stream/' + $('[id*=stream]')[0].innerText;
    location.href = 'http://' + location.host + '/stream/' + $('div p[style][class]').text();
}
else if (location.host.indexOf('gdriveplayer.us') > -1) { 
	location.href = $('video')[0].src;
}
else if (location.host.indexOf('tvnamu') > -1) { // 티비나무
    location.href = $('#link_gogovid')[0].value;
}
else if (location.host.indexOf('gogovid') > -1) { // 고고vid
    var o = $('<a/>');
    var c = flowplayer('#player').conf;
    o[0].href = c.clip.sources[0].src;
    o[0].download = c.title;
    $('body')[0].append(o[0]);
    o[0].click();
}
else if (location.host.indexOf('podty') > -1) { // PODTY
	if ($('video').length > 0)
	{
		var o = $('<a/>');
		o[0].href = $('video')[0].src;
		o[0].download = document.title;
		$('body')[0].append(o[0]);
		o[0].click();
	}
}
