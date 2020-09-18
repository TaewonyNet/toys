var bjq = false;
var wjq = 0;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
if (!$.ajax){
	let jqscript = document.createElement("script");
	jqscript.setAttribute('src', '//ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js');
	document.body.appendChild(jqscript);
}
while(!$.ajax && wjq < 5){
	await sleep(1000);
	wjq++;
}