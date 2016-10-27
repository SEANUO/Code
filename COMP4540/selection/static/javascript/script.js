//Disable the dimmer.
$.fn.dimmer.settings.closable=false;
//Initial rating widget.
$('#rating-widget-integer').rating();
$('#reading-count-down').progress();
$('#experiment-progress').progress({showActivity: false});
$('#rating-widget-integer-radio')
.form({
    fields: {
        rating: {
            identifier: 'rating-field'
        }
    }
});
// slider Helper.
var sliderHelper=0;
$('#rating-widget-slider').range({
    min:0,
    max:100,
    start:50,
    onChange: function(val) {sliderHelper=val;}
});

var supportedWidgets=["rating-widget-boolean",
                      "rating-widget-boolean-group",
                      "rating-widget-integer-radio",
                      "rating-widget-integer",
                      "rating-widget-slider"];
var testIndex;
var testDownloadedImages=[];
var testResult=[];
var csrftoken;
var uid;
var startTime;
var pressNextTime;

function updateProgress() {
    var currentValue=$('#reading-count-down').progress('get value');
    var totalValue=$('#reading-count-down').progress('get total');
    if(totalValue==currentValue) {
    // if(true) {
        if(testList[testIndex]==1 ||
           testList[testIndex]==2 ||
           testList[testIndex]==3) {
               document.getElementById("next-image").classList.add('disabled');
           }
        $('#reading-count-down').transition({
            animation : 'fade left',
            onComplete : function() {
                $('#hint-text').transition('fade left');
                if(testList[testIndex]==2 ||
                   testList[testIndex]==3 ||
                   testList[testIndex]==4) {
                       var labelList=testLabel[testIndex];
                       document.getElementById('rating-label-left').innerHTML=labelList[0];
                       document.getElementById('rating-label-mid').innerHTML=labelList[1];
                       document.getElementById('rating-label-right').innerHTML=labelList[2];
                       $('#rating-label-row').transition('scale');
                   }
                $('#'+supportedWidgets[testList[testIndex]]).transition({
                    animation : 'fade right',
                    onComplete : function() {
                        $('#next-image').transition('fade down');
                        //Set the start time.
                        startTime=new Date();
                    }
                });
            }
        });
        return;
    }
    $('#reading-count-down').progress('increment');
    window.setTimeout(updateProgress, 1000);
}

var downloadedIndex=0;
var downloadedImage;
function onDownloadSuccess() {
    ++downloadedIndex;
    testDownloadedImages.push(downloadedImage);
    if(downloadedIndex==testImage.length) {
        console.log(testDownloadedImages);
        //Hide the dimmer.
        $('#instruction-dimmer').dimmer('hide');
        //Start test case.
        window.setTimeout(function(){
            setTestCases();
        }, 1000);
    } else {
        //Download next image.
        onDownloadNextImage();
    }
}

function onDownloadNextImage() {
    downloadedImage=new Image();
    downloadedImage.src=testImage[downloadedIndex];
    if(downloadedImage.complete) {
        onDownloadSuccess();
    }
    downloadedImage.onload=onDownloadSuccess;
}

function onStartClick() {
    $('#start-experiment').transition({
        animation : 'scale',
        onComplete : function(){
            //Start to load data.
            $('#start-loading').transition({
                animation:'scale',
                onComplete : onDownloadNextImage
            });
        }
    });
}

function enabledNext() {
    document.getElementById("next-image").classList.remove('disabled');
}

var globalTries=3;

