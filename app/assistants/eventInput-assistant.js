function EventInputAssistant() {
}

EventInputAssistant.prototype.setup = function() {

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

    //setup the name textfield widget
    this.controller.setupWidget("name",
        this.attributes = {
            hintText: ("name, venue, descr... (optional)"),
            modelProperty: "name",
            autoFocus: true,
            textCase: Mojo.Widget.steModeTitleCase
        },
        this.nameModel = {
            "name": "",
            disabled: false
        }
    );

    //setup the cats listSelect widget
    this.controller.setupWidget("cats",
        this.attributes = {
            label: 'Category (optional)',
            modelProperty: "cats",
            choices: [
            {label: "None", value: "None"},
            {label: "Music (concerts, nightlife, raves)", value: "1"},
            {label: "Sports (sporting events, recreation)", value: "8"},
            {label: "Comedy (stand-up, improv, comic theatre)", value: "11"},
            {label: "Family (family/kid-oriented music, shows, theatre)", value: "13"},
            {label: "Media (film, book readings)", value: "3"},
            {label: "Performing/Visual Arts (theatre, dance, opera, exhibitions)", value: "2"},
            {label: "Social (rallies, gatherings, user groups)", value: "4"},
            {label: "Education (lectures, workshops)", value: "5"},
            {label: "Festivals (big events, often multiple days)", value: "7"},
            {label: "Politics (rallies, fundraisers, meetings)", value: "12"},
            {label: "Commercial (conventions, expos, flea markets)", value: "6"},
            {label: "Other (everything else)", value: "10"},
        ]},
        this.catsModel = {
            "cats": "None",
            disabled: false
        }
    );

    //setup the startDate textfield widget
    this.controller.setupWidget("startDate",
        this.attributes = {
            hintText: ("start date (optional)"),
            modelProperty: "startDate",
            modifierState: Mojo.Widget.numLock
        },
        this.startDateModel = {
            "startDate": "",
            disabled: false
        }
    );

    //setup the endDate textfield widget
    this.controller.setupWidget("endDate",
        this.attributes = {
            hintText: ("end date (optional)"),
            modelProperty: "endDate",
            modifierState: Mojo.Widget.numLock
        },
        this.endDateModel = {
            "endDate": "",
            disabled: false
        }
    );

    //setup the sort listSelect widget
    this.controller.setupWidget("sort",
        this.attributes = {
            label: 'Sort',
            modelProperty: "sort",
            choices: [
            {label: "Start Date", value: "start_date"},
            {label: "Name", value: "name"},
            {label: "Distance", value: "distance"}
        ]},
        this.sortModel = {
            "sort": "start_date",
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

EventInputAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'nearMeHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

EventInputAssistant.prototype.handleSearchGPSPress = function(){

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
};

EventInputAssistant.prototype.queryByGPS = function(result) {

    //set some variables
    var latitude = result.latitude;
    var longitude = result.longitude;

    Mojo.Log.info("Success");
    Mojo.Log.info("Latitude: " + latitude);
    Mojo.Log.info("Longitude: " + longitude);

    //setup the url
    this.url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20upcoming.events%20where%20location%3D%22" + latitude + "%2C%20" + longitude + "%22";

    //add the name field
    if (this.nameModel.name) {
        var name = this.nameModel.name;
        this.url = this.url + "%20and%20search_text%3D%22" + name + "%22";
    }

    //add the cats field
    if (this.catsModel.cats != "None") {
        var cats = this.catsModel.cats;
        this.url = this.url + "%20and%20category_id%3D%22" + cats + "%22";
    }

    //add the startDate field
    if (this.startDateModel.startDate) {
        var startDate = this.startDateModel.startDate;
        var dateObj = new Date();
        dateObj.setTime(Date.parse(startDate));
        var sDate = dateObj.getFullYear();
        if ((dateObj.getMonth() + 1) < 10) {
            var sDate = sDate + "-0" + (dateObj.getMonth() + 1);
        } else {
            var sDate = sDate + "-" + (dateObj.getMonth() + 1);
        }
        if (dateObj.getDate() < 10) {
            var sDate = sDate + "-0" + dateObj.getDate();
        } else {
            var sDate = sDate + "-" + dateObj.getDate();
        }
        this.url = this.url + "%20and%20min_date%3D%22" + sDate + "%22";
    }

    //add the endDate field
    if (this.endDateModel.endDate) {
        var endDate = this.endDateModel.endDate;
        var dateObj = new Date();
        dateObj.setTime(Date.parse(endDate));
        var eDate = dateObj.getFullYear();
        if ((dateObj.getMonth() + 1) < 10) {
            var eDate = eDate + "-0" + (dateObj.getMonth() + 1);
        } else {
            var eDate = eDate + "-" + (dateObj.getMonth() + 1);
        }
        if (dateObj.getDate() < 10) {
            var eDate = eDate + "-0" + dateObj.getDate();
        } else {
            var eDate = eDate + "-" + dateObj.getDate();
        }
        this.url = this.url + "%20and%20max_date%3D%22" + eDate + "%22";
    }

    //add the sort field
    if (this.sortModel.sort != "None") {
        var sort = this.sortModel.sort;
        this.url = this.url + "%20%7C%20sort(field%3D%22" + sort + "%22)";
    }

    //finish the url
    this.url = this.url + "&format=json&diagnostics=true&callback=";

    $("searchGPS").mojo.deactivate();

    this.controller.serviceRequest('palm://com.palm.connectionmanager', {
        method: 'getstatus',
        parameters: {},
        onSuccess: this.testNetConnection.bind(this),
        onFailure: this.testNetConnection.bind(this)
    });
};

EventInputAssistant.prototype.showGPSErrorDialog = function(event) {
    this.controller.showAlertDialog({
        onChoose: function() {$("searchGPS").mojo.deactivate();},
        title: ('Location Error'),
        message: ('Could not determine location. Please search by zip code.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

EventInputAssistant.prototype.handleSearchZipPress = function(){

    //set the user input to variables
    var zip = this.zipModel.zip;

    if (zip == '' || isNaN(zip) || zip.length != 5) {
        this.controller.showAlertDialog({
            title: ('Input Error'),
            message: ('Please enter a valid, five digit zip code for searching by Zip.'),
            choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
        });
    } else {
        //setup the url
        this.url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20upcoming.events%20where%20location%3D%22" + zip + "%22";

        //add the name field
        if (this.nameModel.name) {
            var name = this.nameModel.name;
            this.url = this.url + "%20and%20search_text%3D%22" + name + "%22";
        }

        //add the cats field
        if (this.catsModel.cats != "None") {
            var cats = this.catsModel.cats;
            this.url = this.url + "%20and%20category_id%3D%22" + cats + "%22";
        }

        //add the startDate field
        if (this.startDateModel.startDate) {
            var startDate = this.startDateModel.startDate;
            var dateObj = new Date();
            dateObj.setTime(Date.parse(startDate));
            var sDate = dateObj.getFullYear();
            if ((dateObj.getMonth() + 1) < 10) {
                var sDate = sDate + "-0" + (dateObj.getMonth() + 1);
            } else {
                var sDate = sDate + "-" + (dateObj.getMonth() + 1);
            }
            if (dateObj.getDate() < 10) {
                var sDate = sDate + "-0" + dateObj.getDate();
            } else {
                var sDate = sDate + "-" + dateObj.getDate();
            }
            this.url = this.url + "%20and%20min_date%3D%22" + sDate + "%22";
        }

        //add the endDate field
        if (this.endDateModel.endDate) {
            var endDate = this.endDateModel.endDate;
            var dateObj = new Date();
            dateObj.setTime(Date.parse(endDate));
            var eDate = dateObj.getFullYear();
            if ((dateObj.getMonth() + 1) < 10) {
                var eDate = eDate + "-0" + (dateObj.getMonth() + 1);
            } else {
                var eDate = eDate + "-" + (dateObj.getMonth() + 1);
            }
            if (dateObj.getDate() < 10) {
                var eDate = eDate + "-0" + dateObj.getDate();
            } else {
                var eDate = eDate + "-" + dateObj.getDate();
            }
            this.url = this.url + "%20and%20max_date%3D%22" + eDate + "%22";
        }

        //add the sort field
        if (this.sortModel.sort != "None") {
            var sort = this.sortModel.sort;
            this.url = this.url + "%20%7C%20sort(field%3D%22" + sort + "%22)";
        }

        //finish the url
        this.url = this.url + "&format=json&diagnostics=true&callback=";

        $("searchGPS").mojo.deactivate();

        this.controller.serviceRequest('palm://com.palm.connectionmanager', {
            method: 'getstatus',
            parameters: {},
            onSuccess: this.testNetConnection.bind(this),
            onFailure: this.testNetConnection.bind(this)
        });
    }
};

EventInputAssistant.prototype.testNetConnection = function(response) {
    if (response.isInternetConnectionAvailable) {
        this.controller.stageController.pushScene('eventResults', this.url);
    } else {
        this.controller.showAlertDialog({
            title: ('Internet Connection Error'),
            message: ('This application requires a connection to the Internet in order to make a query. \n\
                Please check the connection and try again.'),
            choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
        });
    }
};

EventInputAssistant.prototype.activate = function(event) {
};
EventInputAssistant.prototype.deactivate = function(event) {
};

EventInputAssistant.prototype.cleanup = function(event) {
    //stop listening to the search by GPS button
    Mojo.Event.stopListening(this.controller.get('searchGPS'), Mojo.Event.tap, this.handleSearchGPSBinder);
    //stop listening to the search by zip button
    Mojo.Event.stopListening(this.controller.get('searchZip'), Mojo.Event.tap, this.handleSearchZipBinder);
};
