//if (location.host=="moviewang.net"){var o=$('div[id=movie_bt] a.OpenLoad'); if (o.length > 0) { o[0].target='_self'; o[0].click();}}else if (location.host.indexOf("2sumaker.com") > -1) {location.href= $('iframe')[$('iframe').length-1].src;}else if (location.host.indexOf("openload")>-1) {location.href = 'http://'+location.host+'/stream/'+$('[id*=stream]')[0].innerText;} else if (location.host.indexOf("tvnamu")>-1) {location.href=$('#link_gogovid')[0].value;}else if (location.host.indexOf("gogovid")>-1) {var o=$('<a/>');var c=flowplayer('#player').conf;o[0].href=c.clip.sources[0].src;o[0].download=c.title;$('body')[0].append(o[0]);o[0].click();};
function test(ss)
{
  alert(ss);
}
