function SingleEventAssistant(list, index) {
    this.list = list;
    this.index = index;

    this.acctid;
    this.clndrid;
}

SingleEventAssistant.prototype.setup = function() {

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

    //display the name
    var nameDiv = this.controller.get("name");
    this.name = this.list[this.index].name;
    nameDiv.innerHTML = this.name;

    //display the description
    this.description = "none";
    if (this.list[this.index].description == "") {
        var descriptionRow = this.controller.get("descriptionRow");
        descriptionRow.hide();
    } else {
        var descriptionDiv = this.controller.get("description");
        this.description = this.list[this.index].description;
        descriptionDiv.innerHTML = this.description;
    }

    //venue info
    var venueDiv = this.controller.get("venue");
    this.venueCombo = "";
    this.venueNotes = "";
    this.venueCal = "";
    if (this.list[this.index].venue_name != null) {
        this.venueCombo = this.list[this.index].venue_name + "<br />";
        this.venueNotes = this.list[this.index].venue_name + "\n";
    }
    if (this.list[this.index].venue_address != null) {
        this.venueCombo = this.venueCombo + this.list[this.index].venue_address + "<br />";
        this.venueNotes = this.venueNotes + this.list[this.index].venue_address + "\n";
        this.venueCal = this.list[this.index].venue_address + ", ";
    }
    if (this.list[this.index].venue_city != null) {
        this.venueCombo = this.venueCombo + this.list[this.index].venue_city + ", ";
        this.venueNotes = this.venueNotes + this.list[this.index].venue_city + ", ";
        this.venueCal = this.venueCal + this.list[this.index].venue_city + ", ";
    }
    if (this.list[this.index].venue_state_code != null) {
        this.venueCombo = this.venueCombo + this.list[this.index].venue_state_code + " ";
        this.venueNotes = this.venueNotes + this.list[this.index].venue_state_code + " ";
        this.venueCal = this.venueCal + this.list[this.index].venue_state_code + " ";
    }
    if (this.list[this.index].venue_zip != null) {
        this.venueCombo = this.venueCombo + this.list[this.index].venue_zip;
        this.venueNotes = this.venueNotes + this.list[this.index].venue_zip;
        this.venueCal = this.venueCal + this.list[this.index].venue_zip;
    }
    venueDiv.innerHTML = this.venueCombo;

    //distance and map link
    var mapDiv = this.controller.get("map");
    this.distance = this.list[this.index].distance + " " + this.list[this.index].distance_units  + " away - ";
    this.map = '<a href="http://maps.google.com/maps?q=' + this.list[this.index].latitude + ',+' + this.list[this.index].longitude + '">Map</a>';
    mapDiv.innerHTML = this.distance + this.map;

    //setup the calendar event tap handler
    Mojo.Event.listen(this.controller.get('calEvent'),Mojo.Event.tap, this.calEvent.bind(this));

    //setup the email event tap handler
    Mojo.Event.listen(this.controller.get('emailEvent'),Mojo.Event.tap, this.sendEmail.bind(this));

    //event details
    var dateTimeDiv = this.controller.get("dateTime");
    this.dateTime = this.list[this.index].start_date_last_rendition + " @ " + this.list[this.index].start_time;
    dateTimeDiv.innerHTML = this.dateTime;

    //ticket price
    this.ticketPrice = "none";
    var ticketPriceDiv = this.controller.get("ticketPrice");
    if (this.list[this.index].ticket_price != "") {
        this.ticketPrice = "Ticket Price: " + this.list[this.index].ticket_price;
        ticketPriceDiv.innerHTML = this.ticketPrice;
    } else if (this.list[this.index].ticket_free == 1) {
        this.ticketPrice = "Free Admission!";
        ticketPriceDiv.innerHTML = this.ticketPrice;
    } else {
        var ticketPriceRow = this.controller.get("ticketPriceRow");
        ticketPriceRow.hide();
    }

    //eventURL
    this.eventURL = "none";
    if (this.list[this.index].url == "") {
        var eventURLRow = this.controller.get("eventURLRow");
        eventURLRow.hide();
    } else {
        var eventURLDiv = this.controller.get("eventURL");
        this.eventURL = '<a href="' + this.list[this.index].url + '">Event URL</a>';
        eventURLDiv.innerHTML = this.eventURL;
    }

    //ticketURL
    this.ticketURL = "none";
    if (this.list[this.index].ticket_url == "") {
        var ticketURLRow = this.controller.get("ticketURLRow");
        ticketURLRow.hide();
    } else {
        var ticketURLDiv = this.controller.get("ticketURL");
        this.ticketURL = '<a href="' + this.list[this.index].ticket_url + '">Ticket URL</a>';
        ticketURLDiv.innerHTML = this.ticketURL;
    }

    //category
    var categoryDiv = this.controller.get("category");
    this.category = this.list[this.index].category_id;
    categoryDiv.innerHTML = this.category;
};

SingleEventAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'nearMeHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

