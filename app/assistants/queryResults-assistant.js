function QueryResultsAssistant(url) {
    this.url = url;
}

QueryResultsAssistant.prototype.setup = function() {

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
        itemTemplate: 'queryResults/itemTemplate',
        listTemplate: 'queryResults/listTemplate',
        itemsCallback: this.queryYQL.bind(this)
    };

    this.controller.setupWidget('resultList', this.listAttr);
    this.listWidget = $('resultList')

    //setup the tap handler
    this.handleItemTapBinder = this.handleItemTap.bind(this);
    Mojo.Event.listen(this.controller.get('resultList'),Mojo.Event.listTap, this.handleItemTapBinder);
}

QueryResultsAssistant.prototype.handleItemTap = function(event){
    this.controller.stageController.pushScene('singleResult', this.list, event.index);
}

QueryResultsAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'nearMeHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

QueryResultsAssistant.prototype.queryYQL = function() {

    //ajax request to get the YQL data
    var request = new Ajax.Request(this.url,{
        method: 'get',
        evalJSON: 'true',
        onSuccess: this.readYQLTransport.bind(this),
        onFailure: this.showYQLErrorDialog.bind(this)
    });
}

QueryResultsAssistant.prototype.readYQLTransport = function(transport) {

    this.list = transport.responseJSON.query.results.Result;
    if (this.list.length == undefined) {
        this.list = [transport.responseJSON.query.results.Result];
    }
    for (var i in this.list) {
        if (this.list.hasOwnProperty(i)) {
            if (this.list[i].Rating.AverageRating == "NaN") {
                this.list[i].Rating.AverageRating = "None";
            }
        }
    }
    this.listWidget.mojo.noticeUpdatedItems(0, this.list);
    $("yqlSpinner").mojo.stop();
    this.scrim.hide();
};

QueryResultsAssistant.prototype.showYQLErrorDialog = function(event) {
    this.controller.showAlertDialog({
        onChoose: function() {this.controller.stageController.popScene('queryResult');},
        title: ('YQL Query Error'),
        message: ('Could not retrieve results from YQL servers. Please go back try your query again.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

QueryResultsAssistant.prototype.activate = function(event) {
};
QueryResultsAssistant.prototype.deactivate = function(event) {
};
QueryResultsAssistant.prototype.cleanup = function(event) {
    Mojo.Event.stopListening(this.controller.get('resultList'), Mojo.Event.listTap, this.handleItemTap.bind(this));
};
