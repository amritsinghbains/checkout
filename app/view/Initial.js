Ext.define('CheckOut.view.Initial', {
    extend: 'Ext.Panel',
    id: 'Initial',
    myLocation: 0,
    config: {
        height: '100%',
        width: '100%',
        centered: 'true',
        items: [
            {
                id: 'loadingText',
                centered: 'true',
                flex: 1,
                html: 'Please wait... <br/> <br/> <br/> <img src="resources/images/initial.gif" height=100 width=100 />'
                
            }
        ]
    }

});