SingleEventAssistant.prototype.calEvent = function(){
    this.controller.serviceRequest('palm://com.palm.accounts/crud', {
        method: 'listAccounts',
        onSuccess: this.setAccount.bind(this),
        onFailure: this.handleErrResponse.bind(this)
    })
}

SingleEventAssistant.prototype.setAccount = function(response){
    if (typeof response.list[0] != "undefined") {
        this.acctid = response.list[0].accountId;
        this.controller.serviceRequest('palm://com.palm.calendar/crud', {
            method: 'listCalendars',
            parameters: {
                "accountId": this.acctid
            },
            onSuccess: this.handleSetAccountResponse.bind(this),
            onFailure: this.handleErrResponse.bind(this)
        })
    } else {
        this.setup = {
            "username":'nearMe',
            "domain":'realsimpleapps',
            "displayName":'nearMe',
            "icons":{'largeIcon:string': 'smallIcon:string'},
            "dataTypes":['CONTACTS', 'CALENDAR'],
            "isDataReadOnly":false
        }
        this.controller.serviceRequest('palm://com.palm.accounts/crud', {
            method: 'createAccount',
            parameters: this.setup,
            onSuccess: this.calEvent.bind(this),
            onFailure: this.handleErrResponse.bind(this)
        })
    }
}

SingleEventAssistant.prototype.handleSetAccountResponse = function(response){
    if(typeof response.calendars[0] != "undefined"){
        this.clndrid = response.calendars[0].calendarId;
        this.event = {
            "subject": this.name,
            "startTimestamp": this.list[this.index].nearMe_current_time,
            "endTimestamp": this.list[this.index].nearMe_current_time,
            "allDay": "false",
            "note": this.dateTime + "\n\n" + this.venueNotes,
            "location": this.venueCal,
            "alarm": "-PT1H"
        };
	this.controller.serviceRequest('palm://com.palm.calendar/crud', {
            method: 'createEvent',
            parameters: {
                "calendarId": this.clndrid,
                "event": this.event
            },
            onSuccess: this.handleAddResponse.bind(this),
            onFailure: this.handleErrResponse.bind(this)
        })
    } else {
        this.controller.serviceRequest('palm://com.palm.calendar/crud', {
            method: 'createCalendar',
            parameters: {
                "accountId": this.acctid,
                "calendar": {
                    "calendarId": '',
                    "name": 'nearMe Calendar'
                }
            },
            onSuccess: this.calEvent.bind(this),
            onFailure: this.handleErrResponse.bind(this)
        })
    }
}

SingleEventAssistant.prototype.handleAddResponse = function(response){
    this.controller.showAlertDialog({
        title: ('Event Created'),
        message: ('This Event was added to your Calendar.'),
        choices: [{label:('Continue'), value:'dismiss', type:'primary'}]
    });
};

SingleEventAssistant.prototype.handleErrResponse = function(response) {
    this.controller.showAlertDialog({
        title: ('Calendar Error'),
        message: ('An unexpected error occured while working with the calendar.\n\
            If the problem persists, remove the nearMe calendar account and try adding again.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

SingleEventAssistant.prototype.sendEmail = function(){
    var body =
        "<h3>"
            + this.name +
        "</h3>"
    if (this.description != "none") {
        body = body
            + this.description +
            "<br />";
    }
    body = body +
        "<br />"
            + this.venueCombo +
        "<br />"
            + this.map +
        "<br /><br />"
            + this.dateTime;
    if (this.ticketPrice != "none") {
        body = body +
            "<br /><br />"
                + this.ticketPrice;
    }
    if (this.eventURL != "none") {
        body = body +
            "<br /><br />"
            + this.eventURL;
    }
    if (this.ticketURL != "none") {
        body = body +
            "<br /><br />"
            + this.ticketURL;
    }
    body = body +
        "<br /><br />" +
        "Category: "
            + this.category;
    body = body +
        '<br /><br /><hr style="width: 55%; float: left;" /><br /><br />';
    body = body +
        "This Event Result was discovered using the nearMe app on a Palm webOS device.<br /><br />" +
        "Get nearMe for you Palm device at http://bit.ly/nearMe.<br /><br />" +
        "Visit http://RealSimpleApps.com for more information.<br /><br />" +
        "For more information about Palm and their great phones, visit http://palm.com.";

    this.controller.serviceRequest('palm://com.palm.applicationManager', {
        method: 'open',
        parameters: {
            id: 'com.palm.app.email',
            params: {
                summary: "nearMe Event Result: " + this.name,
                text: body
            }
        }
    });
};

SingleEventAssistant.prototype.activate = function(event) {
};
SingleEventAssistant.prototype.deactivate = function(event) {
};
SingleEventAssistant.prototype.cleanup = function(event) {
    Mojo.Event.stopListening(this.controller.get('emailEvent'), Mojo.Event.tap, this.sendEmail.bind(this));
    Mojo.Event.stopListening(this.controller.get('calEvent'), Mojo.Event.tap, this.calEvent.bind(this));
};
