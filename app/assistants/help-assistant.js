function HelpAssistant() {
}

HelpAssistant.prototype.setup = function() {
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

    //setup the tap handler
    Mojo.Event.listen(this.controller.get('sendEmail'),Mojo.Event.tap, this.sendEmail.bind(this));
};

HelpAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'nearMeHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

HelpAssistant.prototype.sendEmail = function(){
    this.controller.serviceRequest('palm://com.palm.applicationManager', {
        method: 'open',
        parameters: {
            id: 'com.palm.app.email',
            params: {
                summary: "nearMe Support - 1.3.0",
                recipients: [{
                    value : 'nearMeApp@gmail.com',
                    contactDisplay : 'nearMe App Support'
                }]
            }
        }
    });
};

HelpAssistant.prototype.activate = function(event) {
};

HelpAssistant.prototype.deactivate = function(event) {
};

HelpAssistant.prototype.cleanup = function(event) {
    Mojo.Event.stopListening(this.controller.get('sendEmail'), Mojo.Event.tap, this.sendEmail.bind(this));
};
