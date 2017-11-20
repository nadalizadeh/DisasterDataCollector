var DEBUG = false;
// var TARGET_URL =  'http://rootshell.ir/disaster/pushdata.php';
// var TARGET_URL = 'http://localhost:9090';
//var TARGET_URL = 'http://wordpress:80/cis.php';
var TARGET_URL = 'http://ob.memari.online:80/cis.php';

var UPLOAD_TIMEOUT = 10000;
var ID_FORM__LOGIN = 'login-data';
var MSG_DURATION = 4000;

var CMD_FORM_DATA = "form_data";
var CMD_FORM_WHICH_TO_UPLOAD = "form_data_which_to_upload";

var STORAGE_KEY = 'crisis_storate';

var WORKAROUND_TIMEOUT = 500;


// --------------------------------------------------

// Initialize app
var myApp = new Framework7({
    template7Pages: true, // enable Template7 rendering for Ajax and Dynamic pages
    init: false, // prevent app from automatic initialization
    template7Data: {}
});
window.hahaha = myApp;

Template7.global = {
    // For form 21.
    range10: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],

    formList: {
        'پایه': [
            {id: 0, formId: '0', caption: 'اطلاعات پایه'}
        ],
        'اجتماعی': [
            {id: 11, formId: '1-1', caption: 'اسکان'},
            {id: 12, formId: '1-2', caption: 'سلامت و جمعیت'},
            {id: 13, formId: '1-3', caption: 'آموزش'},
            {id: 14, formId: '1-4', caption: 'مواد غذایی'},
            {id: 15, formId: '1-5', caption: 'میراث فرهنگی'},
            {id: 16, formId: '1-6', caption: 'آداب و رسوم ویژه'}
        ],
        'اقتصادی': [
            {id: 21, formId: '2-1', caption: 'کشاورزی'},
            {id: 22, formId: '2-2', caption: 'منابع تامین آب کشاورزی'},
            {id: 23, formId: '2-3', caption: 'صنعت و تجارت'},
            {id: 24, formId: '2-4', caption: 'گردشگری'},
            {id: 25, formId: '2-5', caption: 'مالی'}
        ],
        'زیرساختی': [
            {id: 31, formId: '3-1', caption: 'برق'},
            {id: 32, formId: '3-2', caption: 'مخابرات'},
            {id: 33, formId: '3-3', caption: 'زیرساخت مخابرات'},
            {id: 34, formId: '3-4', caption: 'حمل و نقل'},
            {id: 35, formId: '3-5', caption: 'آب، تصفیه و بهداشت'}
        ],
        'مدیریتی': [
            {id: 41, formId: '4-1', caption: 'مدیریت'},
            {id: 42, formId: '4-2', caption: 'مرتع و محیط زیست'},
            {id: 43, formId: '4-3', caption: 'حمایت اجتماعی'}
        ]
    }
};

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// --------------------------------------------------

function isFun(f) {
    return typeof f === "function";
}

var visitList = [];

var msger = {
    ERR: 'error',
    OK: 'success',
    INFO: 'default',
    m: null,
    msg: function (type, text, showToast) {
        if (type === this.ERR)
            text = 'خطا' + ': ' + text;

        showToast = typeof showToast === 'undefined' || showToast;
        if (showToast)
            var toast = new Message(text, {type: type, duration: MSG_DURATION}).show();

        $$("#toolbarMsg").text(text);
    },
    err: function (text, showToast) {
        this.msg(this.ERR, text, showToast);
    },
    ok: function (text, showToast) {
        this.msg(this.OK, text, showToast);
    },
    info: function (text, showToast) {
        this.msg(this.INFO, text, showToast);
    }
};

var user = {
    err: '',
    get: function () {
        var data = myApp.formGetData(ID_FORM__LOGIN);

        if (!data) {
            this.err = 'اطلاعات کاربری وارد نشده است';
            return null;
        }
        if (!data.username) {
            this.err = 'نام کاربری وارد نشده است';
            return null;
        }
        if (!data.password) {
            this.err = 'رمز عبور وارد نشده است';
            return null;
        }

        return data;
    },
    sayErr: function () {
        msger.err(this.err);
    }
};

var upload = newCommInterlock(UPLOAD_TIMEOUT);

function newCommInterlock(timeout) {
    return {
        remaining: 0,
        inProgress: false,

        _displayProgress: function (self) {
            if (!self.inProgress || --self.remaining < 0)
                return;

            var m = 'در حال ارسال: ' + self.remaining + '...';
            msger.info(m, false);
            setTimeout(self._displayProgress, 1000, self);
        },

        set: function () {
            this.inProgress = true;
            this.remaining = Math.round(timeout / 1000);
            msger.info('در حال ارسال ...');
            this._displayProgress(this);
        },
        unset: function () {
            this.inProgress = false;
            // $$("#uploadDataButton").show();
        },
        isInProg: function () {
            return this.inProgress;
        },

        sayWait: function () {
            msger.info('اطلاعات در حال ارسال است لطفا صبر کنید...');
        },
        sayOk: function () {
            msger.ok('ارسال موفق بود');
        },
        sayFail: function () {
            msger.err('متاسفانه ارسال اطلاعات به سرور با خطا روبرو شد');
        }
    };
}

