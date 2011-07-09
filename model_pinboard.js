Models.register({
    name: 'Pinboard',
    ICON: 'http://pinboard.in/favicon.ico',
    LINK: 'http://pinboard.in/',

    getCurrentUser : function(defaultUser) {
        if (defaultUser) {
            return succeed(defaultUser);
        } else if(this.currentUser) {
            return succeed(this.currentUser);
        } else {
            var self = this;
            return request("http://pinboard.in/").addCallback(function(res) {
                var doc = createHTML(res.responseText);
                var match = res.responseText.match(/\<div id="title"\>Pinboard - \((.+)\)<\/div>/);
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
        return request('https://pinboard.in/add', {
            queryString: {
                title: ps.item,
                url: ps.itemUrl
            }
        }).addCallback(function(res) {
            var doc = createHTML(res.responseText);
            var elmForm = doc.getElementsByTagName('form')[0];
            if (!elmForm)
                throw new Error(chrome.i18n.getMessage('error_notLoggedin', self.name));
            
            return request('https://pinboard.in/add', {
                sendContent: update(formContents(elmForm), {
                    title: ps.item,
                    description: ps.description,
                    tags: ps.tags? ps.tags.join(' ') : '',
                    share: ps.private? 'no' : 'yes'
                })
            });
        });
    }
});

Models.copyTo(this);