function saveExpResult() {
    csrftoken = Cookies.get('csrftoken');
    $.ajax({
        type: 'POST',
        url: '/saveinitial',
        dataType: 'json',
        data : {csrfmiddlewaretoken: csrftoken,
                uid: uid,
                exp_result: JSON.stringify(testResult)},
        success: function(response) {
            $('#submit-uploading').transition('hide');
            $('#submit-generating').transition('show');
            $.ajax({
                type: 'POST',
                url: '/generateiteration',
                dataType: 'json',
                data : {csrfmiddlewaretoken: csrftoken,
                        uid: uid,
                        exp_result: JSON.stringify(testResult),
                        image_gene: JSON.stringify(imageGene),
                        iteration: -1},
                success: function(response) {
                        window.location.href="/multiple?uid="+response['uid']+"&iteration="+response['iteration'];
                }
            });
        },
        error: function(xhr, status, error) {
            if(globalTries>0) {
                globalTries = globalTries - 1;
                saveExpResult();
            } else {
                console.log("Error happens!");
            }
        }
    });
}

function getUtcTime(currentTime) {
    return Date.UTC(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds(), currentTime.getMilliseconds());
}

function onNextClick() {
    //Save the click time.
    pressNextTime=new Date();
    //Check the current value is valid or not.
    $('#obvserve-item').transition('fade down');
    $('#hint-text').transition('scale');
    $('#'+supportedWidgets[testList[testIndex]]).transition('scale');
    if(testList[testIndex]==2 ||
       testList[testIndex]==3 ||
       testList[testIndex]==4) {
           $('#rating-label-row').transition('fade down');
       }
    $('#next-image').transition({
        animation : 'fade up',
        onComplete : function() {
            //Prepare the score variables.
            var imageScore=0;
            //Check current index value.
            if(testList[testIndex]==0) {
                //Boolean widget.
                var targetWidget=document.getElementById("rating-widget-boolean");
                if(targetWidget.classList.contains("active")) {
                    imageScore=100;
                }
            }
            else if (testList[testIndex]==1) {
                //Boolean group.
                var targetWidget=document.getElementById("rating-group-button-like");
                if(targetWidget.classList.contains("green")) {
                    imageScore=100;
                }
            }
            else if(testList[testIndex]==2) {
                //Integer radio.
                var radioItems=document.getElementById('radio-field').children;
                for(var i=0; i<radioItems.length; ++i) {
                    var radioItem=radioItems[i].firstElementChild;
                    if($('#'+radioItem.getAttribute('id')).checkbox('is checked')) {
                        $('#'+radioItem.getAttribute('id')).checkbox('set unchecked');
                        imageScore=Math.ceil((i+1)/radioItems.length*100);
                        break;
                    }
                }
            }
            else if(testList[testIndex]==3){
                //Integer heart.
                imageScore=$("#rating-widget-integer").rating("get rating")*10;
            }
            else if(testList[testIndex]==4){
                //Slider.
                imageScore=sliderHelper;
            }
            var imageScoreItem={};
            imageScoreItem["image"]=testImage[testIndex];
            imageScoreItem["ui"]=testList[testIndex];
            imageScoreItem["score"]=imageScore;
            imageScoreItem["duration"]=getUtcTime(pressNextTime)-getUtcTime(startTime);
            testResult.push(imageScoreItem);

            //Increase the index.
            testIndex=testIndex+1;
            //Check the index.
            if(testIndex<testList.length) {
                //Increase the progress bar.
                $('#experiment-progress').progress('increment');
                //Reset the count down.
                $('#reading-count-down').progress('reset');
                //Start to view next image.
                startNewIteration();
            }
            else {
                //Increase the progress bar.
                $('#experiment-progress').progress('increment');
                // Show submit dimmer.
                $('#submit-dimmer').dimmer('show');
                //Reset the tries.
                globalTries=3;
                // Send the result.
                saveExpResult();
            }
        }
    });
}

function startNewIteration() {
    //Reset the widget.
    //  Boolean button.
    document.getElementById("rating-widget-boolean").classList.remove("active");
    //  Boolean button group.
    document.getElementById("rating-group-button-like").classList.remove("green");
    document.getElementById("rating-group-button-dislike").classList.remove("red");
    //  Integer.
    $("#rating-widget-integer").rating("set rating", 0);
    //  Slider.
    $('#rating-widget-slider').range("set value", 0);
    //Update the image src.
    document.getElementById("obvserve-item").src=testImage[testIndex];
    document.getElementById("hint-text").innerHTML=testHintText[testIndex];
    //Wait for one second, then launch the animation.
    //Start animations.
    $('#reading-count-down').transition('scale');
    $('#obvserve-item').transition({
        animation : 'fade down',
        onComplete : function() {
            window.setTimeout(updateProgress, 1000);
        }
    });
}

