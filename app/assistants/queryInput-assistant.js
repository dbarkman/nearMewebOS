function QueryInputAssistant() {
}

QueryInputAssistant.prototype.setup = function() {

    //allow the app to rotate
    if (this.controller.stageController.setWindowOrientation) {
        this.controller.stageController.setWindowOrientation("free");
    }

    //setup the app menu help screen
    this.nearMeAttr = {
        omitDefaultItems: true
    };
    this.nearMeModel = {
        visible: true,
        items: [
            Mojo.Menu.editItem,
            Mojo.Menu.prefsItem,
            {label: "Help...", command: 'nearMeHelp'}
        ]
    };
    this.controller.setupWidget(Mojo.Menu.appMenu, this.nearMeAttr, this.nearMeModel);

    //setup the sort listSelect widget
    this.controller.setupWidget("domain",
        this.attributes = {
            label: 'Place or Event',
            modelProperty: "domain",
            choices: [
            {label: "Place", value: "Place"},
            {label: "Event", value: "Event"}
        ]},
        this.domainModel = {
            "domain": "Place",
            disabled: false
        }
    );

    this.domainChanged = this.domainChanged.bindAsEventListener(this);
    Mojo.Event.listen(this.controller.get('domain'), Mojo.Event.propertyChange, this.domainChanged);

    //setup the what textfield widget
    this.controller.setupWidget("what",
        this.attributes = {
            hintText: ("what are you looking for"),
            modelProperty: "what",
            autoFocus: true,
            textCase: Mojo.Widget.steModeTitleCase
        },
        this.whatModel = {
            "what": "",
            disabled: false
        }
    );

    //setup the sort listSelect widget
    this.controller.setupWidget("sort",
        this.attributes = {
            label: 'Sort',
            modelProperty: "sort",
            choices: [
            {label: "Distance", value: "Distance"},
            {label: "Rating", value: "AverageRating"},
            {label: "Name", value: "Title"}
        ]},
        this.sortModel = {
            "sort": "Distance",
            disabled: false
        }
    );

    //setup the search by gps button widget
    this.controller.setupWidget("searchGPS",
        this.attributes = {
            type: Mojo.Widget.activityButton
        },
        this.model = {
            label : "Search by GPS",
            disabled: false
        }
    );

    //search by gps button listener
    this.handleSearchGPSBinder = this.handleSearchGPSPress.bind(this);
    Mojo.Event.listen(this.controller.get('searchGPS'),Mojo.Event.tap, this.handleSearchGPSBinder);

    //setup the zip code textfield widget
    this.controller.setupWidget("zip",
        this.attributes = {
            hintText: ("zip code"),
            modelProperty: "zip",
            modifierState: Mojo.Widget.numLock
        },
        this.zipModel = {
            "zip": "",
            disabled: false
        }
    );

    //setup the search by zip button widget
    this.controller.setupWidget("searchZip",
        this.attributes = {
        },
        this.model = {
            label : "Search by Zip",
            disabled: false
        }
    );

    //search by zip button listener
    this.handleSearchZipBinder = this.handleSearchZipPress.bind(this);
    Mojo.Event.listen(this.controller.get('searchZip'),Mojo.Event.tap, this.handleSearchZipBinder);
};

QueryInputAssistant.prototype.domainChanged = function(){
    var domain = this.domainModel.domain;
    if (domain == "Event") {
        this.controller.stageController.pushScene('eventInput');
    }
}

QueryInputAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'nearMeHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

QueryInputAssistant.prototype.handleSearchGPSPress = function(){

    //set the user input to variables
    this.what = this.whatModel.what;

    if (this.what == '') {
        this.controller.showAlertDialog({
            onChoose: function() {$("searchGPS").mojo.deactivate();},
            title: ('Input Error'),
            message: ('Nothing to query for, please enter something in the "What" field.'),
            choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
        });
    } else {
        var message = "Getting Your Location";
        var bannerParams = {
            messageText: message
        }
        this.controller.showBanner(bannerParams, {banner: message});
        this.controller.serviceRequest('palm://com.palm.location', {
            method:"getCurrentPosition",
            parameters:{
                accuracy: 2,
                response: 2,
                maximumAge: 60
            },
            onSuccess: this.queryByGPS.bind(this),
            onFailure: this.showGPSErrorDialog.bind(this)
        });
    }
};

