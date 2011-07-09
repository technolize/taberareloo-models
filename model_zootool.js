Models.register({
    name: 'Zootool',
    ICON: 'http://zootool.com/favicon.ico',
    LINK: 'http://zootool.com/',

    getCurrentUser : function(defaultUser) {
        if (defaultUser) {
            return succeed(defaultUser);
        } else if(this.currentUser) {
            return succeed(this.currentUser);
        } else {
            var self = this;
            return request("http://zootool.com/").addCallback(function(res) {
                var doc = createHTML(res.responseText);
                var profile_url = doc.getElementsByClassName("username")[0].href;
                var match = profile_url.match(/\/(.+)$/);
                if (match) {
                    var user = match[1];
                    self.currentUser = user;
                    alert(user);
                    return user;
                } else {
                    throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
                }
            });
        }
    },

    check : function(ps) {
        return /photo|quote|link|conversation|video/.test(ps.type) && !ps.file;
    },

    post : function(ps) {
        var self = this;
        return request('http://zootool.com/post/', {
            queryString: {
                title: ps.item,
                url: ps.itemUrl
            }
        }).addCallback(function(res) {
            var doc = createHTML(res.responseText);
            var elmForm = doc.getElementById('dropdown-tab-add');
            if (!elmForm)
                throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
            
            return request('http://zootool.com/post/actions/', {
                sendContent: update(formContents(elmForm), {
                    title: ps.item,
                    description: ps.description,
                    tags: ps.tags? ps.tags.join(',') : '',
                    share: ps.private? 'n' : 'y'
                })
            });
        });
    }
});

Models.copyTo(this);
