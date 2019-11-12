$(document).ready(function() {
    console.log("1");

    // process the form
    $('form').submit(function(event) {
        console.log("2");

        // get the form data
        // there are many ways to get this data using jQuery (you can use the class or id also)
        var formData = {
            'name': $('input[name=name]').val(),
            'email': $('input[name=email]').val(),
            'superheroAlias': $('input[name=superheroAlias]').val()
        };

        // process the form
        $.ajax({
            url: 'http://localhost:3000/auth', //  RASA API
            type: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },

            success: function(data, textStatus, xhr) {
                console.log("3");
                console.log(data);
                window.open('http://localhost:3000/home');
            }
        });
    });

});