// 뽐뿌 OK캐시백 링크 변경
// http://m.ppomppu.co.kr/new/bbs_view.php?id=coupon&no=65342&category=
// 즐겨찾기에 추가 또는 주소입력창에 직접 입력
// javascript:no='12345';es=document.createElement('script');es.setAttribute('src',location.protocol+ '//rawgit.com/TaewonyNet/toys/master/ok.js');document.body.appendChild(es);

if (typeof(no) == 'undefined') { no='12345'; }
var acs = document.querySelectorAll('a[target=_blank]');
if (acs){
	for (var i = acs.length - 1; i >= 0; i--) {
		if (acs[i].innerText.endsWith('seq=')) {
			acs[i].href = acs[i].innerText + no;
			acs[i].innerText = '링크 변경됨';
		}
		if (acs[i].href.endsWith('seq=')) {
			acs[i].href = acs[i].href.substr(acs[i].href.indexOf('http', 1)) + no;
			acs[i].innerText = '링크 변경됨';
		}
	}
}
