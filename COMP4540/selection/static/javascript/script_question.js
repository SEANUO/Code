//Disable the dimmer.
$.fn.dimmer.settings.closable=false;
//Initial widgets.
$('#answer-combo').dropdown();
$('#answer-search-combo').dropdown();
$('#answer-range').range();
//Hide labels.
$('#submit-uploading').transition('hide');
$('#submit-preparing').transition('hide');
//Variables.
var questionWidget="";
var questionIndex=0;
var globalTries=5;
var sliderHelper=0;
//Answer sheet.
var answerData=[];
//CSRF token
var csrftoken="";
//Helper variables.
var radioResultHelper="";
//Hide all the widgets.
$('#answer-combo').transition('hide');
document.getElementById('answer-combo').classList.add('hidden_widget');
$('#answer-search-combo').transition('hide');
document.getElementById('answer-search-combo').classList.add('hidden_widget');
$('#answer-line-text').transition('hide');
$('#answer-range').transition('hide');
$('#answer-range-data').transition('hide');
$('#answer-radio-list').transition('hide');
$('#answer-checkbox-list').transition('hide');
//Hide question area and submit button.
$('#next-button-area').transition('hide');
$('#queation-area').transition('hide');

//Update range function.
function updateAnswerValue(value) {
    //Set the value.
    $('#answer-range-value').html(value);
    //Save the value to helper.
    sliderHelper=value;
    //Disable the next button.
    var nextButton=document.getElementById('next-button');
    nextButton.classList.remove('disabled');
}

function hideAnswerCombo() {
    document.getElementById('answer-combo').classList.add('hidden_widget');
}

function hideAnswerSearchCombo() {
    document.getElementById('answer-search-combo').classList.add('hidden_widget');
}

