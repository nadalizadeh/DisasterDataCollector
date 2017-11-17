// Initialize app
var myApp = new Framework7({
  template7Pages: true, // enable Template7 rendering for Ajax and Dynamic pages
  init: false, // prevent app from automatic initialization
  template7Data: {
  }
})

Template7.global = {
  'name': 'Ali',
  formList: [
    {id: 11, formid: '1-1', caption: 'اجتماعی - اسکان'},
    {id: 12, formid: '1-2', caption: 'اجتماعی - سلامت و جمعیت'},
    {id: 13, formid: '1-3', caption: 'اجتماعی - آموزش'},
    {id: 14, formid: '1-4', caption: 'اجتماعی - مواد غذایی'}
  ]
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
  addVisit('visit-' + (visitList.length + 1))
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

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function () {
  console.log("Device is ready!")

  // onSuccess Callback
  // This method accepts a Position object, which contains the
  // current GPS coordinates
  //
  var onGeoSuccess = function (position) {
    // var element = document.getElementById('latbtn');
    // element.innerHTML = 'HEllo';

    $$('#latbtn').html(position.coords.latitude)
    $$('#lngbtn').html(position.coords.longitude)
    //position.coords.latitude
    /*    alert('Latitude: '          + position.coords.latitude          + '\n' +
    'Longitude: '         + position.coords.longitude         + '\n' +
    'Altitude: '          + position.coords.altitude          + '\n' +
    'Accuracy: '          + position.coords.accuracy          + '\n' +
    'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
    'Heading: '           + position.coords.heading           + '\n' +
    'Speed: '             + position.coords.speed             + '\n' +
    'Timestamp: '         + position.timestamp                + '\n')
    */
  };

  // onError Callback receives a PositionError object
  //
  function onGeoError(error) {
    alert('code: '    + error.code    + '\n' +
    'message: ' + error.message + '\n')
  }

  // myVar = setTimeout(alertFunc, 3000);

  navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError)

})

// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('index', function (page) {
  // Do something here for "about" page
  populateVisitList()
  $$('#addVisitButton').click(addVisitButtonClicked)
})

myApp.onPageInit('formlist', function (page) {
  // Do something here for "about" page
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
