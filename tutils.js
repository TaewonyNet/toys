function test_code() {
    tspt = document.createElement('script');
    tspt.setAttribute('src','//rawgit.com/TaewonyNet/toys/master/tutils.js');
    tspt.setAttribute('onload','tutilsInit()');
    document.head.appendChild(tspt);
    function tutilsInit(){
        tutils.visitStyle;
        tutils.InRemoveElements = [
        ];
        tutils.StorageManager.View(document.body);
        tutils.StorageManager.Add(tutils.Storage.length+'<br>');
    }
}

let tutils = {
    // 방문 사이트 강조
    is_visitStyle : false,
    get visitStyle() {
        this.is_visitStyle = !this.is_visitStyle;
        if (this.is_visitStyle) {
            this.visitStyleElement = document.createElement('style');
            this.visitStyleElement.setAttribute('type','text/css');
            this.visitStyleElement.innerHTML = 'a {border-left: solid 20px green;} a:visited {color:white;border-color: red;}'
            document.head.appendChild(this.visitStyleElement);
        } else {
            this.visitStyleElement.remove();
            this.visitStyleElement = null;
        }
    },
    // 보기싫은 게시물 삭제
    inRemoveRegexText : [],
    set InRemoveElements(value) {
        this.inRemoveRegexText = value;
        var notin = this.inRemoveRegexText.map(function (f) { return new RegExp(f, 'i') });
        tag_a = 'a:not([href^=javascript])';
        function e_r(d, t) { 
            if (d == null) return [];
            return [...d.querySelectorAll(t)].reverse(); 
        } 
        e_r(document, tag_a).forEach(function (ele) {
            for (var j = 0; j < notin.length; j++) {
                var tag = ele;
                for (var i = 0; i < 10; i++) {
                    //console.log(tag, e_r(tag.parentElement, tag_a));
                    if (e_r(tag.parentElement, tag_a).length > 1) {
                        if (notin[j].exec(ele.outerHTML) != null) {
                            console.log(tag, e_r(tag.parentElement, tag_a));
                            tag.remove();
                            break;
                        }
                    }
                    else {
                        tag = tag.parentElement;
                    }
                }
                if (tag.parentElement == null) { break; }
            }
        }) 
    },
    // 로컬스토리지 추가/삭제
    localStorageName : 'tutils',
    get Storage() {
        var storage = localStorage.getItem(this.localStorageName);
        if (!storage) { storage = [] } 
        return JSON.parse(storage);
    },
    set Storage(value) {
        localStorage.setItem(this.localStorageName, JSON.stringify(value));
    },
    StorageManager : {
        Add : function(items) {
            if (items.constructor == Array) {
                tutils.Storage = tutils.Storage.concat(...items);
            }
            else {
                tutils.Storage = tutils.Storage.concat(items);
            }
            this.Reload();
        },
        Remove : function(items) {
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
        RemoveIndex : function(items) {
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
        View : function (element) {
            if (tutils.listElement != null) {
                tutils.listElement.remove();
            }
            tutils.listElement = document.createElement('div');
            tutils.listElement.innerHTML = "<div style='display:inline-block;width:100%;height:100px;position:relative;overflow:auto;'><ul style='position:absolute;'></ul></div>";
            element.insertBefore(tutils.listElement, element.firstChild);
            this.Reload();
        },
        Reload : function() {
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
        }
    },
    listElement : null,
};
tutils.Storage;