function saveExpResult() {
    $('#submit-uploading').transition('show');
    $.ajax({
        type: 'POST',
        url: '/sendquestionresult',
        dataType: 'json',
        data : {csrfmiddlewaretoken: csrftoken,
                exp_result: JSON.stringify(answerData)},
        success: function(response) {
            var response_uid=response['uid'];
            //Add to Cookie.
            Cookies.set('uid', response_uid);
            $('#submit-uploading').transition('hide');
            $('#submit-preparing').transition('show');
            window.location.href='/initialtest';
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

function onNextAnimationFinished() {
    //Increase the question index.
    ++questionIndex;
    //Check index.
    if(questionIndex==questionTypes.length) {
        $('#submit-dimmer').dimmer('show');
        //Increase the progress bar.
        $('#experiment-progress').progress('increment');
        saveExpResult();
    } else {
        //Increase the progress bar.
        $('#experiment-progress').progress('increment');
        //Prepare the next question.
        prepareAndShowQuestion();
    }
}

function onNextPressed() {
    if(questionType==0) {
        //Combo box.
        answerData.push($('#answer-combo').dropdown('get text'));
        //Hide widget.
        $('#answer-combo').transition({
            animation: 'fade up',
            onComplete: hideAnswerCombo
        });
    } else if(questionType==1){
        //Text Input
        answerData.push(document.getElementById('answer-line-text-input').value);
        //Hide widget.
        $('#answer-line-text').transition('fade up');
    } else if(questionType==2) {
        //Slider.
        answerData.push(sliderHelper);
        //Hide widget.
        $('#answer-range').transition('fade up');
        $('#answer-range-data').transition('fade up');
    } else if(questionType==3) {
        //Radio list.
        answerData.push(radioResultHelper);
        //Search all content in the list.
        $('#answer-radio-list').transition('fade up');
    } else if(questionType==4) {
        $('#answer-checkbox-list').transition('fade up');
    } else if(questionType==5) {
        //Search Combo box.
        answerData.push($('#answer-search-combo').dropdown('get text'));
        //Hide widget.
        $('#answer-search-combo').transition({
            animation: 'fade up',
            onComplete: hideAnswerSearchCombo
        });
    }
    //Hide the question area, submit button.
    $('#next-button-area').transition('fade up');
    $('#queation-area').transition({
        animation: 'fade down',
        onComplete: onNextAnimationFinished
    });
}

function generalNextCheck() {
    //Disable the next button.
    var nextButton=document.getElementById('next-button');
    nextButton.classList.remove('disabled');
}

function inputBoxNextCheck() {
    //Check the value.
    var inputBoxValue=document.getElementById('answer-line-text-input').value;
    //Check length.
    var nextButton=document.getElementById('next-button');
    if(inputBoxValue.length==0) {
        nextButton.classList.add('disabled');
    } else {
        nextButton.classList.remove('disabled');
    }
}

function radioNextCheck(event) {
    //Set the radio helper text.
    var targetElement = event.target || event.srcElement;
    //Get the attribute.
    radioResultHelper=targetElement.getAttribute('value');
    //Enable the next button.
    var nextButton=document.getElementById('next-button');
    nextButton.classList.remove('disabled');
}

function prepareAndShowQuestion() {
    //Prepare the current question.
    questionType=questionTypes[questionIndex];
    questionText=questionTexts[questionIndex];
    questionExplain=questionExplains[questionIndex];
    questionSetting=questionSettings[questionIndex];
    //Set the content of the widget.
    document.getElementById('question-text').innerHTML=questionText;
    document.getElementById('question-explain').innerHTML=questionExplain;
    //Set the question widget.
    if(questionType==0) {
        //Set the question widget.
        questionWidget="answer-combo";
        document.getElementById('answer-combo-default-text').innerHTML=questionSetting["defaultText"];
        //Remove all the current combo element child.
        var comboElement=document.getElementById('answer-combo-menu');
        while(comboElement.firstChild) {
            comboElement.firstChild.removeEventListener("click", generalNextCheck, false);
            comboElement.removeChild(comboElement.firstChild);
        }
        var itemList=questionSetting["values"];
        for(var i=0; i<itemList.length; ++i) {
            var current_item=itemList[i];
            var current_element=document.createElement('div');
            current_element.classList.add('item');
            current_element.setAttribute('data-value', current_item[1]);
            current_element.innerHTML=current_item[0];
            current_element.addEventListener("click", generalNextCheck, false);
            comboElement.appendChild(current_element);
        }
        //Show the answer combo.
        document.getElementById('answer-combo').classList.remove('hidden_widget');
        $('#answer-combo').transition('fade up');
    } else if(questionType==1){
        questionWidget="answer-line-text";
        var editElement=document.getElementById('answer-line-text-input');
        editElement.setAttribute("placeholder", questionSetting["defaultText"]);
        editElement.value="";
        $('#answer-line-text').transition('fade up');
    } else if(questionType==2) {
        questionWidget="answer-range";
        $('#answer-range').range({
            min: questionSetting["min"],
            max: questionSetting["max"],
            start: questionSetting["min"],
            onChange: updateAnswerValue});
        $('#answer-range').transition('fade up');
        $('#answer-range-data').transition('fade up');
        document.getElementById('answer-range-label').innerHTML=questionSetting["label"];
    } else if(questionType==3) {
        questionWidget="answer-radio-list";
        var candidateList=questionSetting["values"];
        var listArea=document.getElementById('answer-radio-list-area');
        while(listArea.firstChild){
            listArea.firstChild.removeEventListener('click', radioNextCheck, false);
            listArea.removeChild(listArea.firstChild);
        }
        for(var i=0; i<candidateList.length; ++i) {
            var candidateField=document.createElement('div');
            candidateField.classList.add('field');
            candidateField.addEventListener('click', radioNextCheck, false);
            var candidateItem=document.createElement('div');
            candidateItem.classList.add('ui');
            candidateItem.classList.add('radio');
            candidateItem.classList.add('checkbox');
            var candidateInput=document.createElement('input');
            candidateInput.setAttribute('name', 'question-field');
            candidateInput.setAttribute('type', 'radio');
            candidateInput.setAttribute('value', candidateList[i]);
            candidateItem.appendChild(candidateInput);
            var candidateValue=document.createElement('label');
            candidateValue.innerHTML=candidateList[i];
            candidateItem.appendChild(candidateValue);
            candidateField.appendChild(candidateItem);
            listArea.appendChild(candidateField);
        }
        $('#answer-radio-list').transition('fade up');
    } else if(questionType==4) {
        questionWidget="answer-checkbox-list";
        var candidateList=questionSetting["values"];
        var listArea=document.getElementById('answer-checkbox-list-area');
        while(listArea.firstChild){
            listArea.firstChild.removeEventListener('click', generalNextCheck, false);
            listArea.removeChild(listArea.firstChild);
        }
        for(var i=0; i<candidateList.length; ++i) {
            var candidateField=document.createElement('div');
            candidateField.classList.add('field');
            candidateField.addEventListener('click', generalNextCheck, false);
            var candidateItem=document.createElement('div');
            candidateItem.classList.add('ui');
            candidateItem.classList.add('checkbox');
            var candidateInput=document.createElement('input');
            candidateInput.setAttribute('name', 'question-field');
            candidateInput.setAttribute('type', 'checkbox');
            candidateItem.appendChild(candidateInput);
            var candidateValue=document.createElement('label');
            candidateValue.innerHTML=candidateList[i];
            candidateItem.appendChild(candidateValue);
            candidateField.appendChild(candidateItem);
            listArea.appendChild(candidateField);
        }
        $('#answer-checkbox-list').transition('fade up');
    } else if(questionType==5) {
        //Set the question widget.
        questionWidget="answer-search-combo";
        document.getElementById('answer-search-combo-default-text').innerHTML=questionSetting["defaultText"];
        //Remove all the current combo element child.
        var comboElement=document.getElementById('answer-search-combo-menu');
        while(comboElement.firstChild) {
            comboElement.firstChild.removeEventListener("click", generalNextCheck, false);
            comboElement.removeChild(comboElement.firstChild);
        }
        var itemList=questionSetting["values"];
        for(var i=0; i<itemList.length; ++i) {
            var current_item=itemList[i];
            var current_element=document.createElement('div');
            current_element.classList.add('item');
            current_element.setAttribute('data-value', current_item[1]);
            current_element.innerHTML=current_item[0];
            current_element.addEventListener("click", generalNextCheck, false);
            comboElement.appendChild(current_element);
        }
        //Show the answer combo.
        document.getElementById('answer-search-combo').classList.remove('hidden_widget');
        $('#answer-search-combo').transition('fade up');
    }
    //Show the question area, submit button.
    $('#next-button-area').transition('fade up');
    $('#queation-area').transition('fade down');
    //Disable the next button.
    var nextButton=document.getElementById('next-button');
    nextButton.classList.add('disabled');
}

//Check question type
$(document).ready(function() {
    //Get the cookie.
    csrftoken=Cookies.get('csrftoken');
    //Link next button.
    var nextButton=document.getElementById('next-button');
    nextButton.addEventListener("click", onNextPressed, false);
    //Link input box.
    var inputBox=document.getElementById('answer-line-text-input');
    inputBox.oninput=inputBoxNextCheck;
    //Reset the index.
    questionIndex=0;
    $('#experiment-progress').progress({progress: 0,
                                        duration: 200,
                                        total: questionTypes.length,
                                        showActivity: false});
    //Show the instruction.
    document.getElementById('instruction-title').innerHTML=questionInstructionTitle;
    document.getElementById('instruction-text').innerHTML=questionInstructionText;
    $('#instruction-dimmer').dimmer('show');
    //Combine the button click event.
    document.getElementById('start-experiment').addEventListener('click',
    function() {
        $('#instruction-dimmer').dimmer('hide');
        window.setTimeout(prepareAndShowQuestion, 500);
    }, false);
});
