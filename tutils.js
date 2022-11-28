function test_code() {
    tspt = document.createElement('script');
    tspt.setAttribute('src', '//rawgit.com/TaewonyNet/toys/master/tutils.js');
    tspt.setAttribute('onload', 'tutilsInit()');
    document.head.appendChild(tspt);
    function tutilsInit() {
        tutils.visitStyle;
        tutils.InRemoveElements = [
        ];
        tutils.StorageManager.View(document.body);
        tutils.StorageManager.Add(tutils.Storage.length + '<br>');
    }
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
        for (var z = 0; z < 10; z++) {
            eles_p = [];
            eles.forEach(function (ele) {
                if (ele.parentElement != null && eles_p.indexOf(ele.parentElement) == -1) {
                    eles_p.push(ele.parentElement);
                }
            });
            for (var i in eles_p) {
                var is_break = false;
                its = eles_p[i];
                sub_eles = its.querySelectorAll(tag_a);
                if (its.children.length > 1 && sub_eles.length > 1) {
                    if (its.children[0].tagName == its.children[1].tagName
                        && its.children[0].getAttribute('class') == its.children[1].getAttribute('class')) {
                        for (var j = 0; j < notin.length; j++) {
                            for (var k = its.children.length - 1; k >= 0; k--) {
                                if (notin[j].exec(its.children[k].outerHTML) != null) {
                                    console.log('remove', its.children[k]);
                                    its.children[k].remove();
                                    is_break = true;
                                }
                            }
                        }
                    }
                }
                if (is_break) {
                    for (var k = sub_eles.length - 1; k >= 0; k--) {
                        sub_eles[k].setAttribute('tutils', '1');
                    }
                    return;
                }
            }
            temp_eles = [];
            eles.forEach(function (ele) {
                if (ele.parentElement != null) {
                    temp_eles.push(ele.parentElement);
                }
            });
            eles = temp_eles;
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
        View: function (element) {
            if (tutils.listElement != null) {
                tutils.listElement.remove();
            }
            tutils.listElement = document.createElement('div');
            tutils.listElement.innerHTML = "<div style='display:inline-block;width:100%;height:100px;position:relative;overflow:auto;'><ul style='position:absolute;'></ul></div>";
            element.insertBefore(tutils.listElement, element.firstChild);
            this.Reload();
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
};
tutils.Storage;