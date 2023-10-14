document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    let dataArray = [];

    const baseURL = 'http://localhost'
    const serverPort = 3000;
    const clientPort = 8000;


    document.getElementById("btn").addEventListener("click", takePhoto);

    function takePhoto() {
      var options = {
        quality: 80,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        cameraDirection: Camera.Direction.BACK,
        targetWidth: 300,
        targetHeight: 400,
        allowEdit: true,
        correctOrientation: true,
      };
    
      navigator.camera.getPicture(onSuccess, onFail, options);
    }
    
    function onSuccess(imageURI) {
      var imageContainer = document.getElementById("photo");
    
      var imageElement = document.createElement("img");
      imageElement.src = "data:image/jpeg;base64," + imageURI;
    
      // Append the img element to the container
      imageContainer.innerHTML = "";
      imageContainer.appendChild(imageElement);
    }
    
    function onFail(message) {
      alert("Failed because: " + message);
    }

//camera function
/* let app={
    init: function(){
        document.getElementById('btn').addEventListener('click', app.takephoto);
    },
    takephoto: function(){
        let opts = {
            quality: 80,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            mediaType: Camera.MediaType.PICTURE,
            sncodingType: Camera.EncodingType.JPEG,
            cameraDirection: Camera.Direction.BACK,
            targetWidth: 300,
            targetHeight: 400
        };
        navigator.camera.getPicture(app.succ, app.failP, opts);
    },
    succ: function(imgURI){
        document.getElementById('msg').textContent = imgURI;
        document.getElementById('photo').src = imgURI;
    },
    failP: function(msg){
        document.getElementById('msg').textContent = msg;
    }
  };*/


 // Handle the "Delete Local Data" button click
 $("#deleteLData").on("click", function () {
  // code to delete local data here
  localStorage.clear();
  dataArray = [];
  // alert("Local data deleted!");
  $("#adminMenu").popup("close");
});

// Handle the "Delete Cloud Data" button click
$("#deleteCData").on("click", function () {
  // code to delete cloud data here
  $.ajax({
      url: baseURL + ":" + serverPort + "/delData",
      type: "DELETE",
      success: function () {
          $("#adminMenu").popup("close");
      },
      error: function () {
          $("#adminMenu").popup("close");
      }
  });

});

function display(tableName, placeData) {
    var tableBody = $('#' + tableName + ' tbody');
    tableBody.empty();
    booksData.forEach(function (place) {
        var newRow = $('<tr>');
        newRow.append('<td><b class="ui-table-cell-label">Photo</b><img style=\"height:50%;width:30%;\" src=\"img/' + place.a  + '\"></td>');
        newRow.append('<td><b class="ui-table-cell-label">Name</b>' + book.bookID + '</td>');
        newRow.append('<td><b class="ui-table-cell-label">Place</b>' + book.bookName + '</td>');
        newRow.append('<td><b class="ui-table-cell-label">Comment</b>' + book.author + '</td>');
      
        tableBody.append(newRow);
    });
}





$("#openBrowserButton").on("click",function(e){
  var url = 'https://www.yelp.com/search?cflt=parks&find_loc=Brisbane+Queensland';
 // Options for the in-app browser
 var options = 'location=yes,hidden=no,clearcache=no,clearsessioncache=no';

 var ref = cordova.InAppBrowser.open(url, '_blank', options);
//      var ref = cordova.InAppBrowser.open(url, '_system', options);
 ref.addEventListener('loadstart', function(event) {
     console.log('In-App Browser started loading: ' + event.url);
 });

 ref.addEventListener('loadstop', function(event) {
     console.log('In-App Browser finished loading: ' + event.url);
 });

 ref.addEventListener('exit', function(event) {
     console.log('In-App Browser closed');
 });

});



}//end onDeviceReady
 