Ext.define('CheckOut.view.detailProfile', {
    extend: 'Ext.Panel',
    id: 'detailProfile',

    config: {
        height: '100%',
        width: '100%',
        centered: 'true',
        items: [
            {
                xtype: 'titlebar',
                id: 'titlebarDetailProfile',   
                title: 'name',
                items: [{
                    xtype: 'button',
                    'text': '< Friends',
                    handler: function(){
                        Ext.getCmp('detailProfile').hide();
                    }
                }]
            },
            {
                centered: 'true',
                flex: 1,
                id: 'detailProfileList',
                tpl:  new Ext.XTemplate('<br/><br/>',
                    '<img src="http://graph.facebook.com/{userId}/picture?type=large" height="100%" width="100%" /> <br/><br/>',
                    '<b>{message}</b>',
                    '<div align="right" style="color:#999999;font-size:0.7em;font-style:italic;">Last Seen: {[this.getFormatedDate(values)]}</div>'
                ,{
                    getFormatedDate: function(values){
                        var system_date = new Date(Date.parse(values.time));
                        
                        var user_date = new Date();
                        var diff = Math.floor((user_date - system_date) / 1000);
                        if (diff <= 1) {return "just now";}
                        if (diff < 20) {return diff + " seconds ago";}
                        if (diff < 40) {return "half a minute ago";}
                        if (diff < 60) {return "less than a minute ago";}
                        if (diff <= 90) {return "one minute ago";}
                        if (diff <= 3540) {return Math.round(diff / 60) + " minutes ago";}
                        if (diff <= 5400) {return "1 hour ago";}
                        if (diff <= 86400) {return Math.round(diff / 3600) + " hours ago";}
                        if (diff <= 129600) {return "1 day ago";}
                        if (diff < 604800) {return Math.round(diff / 86400) + " days ago";}
                        if (diff <= 777600) {return "1 week ago";}
                        if (diff <= 3110400) {return "1 month ago";}
                        if (diff <= 9331200) {return "3 months ago";}
                        if (diff <= 18662400) {return "6 months ago";}
                        if (diff <= 311040000) {return "1 year ago";}
                        return "on " + system_date;
                    }
                })
                
            }
        ]
    }

});