try{
	// 오픈로드 페이지 확인
	var ifopenload = $('iframe[src*=openload]');
	if ((ifopenload != null)
	    && (ifopenload.length > 0))
	{
		location.href = $('iframe[src*=openload]')[0].src;
	}
}
catch(exception) {
}
finally {
}
if (location.host.indexOf("podbbang.com") > -1) { // 팟빵
	var cn=$('[name=podbbang_login]')[0];
	var no=Number(cn.getAttribute('width'));
	var dn=$('p.download > a')[no];
	var ep=episode[Number(dn.getAttribute('onclick').split('\'')[1])];
	dn.setAttribute('href',ep.link_file);
	dn.setAttribute('download',ep.title);
	cn.setAttribute('width', no+1);
	dn.click();
}
else if (location.host == "moviewang.net") { // 무비왕
    var o = $('div[id=movie_bt] a.OpenLoad');
    if (o.length > 0) {
        o[0].target = '_self';
        o[0].click();
    }
}
else if (location.host.indexOf("openload") > -1) { // 오픈로드
    location.href = 'http://' + location.host + '/stream/' + $('[id*=stream]')[0].innerText;
}
else if (location.host.indexOf("tvnamu") > -1) { // 티비나무
    location.href = $('#link_gogovid')[0].value;
}
else if (location.host.indexOf("gogovid") > -1) { // 고고vid
    var o = $('<a/>');
    var c = flowplayer('#player').conf;
    o[0].href = c.clip.sources[0].src;
    o[0].download = c.title;
    $('body')[0].append(o[0]);
    o[0].click();
}