function setTestCases() {
    //Reset the current index.
    testIndex=0;
    //Update the experiment progress bar.
    var testListLength=testList.length;
    $('#experiment-progress').progress({progress: 0,
                                        duration: 200,
                                        total: testListLength,
                                        showActivity: false});
    //Start new iteration.
    startNewIteration();
}

function startUp() {
    //Get uid from cookie.
    uid=Cookies.get('uid');
    //Set the instruction title.
    document.getElementById("instruction-title").innerHTML=testInstructionTitle;
    document.getElementById("instruction-text").innerHTML=testInstructionText;
    //Update the animations.
    $('#rating-widget-boolean').transition('hide');
    $('#rating-widget-boolean-group').transition('hide');
    $('#rating-widget-integer').transition('hide');
    $('#reading-count-down').transition('hide');
    $('#next-image').transition('hide');
    $('#obvserve-item').transition('hide');
    $('#rating-widget-slider').transition('hide');
    $('#submit-generating').transition('hide');
    $('#submit-downloading').transition('hide');
    $('#rating-widget-integer-radio').transition('hide');
    $('#hint-text').transition('hide');
    $('#submit-dimmer').dimmer('hide');
    $('#rating-label-row').transition('hide');

    $('#rating-widget-boolean').state({
        text: {
            inactive : '<i class="heart icon"></i>Like',
            active : '<i class="heart icon"></i>Like'
        }
    });

    $('#rating-widget-integer').rating('setting', 'clearable', true);

    document.getElementById('rating-group-button-like').addEventListener("click", enabledNext, false);
    document.getElementById('rating-group-button-dislike').addEventListener("click", enabledNext, false);
    var radioField=document.getElementById('radio-field');
    for(var i=0; i<testRadioMaximum; ++i) {
        var radioItemName='rating-radio-'+(i+1).toString();
        var radioItemField=document.createElement('div');
        radioItemField.classList.add('field');
        var radioItem=document.createElement('div');
        radioItem.setAttribute('id', radioItemName);
        radioItem.classList.add('ui');
        radioItem.classList.add('radio');
        radioItem.classList.add('checkbox');
        var radioInput=document.createElement('input');
        radioInput.setAttribute('name', 'rating');
        radioInput.setAttribute('type', 'radio');
        radioItem.appendChild(radioInput);
        var radioLabel=document.createElement('label');
        radioLabel.innerHTML=(i+1).toString();
        radioItem.appendChild(radioLabel);
        radioItemField.appendChild(radioItem);
        radioField.appendChild(radioItemField);
        $('#'+radioItemName).checkbox({onChecked: enabledNext});
    }
    $('#rating-widget-integer').rating({onRate: enabledNext});

    var groupLikeButton=document.getElementById("rating-group-button-like");
    var groupDislikeButton=document.getElementById("rating-group-button-dislike");
    groupLikeButton.addEventListener("click", function(){
        groupDislikeButton.classList.remove("red");
        groupLikeButton.classList.add("green");
    }, false);
    groupDislikeButton.addEventListener("click", function(){
        groupDislikeButton.classList.add("red");
        groupLikeButton.classList.remove("green");
    }, false);

    //Initial start button.
    var startButton=document.getElementById("start-experiment");
    startButton.addEventListener("click", onStartClick, false);

    //Initial switch button.
    var nextButton=document.getElementById("next-image");
    nextButton.addEventListener("click", onNextClick, false);

    //Show the instruction dimmer.
    $('#start-loading').transition('hide');
    $('#instruction-dimmer').dimmer('show');
}

$(document)
    .ready(startUp);
