$(document).ready(function() {
    var socket = io();
    var date = new Date();
    var hour = date.getHours();
    var minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

    //Widget Code
    var bot = '<div class="chatCont" id="chatCont">' +
        '<div class="bot_profile">' +
        '<img src="../img/airbus.png" class="bot_p_img">' +
        '<div class="close">' +
        '<i class="fa fa-times" aria-hidden="true"></i>' +
        '</div>' +
        '</div><!--bot_profile end-->' +
        '<div id="result_div" class="resultDiv"></div>' +
        '<div class="chatForm" id="chat-div">' +
        '<div class="spinner">' +
        '<div class="bounce1"></div>' +
        '<div class="bounce2"></div>' +
        '<div class="bounce3"></div>' +
        '</div>' +
        '<input type="text" id="chat-input" autocomplete="off" placeholder="Escriba aquí..."' + 'class="form-control bot-txt"/>' +
        '</div>' +
        '</div><!--chatCont end-->' +

        '<div class="profile_div">' +
        '<div class="row">' +
        '<div class="col-hgt col-sm-offset-2">' +
        '<img src="../img/airbus.png" class="img-circle img-profile">' +
        '</div><!--col-hgt end-->' +
        '<div class="col-hgt">' +
        '<div class="chat-txt">' +
        '' +
        '</div>' +
        '</div><!--col-hgt end-->' +
        '</div><!--row end-->' +
        '</div><!--profile_div end-->';

    $("mybot").html(bot);

    // ------------------------------------------ Toggle chatbot -----------------------------------------------
    //function to click and open chatbot from icon
    $('.profile_div').click(function() {
        $('.profile_div').toggle();
        $('.chatCont').toggle();
        $('.bot_profile').toggle();
        $('.chatForm').toggle();
        document.getElementById('chat-input').focus();
        var UserResponse = '<p class="botResult">' + '¡Hola!. Hablas con Atenea. Pregúntame por incidencias. Toda la información a tu disposición' + '</p><div class="clearfix"></div>';
        var timeAnswer = '<p class="timeAnswer">' + hour + ':' + minutes + '</p><div class="clearfix"></div>';

        $(UserResponse).appendTo('#result_div');
        $(timeAnswer).appendTo('#result_div');
    });

    //function to click and close chatbot to icon
    $('.close').click(function() {
        $('.profile_div').toggle();
        $('.chatCont').toggle();
        $('.bot_profile').toggle();
        $('.chatForm').toggle();
    });




    // on input/text enter--------------------------------------------------------------------------------------

    var remember = "";

    $('#chat-input').on('keyup keypress', function(e) {
        var keyCode = e.keyCode || e.which;
        var text = $("#chat-input").val();
        if (e.keyCode === 38) {
            if (remember !== "") {
                $("#chat-input").val(remember);
                e.preventDefault();
                $("#chat-input").focus();
                return false;
            }
        }
        if (keyCode === 13) {
            if (text == "" || $.trim(text) == '') {
                e.preventDefault();
                $("#chat-input").focus();
                return false;
            } else {
                remember = $("#chat-input").val()
                $("#chat-input").blur();
                setUserResponse(text);
                send(text);
                //send2(text);
                e.preventDefault();
                $("#chat-input").focus();
                return false;
            }
        }
    });


    //------------------------------------------- Call the RASA API--------------------------------------
    function send(text) {
        var ajax1 = $.ajax({
            url: 'http://172.18.64.105:5005/webhooks/rest/webhook', //  RASA API
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                "sender": "user",
                "message": text
            }),
            success: function(data, textStatus, xhr) {

                console.log("Pregunta: " + text)
                console.log("Respuesta: ")
                for (var i = 0; i <= data.length - 1; i++) {
                    console.log(data[i].text);
                    console.log("--------------------------------------");
                }
                /*
                socket.emit('preguntaRespuesta', data, function(preguntaRespuesta) {
                    console.log("funcion hecha");
                });
                */
                /*
				// grab the content of the form field and place it into a variable
			    var textToWrite = "\nInput: "+text +"\nResponse: "+data[0].text;
				//  create a new Blob (html5 magic) that conatins the data from your form feild
			    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
				// Specify the name of the file to be saved
			    var fileNameToSaveAs = "myNewFile.txt";
			    
				// Optionally allow the user to choose a file name by providing 
				// an imput field in the HTML and using the collected data here
				// var fileNameToSaveAs = txtFileName.text;
			 
				// create a link for our script to 'click'
			    var downloadLink = document.createElement("a");
				//  supply the name of the file (from the var above).
				// you could create the name here but using a var
				// allows more flexability later.
			    downloadLink.download = fileNameToSaveAs;
				// provide text for the link. This will be hidden so you
				// can actually use anything you want.
			    downloadLink.innerHTML = "My Hidden Link";
			    
				// allow our code to work in webkit & Gecko based browsers
				// without the need for a if / else block.
			    window.URL = window.URL || window.webkitURL;
			          
				// Create the link Object.
			    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
				// when link is clicked call a function to remove it from
				// the DOM in case user wants to save a second file.
			    downloadLink.onclick = destroyClickedElement;
				// make sure the link is hidden.
			    downloadLink.style.display = "none";
				// add the link to the DOM
			    document.body.appendChild(downloadLink);
			    
				// click the new link
			    downloadLink.click();

			    function destroyClickedElement(event)
				{
				// remove the link from the DOM
				    document.body.removeChild(event.target);
				}
				*/

                if (Object.keys(data).length !== 0) {
                    for (i = 0; i < Object.keys(data[0]).length; i++) {
                        if (Object.keys(data[0])[i] == "buttons") { //check if buttons(suggestions) are present.
                            addSuggestion(data[0]["buttons"])
                        }

                    }
                }
                //var prueba = '<p><span>prueba</span></p>';
                //$(prueba).appendTo('#prueba');
                setBotResponse(data);

            },
            error: function(xhr, textStatus, errorThrown) {
                console.log('Error in Operation');
                setBotResponse('error');
            }
        });

        var ajax2 = $.ajax({
            url: 'http://172.18.64.105:5005/model/parse', //  RASA API
            type: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            data: JSON.stringify({
                "text": text
            }),
            success: function(data, textStatus, xhr) {

                console.log("Nombre intent: " + data.intent.name); //Nombre del intent introducido
                console.log("Porcentaje reconocido: " + data.intent.confidence); //Porcentaje de intent reconocido
                console.log("-------------------------------------------")
                for (var i = 0; i <= data.entities.length - 1; i++) {
                    console.log("Entidad: " + data.entities[i].entity); //Nombre de la entity
                    console.log("con valor: " + data.entities[i].value); //Valor de la entity
                    console.log("porcentaje reconocido: " + data.entities[i].confidence); //Porcentaje al reconocer entity
                    console.log("--------------------------------------")
                }
                /*
                socket.emit('preguntaRespuesta2', data, function(preguntaRespuesta2) {
                    console.log("funcion2 hecha");
                });
                */
                setBotResponse(data);

            },
            error: function(xhr, textStatus, errorThrown) {
                console.log('Error in Operation');
                setBotResponse('error');
            }
        });

        $.when(ajax1, ajax2).done(function(a1, a2) {
            // a1 and a2 are arguments resolved for the page1 and page2 ajax requests, respectively.
            // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
            var intent = a2[0].text;
            var intentPorcent = a2[0].intent.confidence;
            var entities = "";
            var entitiesFinal = "";
            var user_input = "";

            var data = [];

            user_input = intent;
            intent = a2[0].intent.name;

            data[0] = user_input;
            data[1] = intent;
            data[2] = intentPorcent;
            data[21] = sessionStorage.getItem('username');
            data[3] = "";
            data[4] = "";
            data[5] = "";
            data[6] = "";
            data[7] = "";
            data[8] = "";
            data[9] = "";
            data[10] = "";
            data[11] = "";
            data[12] = "";
            data[13] = "";
            data[14] = "";
            data[15] = "";
            data[16] = "";
            data[17] = "";
            data[18] = "";
            data[19] = "";
            data[20] = "";

            x = 0;
            for (var i = 0; i <= a2[0].entities.length - 1; i++) {
                entity = a2[0].entities[i].entity;
                entity_value = a2[0].entities[i].value;
                entity_percent = a2[0].entities[i].confidence;
                data[3 + x] = entity;
                x += 1;
                data[3 + x] = entity_value;
                x += 1;
                data[3 + x] = entity_percent;
                x += 1;
            }

            socket.emit('preguntaRespuesta', data, function(preguntaRespuesta) {
                console.log("Datos guardos en la base de datos");
            });
        });

    }
    /*
        function send2(text) {
            var ajax2 = $.ajax({
                url: 'http://172.18.64.105:5005/model/parse', //  RASA API
                type: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                data: JSON.stringify({
                    "text": text
                }),
                success: function(data, textStatus, xhr) {
                    //console.log(data);
                    //console.log(data.intent);
                    //console.log(data.entities);

                    console.log("Nombre intent: " + data.intent.name); //Nombre del intent introducido
                    console.log("Porcentaje reconocido: " + data.intent.confidence); //Porcentaje de intent reconocido
                    console.log("-------------------------------------------")
                    for (var i = 0; i <= data.entities.length - 1; i++) {
                        console.log("Entidad: " + data.entities[i].entity); //Nombre de la entity
                        console.log("con valor: " + data.entities[i].value); //Valor de la entity
                        console.log("porcentaje reconocido: " + data.entities[i].confidence); //Porcentaje al reconocer entity
                        console.log("--------------------------------------")
                    }

                    socket.emit('preguntaRespuesta2', data, function(preguntaRespuesta2) {
                        console.log("funcion2 hecha");
                    });

                    setBotResponse(data);

                },
                error: function(xhr, textStatus, errorThrown) {
                    console.log('Error in Operation');
                    setBotResponse('error');
                }
            });

        }

        $.when(ajax1, ajax2).done(function(a1, a2) {
            // a1 and a2 are arguments resolved for the page1 and page2 ajax requests, respectively.
            // Each argument is an array with the following structure: [ data, statusText, jqXHR ]
            console.log(ajax1);
            console.log(ajax2);
            var data = a1[0] + a2[0]; // a1[ 0 ] = "Whip", a2[ 0 ] = " It"
            console.log(data);
        });
    */
    //------------------------------------ Set bot response in result_div -------------------------------------
    function setBotResponse(val) {
        setTimeout(function() {
            var date = new Date();
            var hour = date.getHours();
            var minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

            if ($.trim(val) == '' || val == 'error') { //if there is no response from bot or there is some error
                val = '🙊';
                var BotResponse = '<p class="botResult" style="width:45px;">' + val + '</p><div class="clearfix"></div>';
                var timeAnswer = '<p class="timeAnswer">' + hour + ':' + minutes + '</p><div class="clearfix"></div>';
                $(BotResponse).appendTo('#result_div');
                $(timeAnswer).appendTo('#result_div');
            } else {

                //if we get message from the bot succesfully
                var msg = "";
                for (var i = 0; i < val.length; i++) {
                    if (val[i]["image"]) { //check if there are any images
                        msg += '<p class="botResult"><img  width="200" height="124" src="' + val[i].image + '/"></p><div class="clearfix"></div>';
                    } else {
                        msg += '<p class="botResult">' + val[i].text + '</p><div class="clearfix"></div>';
                        var timeAnswer = '<p class="timeAnswer">' + hour + ':' + minutes + '</p><div class="clearfix"></div>';
                    }

                }
                BotResponse = msg;
                $(BotResponse).appendTo('#result_div');
                $(timeAnswer).appendTo('#result_div');
            }
            scrollToBottomOfResults();
            hideSpinner();
        }, 500);
    }


    //------------------------------------- Set user response in result_div ------------------------------------
    function setUserResponse(val) {
        var date = new Date();
        var hour = date.getHours();
        var minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

        var UserResponse = '<p class="userEnteredText">' + val + '</p><div class="clearfix"></div>';
        var timeAsk = '<p class="timeAsk">' + hour + ':' + minutes + '</p><div class="clearfix"></div>';
        $(UserResponse).appendTo('#result_div');
        $(timeAsk).appendTo('#result_div');
        $("#chat-input").val('');
        scrollToBottomOfResults();
        showSpinner();
        $('.suggestion').remove();
    }


    //---------------------------------- Scroll to the bottom of the results div -------------------------------
    function scrollToBottomOfResults() {
        var terminalResultsDiv = document.getElementById('result_div');
        terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
    }


    //---------------------------------------- Spinner ---------------------------------------------------
    function showSpinner() {
        $('.spinner').show();
    }

    function hideSpinner() {
        $('.spinner').hide();
    }




    //------------------------------------------- Buttons(suggestions)--------------------------------------------------
    function addSuggestion(textToAdd) {
        setTimeout(function() {
            var suggestions = textToAdd;
            var suggLength = textToAdd.length;
            $('<p class="suggestion"></p>').appendTo('#result_div');
            // Loop through suggestions
            for (i = 0; i < suggLength; i++) {
                $('<span class="sugg-options">' + suggestions[i].title + '</span>').appendTo('.suggestion');
            }
            scrollToBottomOfResults();
        }, 1000);
    }


    // on click of suggestions get value and send to API.AI
    $(document).on("click", ".suggestion span", function() {
        var text = this.innerText;
        setUserResponse(text);
        send(text);
        $('.suggestion').remove();
    });
    // Suggestions end -----------------------------------------------------------------------------------------


});