function post(user, data, cmd, onSuccess, onErr, timeout) {
    var reqData = {
        cmd: cmd,
        username: user.username,
        password: user.password,
        arg: data
    };

    console.info("sending data", TARGET_URL, reqData);

    $$.ajax({
        contentType: 'application/json',
        data: JSON.stringify(reqData),
        dataType: 'raw',
        success: function (data) {
            console.debug('Data received : ', data);
            if (isFun(onSuccess))
                onSuccess(data);
        },
        error: function (xmlhttp, err) {
            console.error('Ajax req failed ', err);
            if (isFun(onErr))
                onErr(err, xmlhttp);
        },
        processData: false,
        type: 'POST',
        url: TARGET_URL,
        timeout: timeout === undefined ? UPLOAD_TIMEOUT : timeout
    });
}

// --------------------------------------------------

function saveVisitList() {
    window.localStorage.setItem('visitList', JSON.stringify(visitList))
}

function getVisitList() {
    var visitListStr = window.localStorage.getItem('visitList');
    if (visitListStr === undefined || visitListStr === null) {
        visitList = []
    }
    else {
        try {
            visitList = JSON.parse(visitListStr)
        }
        catch (err) {
            console.log(err);
            visitList = [];
        }
    }
    return visitList
}

function addVisit(visitName) {
    visitList.push(visitName);
    saveVisitList()
}

function addVisitButtonClicked() {
    addVisit('بازدید ' + (visitList.length + 1));
    populateVisitList()
}

function getHTMLForVisit(id, visitName) {
    return '<li><a href="formlist.html?visitId=' + id + '" data-context=\'{"visitId": ' + id + ', "visitName": "' + visitName + '"}\' class="item-link item-content">' +
        '<div class="item-inner">' +
        '<div class="item-title">' + visitName + '</div>' +
        '</div></a></li>'
}

function populateVisitList() {
    // window.localStorage.clear()
    getVisitList();
    var thehtml = '';
    for (var i = 0; i < visitList.length; i++) {
        thehtml += getHTMLForVisit(i, visitList[i])
    }
    $$('#visit-listblock > ul').html(thehtml)
}


// --------------------------------------------------

function crisisGetStore() {
    var store = window.localStorage.getItem(STORAGE_KEY);

    if (!store || store === null || store === undefined) {
        store = {};
    }
    else {
        try {
            store = JSON.parse(store);
        }
        catch (ex) {
            console.error('failed to get store from local storage', ex);
            store = {};
        }
    }
    if (!store || store === null || store === undefined) {
        store = {};
    }

    store.formsData = (store.formsData && typeof store.formsData === "object") ? store.formsData : {};

    return store;
}

function crisisSetStore(store) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function saveForm(vid, idid, f) {
    console.log('saving');
    console.log('vid', vid);
    console.log('idid', idid);
    console.log('f', f);
    var $f = $(f);
    var formData = {};
    $f.find('input').each(function (i, self) {
        formData[self.id] = $(self).val();
    });
    $f.find('select').each(function (i, self) {
        formData[self.id] = $(self).val();
    });

    var store = crisisGetStore();
    if (!store.formsData[vid])
        store.formsData[vid] = {};
    if (!store.formsData[vid][idid])
        store.formsData[vid][idid] = {};
    store.formsData[vid][idid] = formData;

    crisisSetStore(store);
}

function reloadForm(vid, idid, f) {
    var formsData = crisisGetStore().formsData;
    if (!formsData[vid] || !formsData[vid][idid]) {
        console.log('no data for form', vid, idid, f);
        return;
    }
    var fdata = formsData[vid][idid];
    var $f = $(f);
    $f.find('input').each(function (i, self) {
        $(self).val(fdata[self.id]);
    });
    $f.find('select').each(function (i, self) {
        $(self).val(fdata[self.id]);
    });
}

function initSaveForm() {
    $('#remove-me-on-load').text('بارگذاری شد.');
    $('.backback').removeClass('backback');
    var f = null;
    var vid = null;
    var idid = null;
    $('form').each(function (i, fff) {
        if (f !== null)
            return;
        if (!fff.dataset)
            return;
        ds = fff.dataset;
        if (ds["saveme"] === "please" && ds['vid'] && ds['idid']) {
            f = fff;
            vid = ds['vid'];
            idid = ds['idid'];
        }
    });

    if (!f) {
        console.log('form not found!!!!');
        return;
    }

    function onChange() {
        saveForm(vid, idid, f);
    }

    function onReload() {
        console.log('reload button');
        reloadForm(vid, idid, f);
    }

    $$('.save-form').on('click', onChange);
    $$('.reload-form').on('click', onReload);
    var $f = $(f);
    $f.find('input').each(function (i, self) {
        $(self).change(onChange);
    });
    $f.find('select').each(function (i, self) {
        $(self).change(onChange);
    });

    reloadForm(vid, idid, f);
}

// --------------------------------------------------

