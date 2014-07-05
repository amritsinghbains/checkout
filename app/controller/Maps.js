/*
 * File: app/controller/Maps.js
 *
 * This file was generated by Sencha Architect version 3.0.0.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Sencha Touch 2.3.x library, under independent license.
 * License of Sencha Architect does not include license for Sencha Touch 2.3.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('CheckOut.controller.Maps', {
    extend: 'Ext.app.Controller',
    id: 'mapController',

    config: {
        models: [
            'Location'
        ],
        stores: [
            'Locations'
        ],
        marker: [],
        refs: {
            mapView: {
                selector: 'mainview #map',
                xtype: 'Ext.Map'
            },
            mainView: {
                selector: 'mainview',
                xtype: 'Ext.navigation.View'
            },
            mapPanel: {
                selector: 'mainview #mapPanel',
                xtype: 'Ext.Panel'
            },
            dropPinButton: {
                selector: 'mainview #dropPinButton',
                xtype: 'Ext.Button'
            },
            listPinsButton: {
                selector: 'mainview #listPinsButton',
                xtype: 'Ext.Button'
            },
            listPanelDisplay: '#listPanelDisplay',
            liveButton: '#liveButton'
        },

        control: {
            "mainview #dropPinButton": {
                tap: 'onDropPinTap'
            },
            "mainview #listPanel list": {
                disclose: 'onLocationTap'
            },
            "mainview #listPinsButton": {
                tap: 'onListPinsTap'
            },
            "mainview": {
                back: 'onBack'
            },
            listPanelDisplay: {
                itemtap: 'showDetails'
            },
            liveButton: {
                tap: 'liveButtonTap'
            }
        }
    },
    //myLocation: 0,
    setMyLocationOnMap: function(){
        var thiss = this;
        navigator.geolocation.getCurrentPosition(function(position){
            var map = thiss.getMapView().getMap();
            var point = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            thiss.myLocation = new google.maps.Marker({
                userId: localStorage.myUserId,
                title: localStorage.name,
                icon: 'http://graph.facebook.com/'+localStorage.myUserId+'/picture?type=square',
                position: point,
                map: map,
                animation: google.maps.Animation.DROP
            });
            Ext.getCmp('Initial').myLocation = thiss.myLocation;
        })
    },
    liveButtonTap: function(){
        //console.log('send my location');
        var thiss = this;
        navigator.geolocation.getCurrentPosition(function(position){
            
            var LatLng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            Ext.getCmp('Initial').myLocation.setPosition(LatLng);
            //console.log(this.myLocation)
            
            $.ajax({
                type: 'POST',
                url: HOST+'CheckOutServer/sendMyLocation.php',
                data: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    name: localStorage.name,
                    userId: localStorage.myUserId

                },
                success: function(result){
                    //console.log(result);
                }
            });
        })

        console.log('get latest updates');
        var that = this;
        $.post(HOST+"CheckOutServer/getChanges.php?userId="+localStorage.myUserId, function( dataJSON ) {
            var data = JSON.parse(dataJSON)
            for(var i=0; i<data.length; i++){
                var findRecord = Ext.getStore('Locations').findRecord('userId',data[i][4]);
                //console.log(findRecord);
                if(new Date(data[i][6]) > new Date(findRecord.data.time.toLocaleString())){
                    findRecord.set('latitude',data[i][0]);
                    findRecord.set('longitude',data[i][1]);
                    //findRecord.set('name',data[i][2]);
                    findRecord.set('place',data[i][3]);
                    //findRecord.set('userId',data[i][4]);
                    findRecord.set('message',data[i][5]);
                    findRecord.set('time',data[i][6]);

                    for(var j=0; j<that.marker.length; j++){
                        if(that.marker[j].userId === data[i][4]){

                            var LatLng = new google.maps.LatLng(data[i][0],data[i][1]);
                            that.marker[j].setPosition(LatLng);
                            //that.marker[j].setTitle(findRecord.data.name);
                            //break;
                        }
                    }



                }
            }
            Ext.getStore('Locations').sync();
        });
    },

    showDetails: function(e, target, index, record){
        if(!Ext.getCmp('detailProfile')){
            Ext.Viewport.add(Ext.create('CheckOut.view.detailProfile'));
        }
        Ext.getCmp('detailProfileList').setData();
        Ext.getCmp('detailProfile').show();
        if(record.data.name.length > 1){
            console.log('we have the name')
            Ext.getCmp('titlebarDetailProfile').setTitle(record.data.name);
            Ext.getCmp('detailProfileList').setData({
                place: record.data.place, 
                message: record.data.message,
                userId: record.data.userId,
                time: record.data.time
            });
            
        }
        else {
            FB.api('/'+record.data.userId, function(response) {

            console.log('we dont have the name')
                Ext.getCmp('titlebarDetailProfile').setTitle(response.name);
                Ext.getCmp('detailProfileList').setData({
                    place: record.data.place, 
                    message: record.data.message,
                    userId: record.data.userId,
                    time: record.data.time
                });
                
                var findRecord = Ext.getStore('Locations').findRecord('userId',record.data.userId)
                findRecord.set('name',response.name);
                Ext.getStore('Locations').sync();


/*
                //amz
                FB.api('/fql', {q:{"query1":"SELECT author_uid, message, checkin_id, coords, timestamp  FROM checkin WHERE author_uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) OR tagged_uids IN (SELECT uid2 FROM friend WHERE uid1 = me()) ORDER BY timestamp DESC"}}, 
            function(response) {*/

            });
        }
    },

    onDropPinTap: function(button, e, eOpts) {
        //refresh the friend's location
        this.setMyLocationOnMap();
        if(localStorage.dataReceived === 'true'){
            this.plotOnMap();
            setInterval(this.liveButtonTap,5000);
            return 1;
        }


        var that = this;
        FB.api('/fql', {q:{"query1":"SELECT author_uid, message, checkin_id, coords, timestamp  FROM checkin WHERE author_uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) OR tagged_uids IN (SELECT uid2 FROM friend WHERE uid1 = me()) ORDER BY timestamp DESC"}}, 
            function(response) {
                console.log(response);
                for(var i=0; i<response.data[0].fql_result_set.length; i++){
                    var findRecord = Ext.getStore('Locations').find('userId',response.data[0].fql_result_set[i].author_uid);
                    if(findRecord >= 0){
                        //console.log('old location');
                    
                    }else{
                        var utcSeconds = response.data[0].fql_result_set[i].timestamp;
                        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
                        d.setUTCSeconds(utcSeconds);
                        

                        Ext.getStore('Locations').add({
                            latitude: response.data[0].fql_result_set[i].coords.latitude,
                            longitude: response.data[0].fql_result_set[i].coords.longitude,
                            name: '',
                            place: response.data[0].fql_result_set[i].checkin_id,
                            userId: response.data[0].fql_result_set[i].author_uid,
                            message: response.data[0].fql_result_set[i].message,
                            time: d.toLocaleString()
                        });
                    }
                }
                console.log('got all data')
                Ext.getStore('Locations').sync();
                localStorage.dataReceived = true;
                that.plotOnMap();
                that.sendInfoToServer();
                //setInterval(that.liveButtonTap,5000);
            }
        )
/*
        FB.api('me/friends?fields=checkins.limit(1)&format=json&offset=0', function(response){
            
            console.log('Good to see you');
            store = Ext.getStore('Locations');
            for(var i=0; i<response.data.length; i++){
                var name = '';
                var place = '';
                var latitude = 0;
                var longitude = 0;
                var userId = response.data[i].id;
                var message = '';
                var time = 0;

                if(response.data[i].checkins){
                    if(response.data[i].checkins.data){
                        

                        if(response.data[i].checkins.data[0].place){
                            place = response.data[i].checkins.data[0].place.name;
                            latitude = response.data[i].checkins.data[0].place.location.latitude
                            longitude = response.data[i].checkins.data[0].place.location.longitude
                        }
                        if(response.data[i].checkins.data[0].message){
                            message = response.data[i].checkins.data[0].message;
                        }
                        if(response.data[i].checkins.data[0].created_time){
                            time = response.data[i].checkins.data[0].created_time;
                            console.log('time:')
                            console.log(time)
                        }

                    }
                }
                        
                if(userId === null || latitude === 0 || longitude === 0){
                    continue;
                }   
                store.add({                            // Add lat/long to store
                    latitude: latitude,
                    longitude: longitude,
                    name: name,
                    place: place,
                    userId: userId,
                    message: message,
                    time: time
                });
            }
            
            console.log('got all data')
            Ext.getStore('Locations').sync();
            localStorage.dataReceived = true;
            that.plotOnMap();
            that.sendInfoToServer();
            setInterval(this.liveButtonTap,5000);
            
        })*/
        
    },
    sendInfoToServer: function(){
        var db = openDatabase('Sencha', '1.0', 'raxa offline storage for patient, encounter, etc', 4 *1024 * 1024);
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM Location', [], function (tx, results) {
                if(results){
                    var objectToSend = new Array();
                    var locationToSend = new Array();
                    for(var i=0; i<results.rows.length; i++){
                        objectToSend[i] = results.rows.item(i).userId;
                        locationToSend[i] = {
                            latitude: results.rows.item(i).latitude,
                            longitude: results.rows.item(i).longitude,
                            name: results.rows.item(i).name,
                            place: results.rows.item(i).place,
                            userId: results.rows.item(i).userId,
                            message: results.rows.item(i).message,
                            time: results.rows.item(i).time
                        };
                    }
                    $.post(HOST+"CheckOutServer/initial.php?userId="+localStorage.myUserId+"&friendId="+objectToSend, function( data ) {
                        console.log(data);
                    });
                    var locationToSendJSON = JSON.stringify(locationToSend);
                    $.ajax({
                        type: "POST",
                        url: HOST+'CheckOutServer/initial2.php',
                        data: {
                            data: locationToSendJSON
                        },
                        success: function(data2){
                            console.log('khi')
                            console.log(data2);
                        }
                    });
                }
            });
        });
    },

    plotOnMap: function(){
        console.log('plotting on map');
        var that = this;

        var db = openDatabase('Sencha', '1.0', 'raxa offline storage for patient, encounter, etc', 4 *1024 * 1024);
        db.transaction(function (tx) {
            tx.executeSql('SELECT * FROM Location', [], function (tx, results) {
                if(results){
                    console.log(results.rows);
                    var marker = new Array();
                    for(var i=0; i<results.rows.length; i++){
                        var data = results.rows.item(i);
                        
                        if(data.userId === null || data.latitude === 0 || data.longitude === 0){
                            continue;
                        }

                        var point = new google.maps.LatLng(data.latitude,data.longitude);
                        var map = that.getMapView().getMap();
                        var infowindow = new google.maps.InfoWindow();
                        marker[i] = new google.maps.Marker({
                            userId: data.userId,
                            title: data.name + ' @ ' + data.message,
                            description: data.place,
                            icon: 'http://graph.facebook.com/'+data.userId+'/picture?type=square',
                            position: point,
                            map: map,
                            animation: google.maps.Animation.DROP
                        });

                        google.maps.event.addListener(marker[i], 'click', function() {
                            var infoInside = '';
                            if(this.title.length){
                                infoInside += '<strong>' + this.title + '<strong><br/>';
                            }
                            if(this.description.length){
                                infoInside += this.description;
                            }
                            
                            infowindow.setContent('<strong>' + this.title + '</strong><br/>' + this.description);
                            infowindow.open(map, this);
                        });
                    }
                    that.marker = marker;
                }
            });
            Ext.getCmp('loadingButton').hide();
                
        });

    },



    getMergedUrl: function(frame, pic){
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        canvas.width = 100;
        canvas.height = 100;

        frame2 = new Image();
        frame2.src = frame;
        frame2.height = 100;
        frame2.width = 100;
        frame2.onload = function(){
            pic2 = new Image();
            pic2.src = pic;
            pic2.height = 100;
            pic2.width = 100; 
            pic2.onload=function(){
                console.log(pic2)
                console.log(frame2)
                // Copy the image contents to the canvas
                
                ctx.drawImage(frame2, 0, 0);
                /*ctx.drawImage(pic2, 4, 4);
*/
                //ctx.drawImage(pic2,0,0,pic2.width,pic2.height,0,0,400,300);
                console.log(canvas)
                console.log(ctx)
                // Get the data-URL formatted image
                var dataURL = canvas.toDataURL();

                return dataURL;



                
            }
        }
        




        
    },







    onLocationTap: function(list, record, target, index, e, eOpts) {
/*        var latitude = record.get('latitude'),    // Build the location
            longitude = record.get('longitude'),
            location = new google.maps.LatLng(latitude, longitude),
            map = this.getMapView();              // Find the map

        map.setMapOptions({   // Move to the center
            center: location
        });
*/
        //this.getDropPinButton().show();   // Show buttons
        /*this.getListPinsButton().show();

        this.getMainView().pop(); */  // Remove the pin list panel
    },

    onListPinsTap: function(button, e, eOpts) {

        if(!Ext.getCmp('listPanel')){
            Ext.Viewport.add(Ext.create('CheckOut.view.ListPanel'));
        }
        Ext.getCmp('listPanel').show();





        /*this.getMainView().push({   // Show the list panel view
            xtype: 'listpanel',
            title: 'Latest Updates'
        });*/
        //this.getDropPinButton().hide();   // Hide the buttons
        //this.getListPinsButton().hide();
    },

    onBack: function(navigationview, eOpts) {
        //this.getDropPinButton().show();   // Show the buttons
        //this.getListPinsButton().show();
    }

});