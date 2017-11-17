// Initialize app
var myApp = new Framework7({
  template7Pages: true, // enable Template7 rendering for Ajax and Dynamic pages
  init: false, // prevent app from automatic initialization
  template7Data: {
  }
})

Template7.global = {
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
    'تولیدی': [
      {id: 21, formId: '2-1', caption: 'کشاورزی'},
      {id: 22, formId: '2-2', caption: 'حق آبه ها'},
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
}

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7

// Add view
var mainView = myApp.addView('.view-main', {
  // Because we want to use dynamic navbar, we need to enable it for this view:
  dynamicNavbar: true
})

var visitList = []

function saveVisitList () {
  window.localStorage.setItem('visitList', JSON.stringify(visitList))
}

function getVisitList () {
  var visitListStr = window.localStorage.getItem('visitList')
  if (visitListStr === undefined || visitListStr == null) {
    visitList = []
  } else {
    try {
      visitList = JSON.parse(visitListStr)
    } catch (err) {
      console.log(err)
      visitList = []
    }
  }
  // alert('list: ' + JSON.stringify(visitList))
  return visitList
}

function addVisit (visitName) {
  visitList.push(visitName)
  saveVisitList()
}

function addVisitButtonClicked () {
  addVisit('بازدید ' + (visitList.length + 1))
  populateVisitList()
}

function getHTMLForVisit (id, visitName) {
  return '<li><a href="formlist.html?visitId=' + id + '" data-context=\'{"visitId": ' + id + ', "visitName": "' + visitName + '"}\' class="item-link item-content">' +
            '<div class="item-inner">' +
              '<div class="item-title">' + visitName + '</div>' +
            '</div></a></li>'
}

function populateVisitList () {
  // window.localStorage.clear()
  getVisitList()
  var thehtml = ''
  for (var i = 0; i < visitList.length; i++) {
    thehtml += getHTMLForVisit(i, visitList[i])
  }
  $$('#visit-listblock > ul').html(thehtml)
}

// --------------------------------------------------
myApp.onPageInit('form0', function (page) {
  $$('#roosta').change(function (e) {
    var visitId = $$(e.target).data('visitid')
    visitList[visitId] = e.target.value
    saveVisitList()
  })
  $$('#receiveDataFromGPSButton').click(function (e) {
    // onSuccess Callback
    // This method accepts a Position object, which contains the
    // current GPS coordinates
    //
    var onGeoSuccess = function (position) {
      $$('#latitude').val(position.coords.latitude)
      $$('#longitude').val(position.coords.longitude)
  //    'Accuracy: '          + position.coords.accuracy          + '\n' +
  //    'Timestamp: '         + position.timestamp                + '\n')
    }

    // onError Callback receives a PositionError object
    //
    function onGeoError (error) {
      alert('code: ' + error.code + '\n' +
      'message: ' + error.message + '\n')
    }

    // myVar = setTimeout(alertFunc, 3000);

    $$('#latitude').val('در حال دریافت')
    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError)
  })
})


// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {

})

// TODO: incomplete
function uploadDataToServer () {
//for (var visitId = 0; visitId < visitList.length; visitId++)
    visitId = 0
    {
    var reqData = {
      userId: 'gholi',
      visitId: visitId,
      visitName: visitList[visitId],
      details: {
        // Will be filled with the following logic
      }
    }

    Object.keys(Template7.global.formList).forEach(function (currentValue, catIndex, arr) {
      Template7.global.formList[currentValue].forEach(function (formInfo, index2, arr) {
        var formName = 'V' + visitId + '-form' + formInfo.id
        var m = myApp.formGetData(formName)
        if (m !== undefined) {
          console.log('Form: ' + formName + ' -> ' + m)
          reqData.details[formInfo.formId] = myApp.formGetData(formName)
        }
      })
    })

    console.log('X')
    $$.ajax({
      contentType: 'application/json',
      data: JSON.stringify(reqData),
      dataType: 'raw',
      success: function (data) {
          console.log('Data received : ' + data)
      },
      error: function (xmlhttp, err) {
          console.log('Ajax req failed ' + err)
      },
      processData: false,
      type: 'POST',
      url: 'http://192.168.1.16/disaster/pushdata.php'
    })
  }
}

myApp.onPageInit('index', function (page) {
  populateVisitList()
  $$('#addVisitButton').click(addVisitButtonClicked)
  $$('#uploadDataButton').click(uploadDataToServer)

  var i = 0,
      oJson = {},
      sKey;
  for (; sKey = window.localStorage.key(i); i++) {
      oJson[sKey] = window.localStorage.getItem(sKey)
  }
  console.log(oJson)
})

myApp.onPageInit('formlist', function (page) {
  // populateFormList()
})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
  // Get page data from event data
  var page = e.detail.page

  if (page.name === 'index') {
    // Following code will be executed for page with data-page attribute equal to "about"
    // myApp.alert('Here comes About page');
  }
})

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
  // Following code will be executed for page with data-page attribute equal to "about"
  // myApp.alert('Here comes About page');
})

myApp.init()
