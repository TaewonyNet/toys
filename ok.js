var acs = document.querySelectorAll('a[target=_blank]');
if (acs){
	for (var i = acs.length - 1; i >= 0; i--) {
		if (acs[i].innerText.endsWith('seq=')) {
			acs[i].href = acs[i].innerText + no;
			acs[i].innerText = '링크 변경됨';
		}
	}
}