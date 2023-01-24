tspt = document.createElement('script');
tspt.setAttribute('src', '//rawgit.com/TaewonyNet/toys/master/tutils.js');
tspt.setAttribute('onload', 'tutilsInit()');
document.head.appendChild(tspt);
function tutilsInit() {
	console.log('test');
	var storage = tutils.Storage;
}
var isrun = false;
setInterval(function() {
var ply = document.querySelector('[data-cy="playback-controls"]');
if (ply != null && ply.style.display != 'none') { ply.style.display = 'none'; }
var reco = document.querySelector('[class*="PlayerReco_"]');
if (reco != null && reco.style.display != 'none') { reco.style.display = 'none'; }
if (!isrun) {
	isrun = true;
	var href = document.location.href;
	if (tutils.Storage[tutils.Storage.length - 1] != href) {
	    tutils.StorageManager.Add(href);
	}
	if (tutils.Storage[tutils.Storage.length - 1].indexOf('/mylist') > -1
	&& tutils.Storage[tutils.Storage.length - 2].indexOf('page_my_list') > -1){
	    var titles = document.querySelectorAll('img[src*=titles]');
	    var tid = tutils.Storage[tutils.Storage.length - 2].split('/')[4]
	    var link = 'https://www.coupangplay.com/play/{tid}/movie?sourceType=page_my_list';
	    var gid = titles.length - 1;
	    for (var i=0; i < titles.length; i++){
	        if (titles[i].src.indexOf(tid) > -1){
	            console.log(titles[i].href);
	            gid = i - 1;
	            break;
	        }
	    }
	    document.location.href = link.replace('{tid}', titles[gid].src.split('/')[4]); 
	}
	isrun = false;
}
}, 1000);