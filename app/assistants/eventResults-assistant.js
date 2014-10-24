function EventResultsAssistant(url) {
    this.url = url;
}

EventResultsAssistant.prototype.setup = function() {

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

    //setup the YQL spinner
    this.yqlSpinnerAttr = {
        spinnerSize: "large"
    }
    this.yqlSpinnerModel = {
        spinning: true
    }
    this.controller.setupWidget("yqlSpinner", this.yqlSpinnerAttr, this.yqlSpinnerModel);
    this.scrim = this.controller.get("gpsScrim");

    //setup the list widget to display the results
    this.listAttr = {
        renderLimit: 20,
        itemTemplate: 'eventResults/itemTemplate',
        listTemplate: 'eventResults/listTemplate',
        itemsCallback: this.queryYQL.bind(this)
    };

    this.controller.setupWidget('resultList', this.listAttr);
    this.listWidget = $('resultList')

    //setup the tap handler
    this.handleItemTapBinder = this.handleItemTap.bind(this);
    Mojo.Event.listen(this.controller.get('resultList'),Mojo.Event.listTap, this.handleItemTapBinder);
}

EventResultsAssistant.prototype.handleItemTap = function(event){
    this.controller.stageController.pushScene('singleEvent', this.list, event.index);
}

EventResultsAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'nearMeHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

EventResultsAssistant.prototype.queryYQL = function() {

    //ajax request to get the YQL data
    var request = new Ajax.Request(this.url,{
        method: 'get',
        evalJSON: 'true',
        onSuccess: this.readYQLTransport.bind(this),
        onFailure: this.showYQLErrorDialog.bind(this)
    });
}

EventResultsAssistant.prototype.readYQLTransport = function(transport) {

    this.list = transport.responseJSON.query.results.event;
    if (this.list.length == undefined) {
        this.list = [transport.responseJSON.query.results.event];
    }
    //fix the time from 24hr
    for (var i in this.list) {
        if (this.list.hasOwnProperty(i)) {
            var dateObjUTCStart = new Date();
            dateObjUTCStart.setTime(Date.parse(this.list[i].utc_start));
            var dateObjUTCEnd = new Date();
            dateObjUTCEnd.setTime(Date.parse(this.list[i].utc_end));

            var dateObj = new Date();
            dateObj.setTime(Date.parse(this.list[i].start_date + ", " + this.list[i].start_time));

            this.list[i].nearMe_current_time = dateObj.getTime();
            //UTC offset in minutes
            this.list[i].nearMe_current_utc = dateObj.getTimezoneOffset();
            var startTime;
            var meridiem;
            if (dateObj.getHours() > 12) {
                startTime = (dateObj.getHours() - 12) + ":";
                meridiem = " pm";
            } else {
                startTime = dateObj.getHours() + ":";
                meridiem = " am";
            }
            if (dateObj.getMinutes() == 0) {
                startTime = startTime + dateObj.getMinutes() + "0" + meridiem;
            } else {
                startTime = startTime + dateObj.getMinutes() + meridiem;
            }
            this.list[i].start_time = startTime;

            if (this.list[i].category_id == 1) {
                this.list[i].category_id = "Music: concerts, nightlife, raves";
            }
            if (this.list[i].category_id == 2) {
                this.list[i].category_id = "Performing/Visual Arts: theatre, dance, opera, exhibitions";
            }
            if (this.list[i].category_id == 3) {
                this.list[i].category_id = "Media: film, book readings";
            }
            if (this.list[i].category_id == 4) {
                this.list[i].category_id = "Social: rallies, gatherings, user groups";
            }
            if (this.list[i].category_id == 5) {
                this.list[i].category_id = "Education: lectures, workshops";
            }
            if (this.list[i].category_id == 6) {
                this.list[i].category_id = "Commercial: conventions, expos, flea markets";
            }
            if (this.list[i].category_id == 7) {
                this.list[i].category_id = "Festivals: big events, often multiple days";
            }
            if (this.list[i].category_id == 8) {
                this.list[i].category_id = "Sports: sporting events, recreation";
            }
            if (this.list[i].category_id == 10) {
                this.list[i].category_id = "Other: everything else";
            }
            if (this.list[i].category_id == 11) {
                this.list[i].category_id = "Comedy: stand-up, improv, comic theatre";
            }
            if (this.list[i].category_id == 12) {
                this.list[i].category_id = "Politics: rallies, fundraisers, meetings";
            }
            if (this.list[i].category_id == 13) {
                this.list[i].category_id = "Family: family/kid-oriented music, shows, theatre";
            }
        }
    }
    //build the list
    this.listWidget.mojo.noticeUpdatedItems(0, this.list);
    $("yqlSpinner").mojo.stop();
    this.scrim.hide();
};

EventResultsAssistant.prototype.showYQLErrorDialog = function(event) {
    this.controller.showAlertDialog({
        onChoose: function() {this.controller.stageController.popScene('queryResult');},
        title: ('YQL Query Error'),
        message: ('Could not retrieve results from YQL servers. Please go back try your query again.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

EventResultsAssistant.prototype.activate = function(event) {
};
EventResultsAssistant.prototype.deactivate = function(event) {
};
EventResultsAssistant.prototype.cleanup = function(event) {
    Mojo.Event.stopListening(this.controller.get('resultList'), Mojo.Event.listTap, this.handleItemTap.bind(this));
};
