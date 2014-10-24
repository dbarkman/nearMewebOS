function SingleResultAssistant(list, index) {
    this.list = list;
    this.index = index;
}

SingleResultAssistant.prototype.setup = function() {
    
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

    //display general result data
    this.title = this.list[this.index].Title;
    var titleDiv = this.controller.get("title");
    titleDiv.innerHTML = this.title;

    var addresssDiv = this.controller.get("address");
    if (this.list[this.index].Address == null) {
        this.addressCombo = this.list[this.index].City + ", " + this.list[this.index].State;
    } else {
        this.addressCombo = this.list[this.index].Address + "<br />" + this.list[this.index].City + ", " + this.list[this.index].State;
    }
    addresssDiv.innerHTML = this.addressCombo;

    this.phone = "none";
    if ((this.list[this.index].Phone == null) || (this.list[this.index].Phone == '')) {
        var phoneRow = this.controller.get("phoneRow");
        phoneRow.hide();
    } else {
        this.phone = this.list[this.index].Phone;
        this.controller.setupWidget("phone",
            this.attributes = {
                modelProperty: "what",
                disabledProperty: "disabled",
                runTextLinker:true
            },
            this.whatModel = {
                "what": this.phone,
                "disabled": true
            }
        );
    }

    var distanceDiv = this.controller.get("distance");
    this.distance = this.list[this.index].Distance + " miles away";
    distanceDiv.innerHTML = this.distance;

    var businessURLDiv = this.controller.get("businessURL");
    this.businessURL = "";
    this.contactURL = "";
    if (this.list[this.index].BusinessUrl) {
        this.businessURL = "<a href=" + this.list[this.index].BusinessUrl + ">Web Site</a>";
        this.contactURL = this.list[this.index].BusinessUrl;
        businessURLDiv.innerHTML = this.businessURL;
    } else {
        this.businessURL = "<a href=" + this.list[this.index].Url + ">Yahoo Local Web Site</a>";
        this.contactURL = this.list[this.index].Url;
        businessURLDiv.innerHTML = this.businessURL;
    }

    var mapDiv = this.controller.get("map");
    this.map = '<a href="http://maps.google.com/maps?q=' + this.list[this.index].Latitude + ',+' + this.list[this.index].Longitude + '">Map</a>';
    mapDiv.innerHTML = this.map;

    //setup the calendar event tap handler
    Mojo.Event.listen(this.controller.get('contactPlace'),Mojo.Event.tap, this.contact.bind(this));

    //setup the email result tap handler
    Mojo.Event.listen(this.controller.get('emailResult'),Mojo.Event.tap, this.sendEmail.bind(this));

    //display ratings and reviews
    var averageRatingRow = this.controller.get("averageRatingRow");
    var lastReviewDateRow = this.controller.get("lastReviewDateRow");
    var lastReviewRow = this.controller.get("lastReviewRow");
    var moreReviewsRow = this.controller.get("moreReviewsRow");

    this.averageRating = "none";
    this.lastReviewDate = "none";
    this.lastReview = "none";
    this.moreReviews = "none";
    this.totalRatings = "";
    this.totalReviews = "";
    this.writeReview = "";

    if (this.list[this.index].Rating.AverageRating == "None") {
        averageRatingRow.hide();
        lastReviewDateRow.hide();
        lastReviewRow.hide();
        moreReviewsRow.hide();

        var totalRatingsDiv = this.controller.get("totalRatings");
        this.totalRatings = "Total Ratings: " + this.list[this.index].Rating.TotalRatings;
        totalRatingsDiv.innerHTML = this.totalRatings;

        var totalReviewsDiv = this.controller.get("totalReviews");
        this.totalReviews = "Total Reviews: " + this.list[this.index].Rating.TotalReviews;
        totalReviewsDiv.innerHTML = this.totalReviews;
    } else {
        var averageRatingDiv = this.controller.get("averageRating");
        this.averageRating = "Average Rating: " + this.list[this.index].Rating.AverageRating;
        averageRatingDiv.innerHTML = this.averageRating;

        var totalRatingsDiv = this.controller.get("totalRatings");
        this.totalRatings = "Total Ratings: " + this.list[this.index].Rating.TotalRatings;
        totalRatingsDiv.innerHTML = this.totalRatings;

        var totalReviewsDiv = this.controller.get("totalReviews");
        this.totalReviews = "Total Reviews: " + this.list[this.index].Rating.TotalReviews;
        totalReviewsDiv.innerHTML = this.totalReviews;

        this.totalReviewsCount = this.list[this.index].Rating.TotalReviews;
        if (this.totalReviewsCount == 0) {
            lastReviewDateRow.hide();
            lastReviewRow.hide();
            moreReviewsRow.hide();
        } else {
            var dateObj = new Date();
            dateObj.setTime(this.list[this.index].Rating.LastReviewDate * 1000);
            var lrDate = dateObj.getMonth()+1 + "/" + dateObj.getDate() + "/" + dateObj.getFullYear();
            var lastReviewDateDiv = this.controller.get("lastReviewDate");
            this.lastReviewDate = "Last Review Date: " + lrDate;
            lastReviewDateDiv.innerHTML = this.lastReviewDate;

            var lastReviewDiv = this.controller.get("lastReview");
            this.lastReview = "Last Review:<br />" + this.list[this.index].Rating.LastReviewIntro;
            lastReviewDiv.innerHTML = this.lastReview;

            var moreReviewsDiv = this.controller.get("moreReviews");
            this.moreReviews = '<a href="' + this.list[this.index].Url + '?tab=reviews#reviews">More Reviews</a>';
            moreReviewsDiv.innerHTML = this.moreReviews;
        }
    }
    var writeReviewDiv = this.controller.get("writeReview");
    this.writeReview = '<a href="' + this.list[this.index].Url + '?tab=reviews&open=review#review">Write a Review</a>';
    writeReviewDiv.innerHTML = this.writeReview;

    var writeReviewFPDiv = this.controller.get("writeReviewFP");
    this.writeReviewFP = '(Requires Yahoo! Login)';
    writeReviewFPDiv.innerHTML = this.writeReviewFP;

    //display categories
    this.categories = "";
    var catDiv = this.controller.get("cat");
    if (this.list[this.index].Categories != null) {
        var cats = this.list[this.index].Categories.Category;
        if (cats.length == undefined) {
            this.categories = cats.content;
            catDiv.innerHTML = this.categories;
        } else {
            for (var i in cats) {
                if (cats.hasOwnProperty(i)) {
                    if (i == 0) {
                        this.categories = this.categories + cats[i].content;
                    } else {
                        this.categories = this.categories + ", " + cats[i].content;
                    }
                }
            }
            catDiv.innerHTML = this.categories;
        }
    } else {
        this.categories = "None";
        catDiv.innerHTML = this.categories;
    }
};