function getAllFormsData() {
    var items = [];
    var fd = crisisGetStore().formsData;
    var visitIds = Object.keys(fd);
    for (var i = 0; i < visitIds.length; i++) {
        var vid = visitIds[i];
        var visitData = {
            visitId: vid,
            hash: null,
            details: JSON.stringify(fd[vid])
        };
        visitData.hash = md5(JSON.stringify(visitData.details));
        items.push(visitData);
    }

    // for (var visitId = 0; visitId < visitList.length; visitId++) {
    //     var visitData = {
    //         visitId: visitId,
    //         visitName: visitList[visitId],
    //         hash: null,
    //         details: {
    //             // Will be filled with the following logic
    //         }
    //     };
    //
    //     Object.keys(Template7.global.formList).forEach(function (currentValue, catIndex, arr) {
    //         Template7.global.formList[currentValue].forEach(function (formInfo, index2, arr) {
    //             var formName = 'V' + visitId + '-form' + formInfo.id;
    //             var m = myApp.formGetData(formName);
    //             if (m !== undefined) {
    //                 visitData.details[formInfo.formId] = myApp.formGetData(formName);
    //             }
    //         });
    //     });
    //
    //     visitData.hash = md5(JSON.stringify(visitData.details));
    //     items.push(visitData);
    // }
    //

    return items;
}

function whichFormsToUpload(forms) {
    var ask = [];
    for (var i = 0; i < forms.length; i++) {
        ask.push({
            vid: forms[i].visitId,
            hash: forms[i].hash
        });
    }
    return ask;
}

function filterOutForms(forms, vids) {
    var f = [];
    for (var i = 0; i < forms.length; i++) {
        if (vids.indexOf(forms[i].visitId) >= 0) {
            f.push(forms[i]);
        }
    }
    return f;
}

function uploadDataToServer() {
    if (upload.isInProg()) {
        upload.sayWait();
        return;
    }
    upload.set();

    var u = user.get();
    if (u === null) {
        user.sayErr();
        upload.unset();
        return;
    }

    var allForms = getAllFormsData();

    function onErr(err) {
        upload.sayFail(err);
        upload.unset();
    }

    function onOkUpload(ans) {
        ans = JSON.parse(ans);
        upload.sayOk();
        upload.unset();
    }

    function onOkWhichForms(ans) {
        ans = JSON.parse(ans);
        if (ans.error) {
            msger.err(ans.error);
            return;
        }
        console.debug('server needs:', ans.ok);
        var filtered = filterOutForms(allForms, ans.ok);
        post(u, filtered, CMD_FORM_DATA, onOkUpload, onErr);
    }

    var whichForms = whichFormsToUpload(allForms);
    post(u, whichForms, CMD_FORM_WHICH_TO_UPLOAD, onOkWhichForms, onErr);
}

// --------------------------------------------------

myApp.onPageInit('form0', function (page) {
    $$('#roosta').change(function (e) {
        var visitId = $$(e.target).data('visitid');
        visitList[visitId] = e.target.value;
        saveVisitList()
    });
    $$('#receiveDataFromGPSButton').click(function (e) {
        // onSuccess Callback
        // This method accepts a Position object, which contains the
        // current GPS coordinates
        //
        var onGeoSuccess = function (position) {
            $$('#latitude').val(position.coords.latitude);
            $$('#longitude').val(position.coords.longitude)
            //    'Accuracy: '          + position.coords.accuracy          + '\n' +
            //    'Timestamp: '         + position.timestamp                + '\n')
        };

        // onError Callback receives a PositionError object
        //
        function onGeoError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n')
        }

        // myVar = setTimeout(alertFunc, 3000);

        $$('#latitude').val('در حال دریافت');
        navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError)
    })
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {

});

myApp.onPageInit('index', function (page) {
    populateVisitList();
    $$('#addVisitButton').click(addVisitButtonClicked);
    $$('#uploadDataButton').click(uploadDataToServer);
    // var i = 0,
    //     oJson = {},
    //     sKey;
    // for (; sKey = window.localStorage.key(i); i++) {
    //     oJson[sKey] = window.localStorage.getItem(sKey)
    // }
});

// myApp.onPageInit('formlist', function (page) {
//     // populateFormList()
// });


Object.keys(Template7.global.formList).forEach(function (a0, a1, a2) {
    Template7.global.formList[a0].forEach(function (formInfo, a4, a5) {
        myApp.onPageInit('form' + formInfo.id, function (page) {
            setTimeout(initSaveForm, WORKAROUND_TIMEOUT);
        });
    });
});

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {

    // Get page data from event data
    // var page = e.detail.page;
    // if (page.name === 'index') {
    //     // Following code will be executed for page with data-page attribute equal to "about"
    //     // myApp.alert('Here comes About page');
    // }
});

// // Option 2. Using live 'pageInit' event handlers for each page
// $$(document).on('pageInit', '.page[data-page="about"]', function (e) {
//     // Following code will be executed for page with data-page attribute equal to "about"
//     // myApp.alert('Here comes About page');
// });

myApp.init();
