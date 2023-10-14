document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    let dataArray = [];

    const BASE_URL = 'http://localhost'
    const SERVER_PORT = 3000;
    const SERVER_URL = 'https://reviews-hybrid-app.onrender.com'
    const CREATE_REVIEW_EP = SERVER_URL + "/review"
    const GET_REVIEWS_EP = SERVER_URL + "/reviews"
    const DELETE_REVIEW_EP = SERVER_URL + "/review"


    $("#btnReview").on("click", loadReviewData);
    $("#btnCamera").on("click", takePhoto);
    $("#btnUpdateLocation").on("click", updateLocation);
    $("#btnSaveReview").on("click", postReview);
    $("#btnReview").on("click", onReviewPageLoad);
    $("#tblReviews").on("click", ".btnDeleteReview", deleteReview);
    $("#btnPlaces").on("click", viewReviews);
    $("#btnOpenBrowser").on("click", openBrowser);

    

    function takePhoto() {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            targetWidth: 300,
            targetHeight: 400,
            saveToPhotoAlbum: true
        };

        navigator.camera.getPicture(onSuccess, onFail, options);
    }

    function onSuccess(imageURI) {
        var imageContainer = document.getElementById("photo");

        var imageElement = document.createElement("img");
        var image = "data:image/jpeg;base64," + imageURI;
        localStorage.setItem("cameraData", image);
        imageElement.id = 'capturedPhoto';
        imageElement.src = image;

        // Append the img element to the container
        imageContainer.innerHTML = "";
        imageContainer.appendChild(imageElement);
    }

    function onFail(message) {
        alert("Failed because: " + message);
    }

    function postApi(url, onSuccessFunc, data) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': SERVER_URL,
                'origin': SERVER_URL
            },
            body: data
        })
            .then(response => response.json())
            .then(data => onSuccessFunc(data))
            .catch(error => console.error('Error:', error));
    }

    function clearCache() {
        $('#txtName').val('');
        $('#txtPlace').val('');
        $('#txtReview').val('');
        $('#capturedPhoto').remove();
        localStorage.removeItem("cameraData");
    }

    function updatePosition(position) {
        // Convert timestamp to Date object
        var date = new Date(position.timestamp);

        // Format the time as HH:MM:SS
        var hours = date.getHours().toString().padStart(2, '0');
        var minutes = date.getMinutes().toString().padStart(2, '0');
        var seconds = date.getSeconds().toString().padStart(2, '0');

        // Display the converted time
        var time = hours + ':' + minutes + ':' + seconds;
        $('#txtCoordinates').val(
            'Latitude: ' + position.coords.latitude + '\n' +
            'Longitude: ' + position.coords.longitude + '\n' +
            'Altitude: ' + position.coords.altitude + '\n' +
            'Accuracy: ' + position.coords.accuracy + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
            'Heading: ' + position.coords.heading + '\n' +
            'Speed: ' + position.coords.speed + '\n' +
            'Timestamp: ' + time + '\n'
        );
        let pos = {
            "latitude": position.coords.latitude,
            "longitude": position.coords.longitude,
            "altitude": position.coords.altitude
        };
        localStorage.setItem("coordinates", JSON.stringify(pos));

        // auto resize
        $("#txtCoordinates")[0].style.height = 'auto';
        $("#txtCoordinates")[0].style.height = ($("#txtCoordinates")[0].scrollHeight) + 'px';

        console.log('Reading the geo-location was succesfull');
    }

    function display(tableName, reviews) {
        var tableBody = $('#' + tableName + ' tbody');
        tableBody.empty();
        reviews.forEach(function (reviewJson) {
            var newRow = $('<tr data=\"' + reviewJson.personName + '|' + reviewJson.location + '\">');
            newRow.append('<td><b class="ui-table-cell-label">Photo</b><img style=\"height:50%;width:30%;\" src=\"' + reviewJson.photo + '\"></td>');
            newRow.append('<td><b class="ui-table-cell-label">Name</b>' + reviewJson.personName + '</td>');
            newRow.append('<td><b class="ui-table-cell-label">Place</b>' + reviewJson.location + '</td>');
            newRow.append('<td><b class="ui-table-cell-label">Comment</b>' + reviewJson.review + '</td>');
            newRow.append('<td><button class=\"btnDeleteReview\">Delete</button></td>');

            tableBody.append(newRow);
        });

        activateTable(reviews, tableName);
    }

    function activateTable(reviews, tableName) {
        if (reviews.length > 0) {
            $('#noReviews').hide();
            $('#' + tableName).show();
        }
        else {
            $('#noReviews').show();
            $('#' + tableName).hide();
        }
    }

    function loadReviewData() {
        $('#txtName').val(localStorage.getItem("personName"));
        navigator.geolocation.getCurrentPosition(updatePosition);
    }

    function updateLocation() {
        navigator.geolocation.getCurrentPosition(updatePosition);
    }

    function onReviewPageLoad() {
        screen.orientation.onchange = takePhoto;
    }

    function viewReviews() {        
        var localData = JSON.parse(localStorage.getItem("localReviews"));
        if(localData && localData.length > 0)
            display('tblReviews',localData);

        $.ajax({
            url: GET_REVIEWS_EP, 
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin': SERVER_URL,
                'origin': SERVER_URL
            },
            success: function (data) {
                localStorage.setItem("localReviews", JSON.stringify(data));
                if(!localData || data.length != localData.length)
                    display('tblReviews', data);
            }});
    }

    // Handle the "Delete Cloud Data" button click
    function deleteReview() {
        var tableRow = $(this).parent().parent();
        var values = tableRow.attr("data").toString().split('|');
        var reviewJson = {
            "personName": values[0],
            "location": values[1]
        };
        // code to delete cloud data here
        $.ajax({
            url: DELETE_REVIEW_EP,
            type: "DELETE",
            contentType: 'application/json',
            data: JSON.stringify(reviewJson),
            headers: {
                'Access-Control-Allow-Origin': SERVER_URL,
                'origin': SERVER_URL
            },
            success: function () {
                localStorage.removeItem('localReviews');
                viewReviews()
                console.log("Review by " + values[0] + " deleted.");
            },
            error: function () {
                console.log("Review by " + values[0] + " delete failed.");
            }
        });

    }

    function postReview() {
        var personName = $('#txtName').val();
        var location = $('#txtPlace').val();
        var review = $('#txtReview').val();
        var coordinates = JSON.parse(localStorage.getItem("coordinates"));
        var image = localStorage.getItem("cameraData");

        localStorage.setItem("personName", personName);

        var formData = new FormData();
        var data = {
            "personName": personName,
            "location": location,
            "coordinates": {
                "latitude": coordinates.latitude,
                "altitude": coordinates.altitude,
                "longitude": coordinates.longitude
            },
            "photo": image,
            "review": review
        }
        formData.append("jsonData", JSON.stringify(data));

        postApi(CREATE_REVIEW_EP, function (d) {
            console.log('Created a review');
            window.location.href = '#home';

            // clear text boxes
            clearCache();
            screen.orientation.onchange = function(){};
        }, formData);

    }

    function openBrowser(e) {
        var url = 'https://www.yelp.com/search?cflt=parks&find_loc=Brisbane+Queensland';
        // Options for the in-app browser
        var options = 'location=yes,hidden=no,clearcache=no,clearsessioncache=no';

        var ref = cordova.InAppBrowser.open(url, '_blank', options);
        ref.addEventListener('loadstart', function (event) {
            console.log('In-App Browser started loading: ' + event.url);
        });

        ref.addEventListener('loadstop', function (event) {
            console.log('In-App Browser finished loading: ' + event.url);
        });

        ref.addEventListener('exit', function (event) {
            console.log('In-App Browser closed');
        });

    }

} //end onDeviceReady