SingleResultAssistant.prototype.handleCommand = function(event) {
    if(event.type == Mojo.Event.command) {
        switch(event.command) {
            case 'nearMeHelp':
                this.controller.stageController.pushScene('help');
                break;
        }
    }
};

SingleResultAssistant.prototype.contact = function(){
    this.controller.serviceRequest('palm://com.palm.accounts/crud', {
        method: 'listAccounts',
        onSuccess: this.setAccount.bind(this),
        onFailure: this.handleErrResponse.bind(this)
    })
}

SingleResultAssistant.prototype.setAccount = function(response){
    if (typeof response.list[0] != "undefined") {
        //add the contact
        this.accountId = response.list[0].accountId;
        this.controller.serviceRequest('palm://com.palm.contacts/crud', {
              method: 'createContact',
              parameters: {
                   accountId: this.accountId,
                   contact: {
                       companyName: this.title,
                       urls: [{
                           url: this.contactURL
                       }],
                       addresses: [{
                           label: 1,
                           streetAddress: this.addressCombo
                       }],
                       phoneNumbers: [{
                           label: 1,
                           value: this.phone
                       }]
                    }
               },
               onSuccess: this.handleAddResponse.bind(this),
               onFailure: this.handleErrResponse.bind(this)
        });
//use to delete an account
//        this.controller.serviceRequest('palm://com.palm.accounts/crud', {
//             method:   'deleteAccount',
//             parameters: {
//                 accountId: this.accountId,
//                 dataTypes: ["CONTACTS", "CALENDAR"]
//             },
//            onSuccess: this.handleAddResponse.bind(this),
//            onFailure: this.handleErrResponse.bind(this)
//        });
    } else {
        //add the contact account
        this.setup = {
            "username": 'nearMe',
            "domain": 'realsimpleapps',
            "displayName": 'nearMe',
            "icons":{'largeIcon:string': 'smallIcon:string'},
            "dataTypes": ['CONTACTS', 'CALENDAR'],
            "isDataReadOnly": false
        }
        this.controller.serviceRequest('palm://com.palm.accounts/crud', {
            method: 'createAccount',
            parameters: this.setup,
            onSuccess: this.contact.bind(this),
            onFailure: this.handleErrResponse.bind(this)
        })
    }
}

