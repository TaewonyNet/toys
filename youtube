// Youtube download
// https://www.youtube.com/playlist?list=PLT1rvk7Trkw55UcI5ijZ_4QmsKqYSSXEq
imgs = document.querySelectorAll('img#img');
for (var i = 0 ; i < imgs.length; i++)
{
	if (imgs[i].src.indexOf('/vi/') > 0)
	{
		var code = imgs[i].src.split('/')[4];
		var pn = imgs[i].parentElement;
		for (var j = 0; j < 30; j++)
		{
			if (pn.nodeName != 'A') 
			{
				pn = pn.parentElement;
			}
			else
			{
				var iframe = document.createElement('iframe');
				iframe.src = 'https://9xbuddy.app/process?url=https://www.youtube.com/watch?v=' + code;
				pn.parentElement.parentElement.append(iframe);
				pn.parentElement.remove(pn);
				break;
			}
		}
	}
}
