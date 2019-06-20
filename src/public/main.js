const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Y2YzMzZmMWY2NGUxNjAwMTcwNjJmYmEiLCJpYXQiOjE1NjEwNjkxNTYsImV4cCI6MTU2MTA2OTQ1Nn0.q4MZOrT7iCq2hO6S6l1Aaa1eISIp6FGwH-_55IIxQAo';

const form = document.querySelector('#form-avatar');
const input = document.querySelector('#img-file');

input.addEventListener('change', function(e) {
    console.log(e.target.files);
})

form.addEventListener('submit', function(e) {
    console.log('Starting to send image');
    e.preventDefault();
    let formData = new FormData();
    formData.append("avatar", input.files[0]);

    $.ajax({
        async: true,
        crossDomain: true,
        url: 'https://hc-basic-login.herokuapp.com/users/me/avatar',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
        headers: {
            'Authorization': 'Bearer '+ TOKEN
        },
        success: function(data, textStatus) {
            console.log(data, textStatus);
        },
        error: function(e) {
            console.log(e);
        }
    });


    // var form = new FormData();
    // form.append("avatar", input.files[0]);
    
    // var settings = {
    //   "async": true,
    //   "crossDomain": true,
    //   "url": "http://localhost:3001/users/me/avatar",
    //   "method": "POST",
    //   "headers": {
    //     "Authorization": "Bearer " + TOKEN,
    //   },
    //   success: function(data) {
    //     console.log(data)
    //   },
    //   error: function(e) {
    //     console.log(e)
    //   },
    //   "processData": false,
    //   "contentType": false,
    //   "mimeType": "multipart/form-data",
    //   "data": form
    // }
    
    // $.ajax(settings).done(function (response) {
    //   console.log(response);
    // });
});