SingleResultAssistant.prototype.handleAddResponse = function(response){
    this.controller.showAlertDialog({
        title: ('Place Added'),
        message: ('This Place was added to your Contacts.'),
        choices: [{label:('Continue'), value:'dismiss', type:'primary'}]
    });
};

SingleResultAssistant.prototype.handleErrResponse = function(response) {
    this.controller.showAlertDialog({
        title: ('Contacts Error'),
        message: ('An unexpected error occured while working with contacts.'),
        choices: [{label:('Dismiss'), value:'dismiss', type:'primary'}]
    });
};

SingleResultAssistant.prototype.sendEmail = function(){
    var body =
        "<h3>"
            + this.title +
        "</h3>"
            + this.addressCombo;
    if (this.phone != "none") {
        body = body +
            "<br />"
                + this.phone;
    }
    body = body +
        "<br />"
            + this.map +
        "<br /><br />"
            + this.businessURL;
    if (this.averageRating == "none"){
        body = body +
        "<br /><br />"
            + this.totalRatings +
        "<br />"
            + this.totalReviews +
        "<br /><br />"
            + this.writeReview;
    } else {
        body = body +
        "<br /><br />"
            + this.averageRating +
        "<br />"
            + this.totalRatings +
        "<br />"
            + this.totalReviews;
        if (this.totalReviewsCount == 0) {
            body = body +
            "<br /><br />"
                + this.writeReview;
        } else {
            body = body +
            "<br />"
                + this.lastReviewDate +
            "<br />"
                + this.lastReview +
            "<br /><br />"
                + this.moreReviews + " - " + this.writeReview;
        }
    }
    if (this.categories != "None") {
        body = body +
            "<br /><br />Categories: "
                + this.categories;
    }
    body = body +
        '<br /><br /><hr style="width: 55%; float: left;" /><br /><br />';
    body = body +
        "This Place Result was discovered using the nearMe app on a Palm webOS device.<br /><br />" +
        "Get nearMe for you Palm device at http://bit.ly/nearMe.<br /><br />" +
        "Visit http://RealSimpleApps.com for more information.<br /><br />" +
        "For more information about Palm and their great phones, visit http://palm.com.";

    this.controller.serviceRequest('palm://com.palm.applicationManager', {
        method: 'open',
        parameters: {
            id: 'com.palm.app.email',
            params: {
                summary: "nearMe Place Result: " + this.title,
                text: body
            }
        }
    });
};

SingleResultAssistant.prototype.activate = function(event) {
};
SingleResultAssistant.prototype.deactivate = function(event) {
};
SingleResultAssistant.prototype.cleanup = function(event) {
    Mojo.Event.stopListening(this.controller.get('emailResult'), Mojo.Event.tap, this.sendEmail.bind(this));
    Mojo.Event.stopListening(this.controller.get('contactPlace'), Mojo.Event.tap, this.contact.bind(this));
};