QueryInputAssistant.prototype.queryByGPS = function(result) {

    //set some variables
    var sort = this.sortModel.sort;
    var latitude = result.latitude;
    var longitude = result.longitude;

    Mojo.Log.info("Success");
    Mojo.Log.info("Latitude: " + latitude);
    Mojo.Log.info("Longitude: " + longitude);

    //adjust the url based on the sort selection
    if (sort == "AverageRating") {
        this.url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20local.search%20where%20latitude%3D'" + latitude + "'%20and%20longitude%3D'" + longitude + "'%20and%20query%3D'" + this.what + "'%20%7C%20sort(field%3D%22Rating." + sort + "%22)%20%7C%20reverse()&format=json&diagnostics=true&callback=";
    } else {
        this.url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20local.search%20where%20latitude%3D'" + latitude + "'%20and%20longitude%3D'" + longitude + "'%20and%20query%3D'" + this.what + "'%20%7C%20sort(field%3D%22" + sort + "%22)&format=json&diagnostics=true&callback=";
    }

    $("searchGPS").mojo.deactivate();

    this.controller.serviceRequest('palm://com.palm.connectionmanager', {
        method: 'getstatus',
        parameters: {},
        onSuccess: this.testNetConnection.bind(this),
        onFailure: this.testNetConnection.bind(this)
    });
};

QueryInputAssistant.prototype.showGPSErrorDialog = function(event) {
    this.controller.showAlertDialog({
        onChoose: function() {$("searchGPS").mojo.deactivate();},
        title: ('Location Error'),
        message: ('Could not determine location. Please search by zip code.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

QueryInputAssistant.prototype.handleSearchZipPress = function(){

    //set the user input to variables
    var what = this.whatModel.what;
    var sort = this.sortModel.sort;
    var zip = this.zipModel.zip;

    if (what == '') {
        this.controller.showAlertDialog({
            title: ('Input Error'),
            message: ('Nothing to query for, please enter something in the "What" field.'),
            choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
        });
    } else if (zip == '' || isNaN(zip) || zip.length != 5) {
        this.controller.showAlertDialog({
            title: ('Input Error'),
            message: ('Please enter a valid, five digit zip code for searching by Zip.'),
            choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
        });
    } else {

        //adjust the url based on the sort selection
        if (sort == "AverageRating") {
            this.url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20local.search%20where%20zip%3D'" + zip + "'%20and%20query%3D'" + what + "'%20%7C%20sort(field%3D%22Rating." + sort + "%22)%20%7C%20reverse()&format=json&diagnostics=true&callback=";
        } else {
            this.url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20local.search%20where%20zip%3D'" + zip + "'%20and%20query%3D'" + what + "'%20%7C%20sort(field%3D%22" + sort + "%22)&format=json&diagnostics=true&callback=";
        }

        this.controller.serviceRequest('palm://com.palm.connectionmanager', {
            method: 'getstatus',
            parameters: {},
            onSuccess: this.testNetConnection.bind(this),
            onFailure: this.testNetConnection.bind(this)
        });
    }
};

QueryInputAssistant.prototype.testNetConnection = function(response) {
    if (response.isInternetConnectionAvailable) {
        this.controller.stageController.pushScene('queryResults', this.url);
    } else {
        this.controller.showAlertDialog({
            title: ('Internet Connection Error'),
            message: ('This application requires a connection to the Internet in order to make a query. \n\
                Please check the connection and try again.'),
            choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
        });
    }
};

QueryInputAssistant.prototype.activate = function(event) {
    if (event == undefined) {
        //reset category field
        this.domainModel.domain = "Place";
        this.controller.modelChanged(this.domainModel);
    };
};
QueryInputAssistant.prototype.deactivate = function(event) {
};

QueryInputAssistant.prototype.cleanup = function(event) {
    //stop listening to the search by GPS button
    Mojo.Event.stopListening(this.controller.get('searchGPS'), Mojo.Event.tap, this.handleSearchGPSBinder);
    //stop listening to the search by zip button
    Mojo.Event.stopListening(this.controller.get('searchZip'), Mojo.Event.tap, this.handleSearchZipBinder);
    //stop listening to the domain list selector
    Mojo.Event.stopListening(this.controller.get('domain'), Mojo.Event.propertyChange, this.domainChanged);
};
