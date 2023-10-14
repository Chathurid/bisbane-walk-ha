document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    let dataArray = [];

    const baseURL = 'http://localhost'
    const serverPort = 3000;
    const clientPort = 8000;

    const createReviewEp = baseURL + ":" + serverPort + "/review"
    const getReviewsEp = baseURL + ":" + serverPort + "/reviews"
    const deleteReviewEp = baseURL + ":" + serverPort + "/review"


    $("#btnReview").on("click", loadReviewData);
    $("#btnCamera").on("click", takePhoto);
    $("#btnUpdateLocation").on("click", updateLocation);
    $("#btnSaveReview").on("click", postReview);
    $("#btnOpenBrowser").on("click", openBrowser);


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
        fetch(url,{
            method: 'POST',
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
            newRow.append('<td><b class="ui-table-cell-label">Photo</b><img style=\"height:50%;width:30%;\" src=\"img/' + place.a + '\"></td>');
            newRow.append('<td><b class="ui-table-cell-label">Name</b>' + book.bookID + '</td>');
            newRow.append('<td><b class="ui-table-cell-label">Place</b>' + book.bookName + '</td>');
            newRow.append('<td><b class="ui-table-cell-label">Comment</b>' + book.author + '</td>');

            tableBody.append(newRow);
        });
    }

    function loadReviewData() {
        $('#txtName').val(localStorage.getItem("personName"));
        navigator.geolocation.getCurrentPosition(updatePosition);
    }

    function updateLocation() {
        navigator.geolocation.getCurrentPosition(updatePosition);
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

        postApi(createReviewEp, function (d) {
            console.log('Created a review');
        }, formData);

        // clear text boxes
        clearCache();
        window.location.href = '#home';
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
