function test_code() {
    tspt = document.createElement('script');
    tspt.setAttribute('src', '//rawgit.com/TaewonyNet/toys/master/tutils.js');
    tspt.setAttribute('onload', 'tutilsInit()');
    document.head.appendChild(tspt);
    function tutilsInit() {
        tutils.visitStyle;
        tutils.InRemoveElements = [
        ];
        tutils.StorageManager.ViewButton = true;
        tutils.StorageManager.View(document.body);
        tutils.StorageManager.Add(tutils.Storage.length + '<br>');
        tutils.copyClipReplace = function (x) {return x.split('<br>').join('\n') }
    }
}
if ($ == null) {
    var d = document,
        g = d.createElement('script'),
        s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript';
    g.async = true;
    g.src = 'https://code.jquery.com/jquery-3.5.0.js';
    s.parentNode.insertBefore(g, s);
}
let tutils = {
    // 방문 사이트 강조
    is_visitStyle: false,
    get visitStyle() {
        this.is_visitStyle = !this.is_visitStyle;
        if (this.is_visitStyle) {
            this.visitStyleElement = document.createElement('style');
            this.visitStyleElement.setAttribute('type', 'text/css');
            this.visitStyleElement.innerHTML = 'a {border-left: solid 20px green;} a:visited {color:white;border-color: red;}'
            document.head.appendChild(this.visitStyleElement);
        } else {
            this.visitStyleElement.remove();
            this.visitStyleElement = null;
        }
    },
    // 보기싫은 게시물 삭제
    inRemoveRegexText: [],
    set InRemoveElements(value) {
        this.inRemoveRegexText = value;
        var notin = this.inRemoveRegexText.map(function (f) { return new RegExp(f, 'i') });
        tag_a = 'a:not([href^=javascript]):not([tutils])';
        eles = document.querySelectorAll(tag_a);
        ats = [];
        depthnames = [];
        depths = {};
        for (i in eles) {
            var x = eles[i];
            var xdomlist = tutils.getDomPath(x);
            xdomlist.pop();
            for (var i = 0; i < 5; i++) {
                if (xdomlist.length > 1) {
                    var xdp = xdomlist.join(' > ');
                    if (depths[xdp] == null) { depths[xdp] = []; depthnames.push(xdp); }
                    depths[xdp].push([x, x.getAttribute('href')]);
                    xdomlist.pop();
                }
                else {
                    break;
                }
            }
        }
        depthnames.sort(function (a, b) { return b.length - a.length; });
        for (n in depthnames) {
            var dp = depthnames[n];
            if (depths[dp].length > 1) {
                var is_break = false;
                var its = $(dp)[0];
                // console.log(n, dp, its);
                if (its == null) { continue; }
                var sub_eles = its.querySelectorAll(tag_a);
                // console.log(dp, its.children.length, sub_eles.length);
                if (its.children.length > 2 && sub_eles.length > 2) {
                    for (var j = 0; j < notin.length; j++) {
                        for (var k = its.children.length - 1; k >= 0; k--) {
                            if (notin[j].exec(its.children[k].outerHTML) != null) {
                                console.log('remove', its.children[k].outerHTML);
                                its.children[k].remove();
                                is_break = true;
                            }
                        }
                    }
                }
                if (is_break) {
                    for (var k = sub_eles.length - 1; k >= 0; k--) {
                        sub_eles[k].setAttribute('tutils', '1');
                    }
                }
            }
        }
    },
    // 로컬스토리지 추가/삭제
    localStorageName: 'tutils',
    get Storage() {
        var storage = localStorage.getItem(this.localStorageName);
        if (!storage) { storage = '[]' }
        return JSON.parse(storage);
    },
    set Storage(value) {
        localStorage.setItem(this.localStorageName, JSON.stringify(value));
    },
    StorageManager: {
        Add: function (items) {
            if (items.constructor == Array) {
                tutils.Storage = tutils.Storage.concat(...items);
            }
            else {
                tutils.Storage = tutils.Storage.concat(items);
            }
            this.Reload();
        },
        Remove: function (items) {
            var rm = [];
            if (items.constructor == Array) {
                rm = rm.concat(...items);
            }
            else {
                rm = [items];
            }
            var storage = tutils.Storage;
            for (var i in rm) {
                var idx = storage.indexOf(rm[i]);
                if (idx > -1) {
                    storage.splice(idx, 1);
                }
            }
            tutils.Storage = storage;
            this.Reload();
        },
        RemoveIndex: function (items) {
            var rm = [];
            if (items.constructor == Array) {
                rm = rm.concat(...items);
            }
            else {
                rm = [items];
            }
            rm = rm.sort().reverse();
            var storage = tutils.Storage;
            for (var i in rm) {
                var idx = rm[i];
                if (idx < storage.length) {
                    storage.splice(idx, 1);
                }
            }
            tutils.Storage = storage;
            this.Reload();
        },
        ViewButton: false,
        View: function (element) {
            if (tutils.listElement != null) {
                tutils.listElement.remove();
            }
            tutils.listElement = document.createElement('div');
            tutils.listElement.innerHTML = "<div style='display:inline-block;width:100%;height:100px;position:relative;overflow:auto;'><ul style='position:absolute;'></ul></div>";
            element.insertBefore(tutils.listElement, element.firstChild);
            if (tutils.StorageManager.ViewButton) {
                var allbutton = document.createElement('div');
                allbutton.innerHTML = '<a onclick="tutils.copyClip(tutils.Storage.join(\'\\n\'))" style="color:red">전체복사</a> <a onclick="tutils.StorageManager.Remove(tutils.Storage);" style="color:red">전체삭제</a>';
                element.insertBefore(allbutton, tutils.listElement);
                this.Reload();
            }
        },
        Reload: function () {
            if (tutils.listElement == null) {
                return;
            }
            var el = tutils.listElement.firstChild.firstChild;
            el.innerHTML = '';
            var storage = tutils.Storage;
            for (var i in storage) {
                var ei = document.createElement('li');
                ei.innerHTML = storage[i] + " <a onclick='tutils.StorageManager.RemoveIndex(" + i + ");tutils.StorageManager.Reload()'>X</a>";
                el.appendChild(ei);
            }
        },
    },
    listElement: null,
    copyClip: function (text) {
        var tempElem = document.createElement('textarea');
        tempElem.value = tutils.copyClipReplace(text);
        document.body.appendChild(tempElem);
        tempElem.select();
        document.execCommand("copy");
        document.body.removeChild(tempElem);
    },
    copyClipReplace: function (text) {
        return text;
    },
    getDomPath: function (el) {
        // console.log('getDomPath');
        var stack = [];
        while (el.parentNode != null) {
            // console.log(el.nodeName);
            var sibCount = 0;
            var sibIndex = 0;
            for (var i = 0; i < el.parentNode.childNodes.length; i++) {
                var sib = el.parentNode.childNodes[i];
                if (sib.nodeName == el.nodeName) {
                    if (sib === el) {
                        sibIndex = sibCount;
                    }
                    sibCount++;
                }
            }
            if (el.hasAttribute('id') && el.id != '') {
                stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
            } else if (sibCount > 1) {
                stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
            } else {
                stack.unshift(el.nodeName.toLowerCase());
            }
            el = el.parentNode;
        }
        return stack.slice(1); // removes the html element
    },

};
tutils.Storage;

