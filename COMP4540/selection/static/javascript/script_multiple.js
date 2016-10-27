//Disable the dimmer.
$.fn.dimmer.settings.closable=false;
//Hide dimmer data.
$('#submit-generating').transition('hide');
$('#submit-downloading').transition('hide');
//Hide the container.
$('#multiple-container').transition('hide');
//Hide the title hint.
$('#title-hint-content').transition('hide');
//Initial the progress.
$('#experiment-progress').progress({
    showActivity: false
});
//Hide next button.
$('#next-step').transition('hide');
//-----Codename: Fuso-----
//List choosing widget.
//List helper.
var listSelectedCount=0;
var listSelectedIndex=[];
var listScoreCounter=[];
//Hide list widget.
$('#multiple-list').transition('hide');
//-----Codename: Ise-----
//Grid choosing widget.
//Grid helper.
var gridSelectedCount=0;
var gridColumnCount=4;
var gridRowCount=0;
var gridScoreCounter=[];
//Hide grid widget.
$('#multiple-grid').transition('hide');
//-----Codename: Nagato-----
var driveLevel=1;
var drivePreviousChoose=1;
var driveChoseBased=0;
var driveChoose=[];
var driveSecondAnime='';
//Hide the drive widget.
$('#multiple-drive').transition('hide');
$('#multiple-drive-second').transition('hide');
//-----Codename: Yamato-----
var kancolleSelectedCard;
var kancolleSelectedCount=0;
var kancolleScoreCounter=[];
//Hide the kancolle widget.
$('#multiple-kancolle').transition('hide');
//-----Codename: Haruna-----
var submitImageList=[];
var submitScoreWidgetList=[];
var submitScoreList=[];
var startTime;
var secondStageTime;
var submitTime;
var stageOneTime;
var stageTwoTime;
var csrftoken;

function createRatingWidget(ratingWidgetName) {
    var ratingWidget;
    //Star rating.
    if(testSingleIndex==0) {
        //-----Codename: Kongo-----
        ratingWidget=document.createElement('div');
        ratingWidget.setAttribute('id', ratingWidgetName);
        ratingWidget.classList.add('ui');
        ratingWidget.classList.add('heart');
        ratingWidget.classList.add('rating');
        ratingWidget.setAttribute('data-rating', '0');
        ratingWidget.setAttribute('data-max-rating', '10');
    } else if(testSingleIndex==1) {
        //-----Codename: Hiei-----
        ratingWidget=document.createElement('div');
        ratingWidget.setAttribute('id', ratingWidgetName);
        ratingWidget.classList.add('ui');
        ratingWidget.classList.add('red');
        ratingWidget.classList.add('range');
    }
    return ratingWidget;
}

function toggleListItem() {
    if(this.classList.contains('selected-item')) {
        this.classList.remove('selected-item');
        listSelectedCount=listSelectedCount-1;
    } else {
        this.classList.add('selected-item');
        listSelectedCount=listSelectedCount+1;
    }
    //Update the next button state.
    var nextButton=document.getElementById('next-step');
    if(listSelectedCount==0) {
        //Disable the next button.
        if(!nextButton.classList.contains('disabled')) {
            nextButton.classList.add('disabled');
        }
    } else {
        if(nextButton.classList.contains('disabled')) {
            nextButton.classList.remove('disabled');
        }
    }
}

function getUtcTime(currentTime) {
    return Date.UTC(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds(), currentTime.getMilliseconds());
}

function submitData() {
    //Set the submit time.
    submitTime=new Date();
    //Calculate duration.
    timeStart=getUtcTime(startTime);
    timeSecond=getUtcTime(secondStageTime);
    timeSubmit=getUtcTime(submitTime);
    stageOneTime=timeSecond-timeStart;
    stageTwoTime=timeSubmit-timeSecond;
    //Increase the progress bar.
    $('#experiment-progress').progress('increment');
    //Get csrftoken.
    csrftoken = Cookies.get('csrftoken');
    //Show the submit dimmer.
    $('#multiple-list').transition('hide');
    $('#multiple-grid').transition('hide');
    $('#multiple-drive-second').transition('hide');
    $('#submit-dimmer').dimmer('show');
    //Construct the object.
    var submitPackage={};
    submitPackage["ui"]=testUIIndex;
    submitPackage["iteration"]=testIteration;
    submitPackage["duration-first"]=stageOneTime;
    submitPackage["duration-second"]=stageTwoTime;
    //Construct score package.
    var submitData=[];
    for(var i=0; i<submitImageList.length; ++i) {
        var submitItemData={};
        submitItemData['image']=submitImageList[i];
        submitItemData['score']=submitScoreList[i];
        submitData.push(submitItemData);
    }
    submitPackage["result"]=submitData;
    $.ajax({
        type: 'POST',
        url: '/saveiteration',
        dataType: 'json',
        data : {csrfmiddlewaretoken: csrftoken,
                uid: uid,
                iteration: testIteration,
                exp_result: JSON.stringify(submitPackage)},
        success: function(response) {
            $('#submit-uploading').transition('hide');
            $('#submit-generating').transition('show');
            $.ajax({
                type: 'POST',
                url: '/generateiteration',
                dataType: 'json',
                data : {
                    csrfmiddlewaretoken: csrftoken,
                    uid: uid,
                    iteration: testIteration,
                    image_gene: JSON.stringify(imageGene),
                    exp_result: JSON.stringify(submitPackage)},
                success: function(response) {
                    if(response['state']=='complete') {
                        window.location.href='about:blank';
                    } else {
                        window.location.href="/multiple?uid="+response['uid']+"&iteration="+response['iteration'];
                    }
                }
            });
        }
    });
}

function generalLaunchSubmit() {
    //Hide all the content.
    $('#title-hint-content').transition('fade up');
    $('#next-step').transition('fade down');
    $('#multiple-container').transition({
        animation:'scale',
        onComplete:submitData
    });
}

function submitListData() {
    //Launch submit.
    generalLaunchSubmit();
}

function secondSliderValue(itemValue) {
    var imageIndex=submitScoreWidgetList.indexOf(this.name);
    //Save the score.
    submitScoreList[imageIndex]=itemValue;
}

function listSecondNextCheck(itemValue) {
    //Check this.
    var itemName=itemValue;
    if(this.nodeType && this.nodeType==1) {
        //Rating widget.
        var widgetName=this.getAttribute('id');
        itemName=widgetName;
        var imageIndex=submitScoreWidgetList.indexOf(this.getAttribute('id'));
        //Get the widget score.
        var widgetValue=$('#'+widgetName).rating('get rating');
        //Save the score.
        submitScoreList[imageIndex]=widgetValue*10;
    } else {
        //It must be an jQ object, means it is a slider widget.
        // console.log(submitScoreWidgetList.indexOf(this.name));
        //Change the item name to store the div.
        itemName=this.name;
    }
    //Check the list.
    if(listScoreCounter.indexOf(itemName)==-1) {
        //A new item enabled.
        listScoreCounter.push(itemName);
        if(listScoreCounter.length == listSelectedCount) {
             //Enable the next button.
             document.getElementById('next-step').classList.remove('disabled');
        }
    }
}

function showSecondStageList() {
    //Upate the title text.
    document.getElementById('title-hint-content').innerHTML=testScoreHintText;
    //Reset the selected index.
    listSelectedIndex=[];
    listScoreCounter=[];
    //Reset the submit score widget list.
    submitScoreWidgetList=[];
    //Scrll back to top.
    document.getElementById('multiple-container').scrollTop=0;
    //Remove the next click event.
    var nextButton=document.getElementById('next-step');
    nextButton.removeEventListener('click', showSecondStageList, false);
    nextButton.addEventListener('click', submitListData, false);
    nextButton.classList.add('disabled');
    //Update the list item.
    var listNode=document.getElementById('multiple-list');
    listNode.classList.remove('selection');
    var testListCount=testList.length;
    var itemName;
    for(var i=0; i<testListCount; ++i) {
        itemName='multiple-list-item-'+i.toString();
        var listItem=document.getElementById(itemName);
        if(listItem.classList.contains('selected-item')) {
            //Save the images.
            submitImageList.push(testList[i]);
            //Add one empty score to submit widget list.
            submitScoreList.push(0);
            //Add to selected index list.
            listSelectedIndex.push(i);
            //Show the rating widget.
            listItem.classList.remove('selected-item');
            listItem.removeEventListener('click', toggleListItem, false);
            //Get the item content.
            var itemContent=document.getElementById('multiple-list-item-content-'+i.toString());
            //Set id.
            var ratingWidgetName='multiple-list-rating-'+i.toString();
            //Create the rating widget.
            var ratingWidget=createRatingWidget(ratingWidgetName);
            submitScoreWidgetList.push(ratingWidgetName);
            //Add widget the list item.
            itemContent.appendChild(ratingWidget);
            if(testSingleIndex==0){
                $('#'+ratingWidgetName).rating({onRate: listSecondNextCheck});
            } else if (testSingleIndex==1) {
                $('#'+ratingWidgetName).range({
                    name: ratingWidgetName,
                    min:0,
                    max:100,
                    start:0,
                    onClick: listSecondNextCheck,
                    onChange: secondSliderValue
                });
            }
        } else {
            $('#'+itemName).toggle('fold');
        }
    }
    //Back to top.
    $('#multiple-container').scrollTop(0);
    //Save the time.
    secondStageTime=new Date();
}

function updateList() {
    //Reset the selection count.
    listSelectedCount=0;
    //Get the next button.
    var nextButton=document.getElementById('next-step');
    if(!nextButton.classList.contains('disabled')) {
        nextButton.classList.add('disabled');
    }
    //Remove all the lister.
    var newNextButton=nextButton.cloneNode(true);
    nextButton.parentNode.replaceChild(newNextButton, nextButton);
    newNextButton.addEventListener('click', showSecondStageList, false);
    //Get the list size and widget.
    var listSize=testList.length;
    var listNode=document.getElementById('multiple-list');
    //Check the list node.
    if(!listNode.classList.contains('selection')) {
        listNode.classList.add('selection');
    }
    var listItem=listNode.firstElementChild;
    while(listItem) {
        listItem.removeEventListener('click', toggleListItem, false);
        listNode.removeChild(listItem);
        listItem=listNode.firstElementChild;
    }
    for(var i=0; i<listSize; ++i) {
        listItem=document.createElement('div');
        var listItemName='multiple-list-item-'+i.toString();
        listItem.setAttribute('id', listItemName);
        listItem.classList.add('item');
        listItem.addEventListener('click', toggleListItem, false);
        //Create the image icon.
        var listImage=document.createElement('img');
        listImage.classList.add('ui');
        listImage.classList.add('tiny');
        listImage.classList.add('image');
        listImage.setAttribute('src', testList[i]);
        listItem.appendChild(listImage);
        //Add content.
        var contentNode=document.createElement('div');
        contentNode.classList.add('middle');
        contentNode.classList.add('aligned');
        contentNode.classList.add('content');
        contentNode.setAttribute('id', 'multiple-list-item-content-'+i.toString());
        //Add header data.
        var headerNode=document.createElement('p');
        headerNode.classList.add('header');
        headerNode.innerHTML=testTitle + (i+1).toString();
        contentNode.appendChild(headerNode);
        listItem.appendChild(contentNode);
        //Add to list.
        listNode.appendChild(listItem);
    }
    //Upate the title text.
    document.getElementById('title-hint-content').innerHTML=testHintText;
    //Show the widget.
    window.setTimeout(function(){
        $('#multiple-list').transition('show');
        $('#multiple-container').transition('fade down');
        $('#next-step').transition('fade up');
        $('#title-hint-content').transition('fade down');
        //Show the widget.
        $('#multiple-container').scrollTop(0);
    }, 500);
}

function submitGridData() {
    //Launch submit.
    generalLaunchSubmit();
}

function toggleGridItem() {
    if(this.classList.contains('selected-item')) {
        this.classList.remove('selected-item');
        listSelectedCount=listSelectedCount-1;
    } else {
        this.classList.add('selected-item');
        listSelectedCount=listSelectedCount+1;
    }
    //Update the next button state.
    var nextButton=document.getElementById('next-step');
    if(listSelectedCount==0) {
        //Disable the next button.
        if(!nextButton.classList.contains('disabled')) {
            nextButton.classList.add('disabled');
        }
    } else {
        if(nextButton.classList.contains('disabled')) {
            nextButton.classList.remove('disabled');
        }
    }
}

function gridSecondNextCheck(recordValue) {
    //Check this.
    var recordName=recordValue;
    if(this.nodeType && this.nodeType==1) {
        //Rating widget.
        var widgetName=this.getAttribute('id');
        recordName=widgetName;
        var imageIndex=submitScoreWidgetList.indexOf(this.getAttribute('id'));
        //Save the score.
        submitScoreList[imageIndex]=recordValue*10;
    } else {
        //It must be an jQ object, means it is a slider widget.
        // console.log(submitScoreWidgetList.indexOf(this.name));
        //Change the item name to store the div.
        recordName=this.name;
    }
    //Get the clicked name.
    if(gridScoreCounter.indexOf(recordName)==-1) {
        //A new item enabled.
        gridScoreCounter.push(recordName);
        if(gridScoreCounter.length == gridSelectedCount) {
             //Enable the next button.
             document.getElementById('next-step').classList.remove('disabled');
        }
    }
}

function showSecondStageGrid() {
    //Upate the title text.
    document.getElementById('title-hint-content').innerHTML=testScoreHintText;
    var gridSize=testList.length;
    var indexCounter=0;
    var gridItem;
    //Reset the counter.
    gridSelectedCount=0;
    submitScoreList=[];
    //Scrll back to top.
    document.getElementById('multiple-container').scrollTop=0;
    //Remove the next click event.
    var nextButton=document.getElementById('next-step');
    var gridNode=document.getElementById('multiple-grid');
    nextButton.removeEventListener('click', showSecondStageGrid, false);
    nextButton.addEventListener('click', submitGridData, false);
    //Generate widgets.
    for(indexCounter=0; indexCounter<gridSize; ++indexCounter) {
        //Get the item.
        gridItem=document.getElementById('multiple-grid-item-'+indexCounter.toString());
        gridItem.removeEventListener('click', toggleGridItem, false);
        //Check the grid item is selected or not.
        if(gridItem.classList.contains('selected-item')) {
            //Increase the counter.
            ++gridSelectedCount;
            //Save the images.
            submitImageList.push(testList[indexCounter]);
            submitScoreList.push(0);
            //Remove the selected item background.
            gridItem.classList.remove('selected-item');
            gridItem.classList.add('grid-item-selected');
            gridItem.classList.add('grid');
            //Create rating row.
            var ratingRow=document.createElement('div');
            ratingRow.classList.add('row');
            ratingRow.classList.add('centered');
            ratingRow.classList.add('grid-rating-container');
            //Set id.
            var ratingWidgetName='multiple-grid-rating-'+indexCounter.toString();
            submitScoreWidgetList.push(ratingWidgetName)
            //Create the rating widget.
            var ratingWidget=createRatingWidget(ratingWidgetName);
            ratingRow.appendChild(ratingWidget);
            //Add widget the list item.
            gridItem.appendChild(ratingRow);
            if(testSingleIndex==0){
                $('#'+ratingWidgetName).rating({onRate: gridSecondNextCheck});
            } else if (testSingleIndex==1) {
                $('#'+ratingWidgetName).range({
                    name:ratingWidgetName,
                    min:0,
                    max:100,
                    start:0,
                    onClick: gridSecondNextCheck,
                    onChange: secondSliderValue
                });
            }
        } else {
            //Remove the item from the grid.
            gridNode.removeChild(gridItem);
        }
    }
    //Reset the counter and disable the button.
    gridScoreCounter=[];
    nextButton.classList.add('disabled');
    //Save the time.
    secondStageTime=new Date();
}

function updateGrid() {
    //Reset the grid count.
    gridSelectedCount=0;
    //Get the next button.
    var nextButton=document.getElementById('next-step');
    if(!nextButton.classList.contains('disabled')) {
        nextButton.classList.add('disabled');
    }
    //Remove all the lister.
    var newNextButton=nextButton.cloneNode(true);
    nextButton.parentNode.replaceChild(newNextButton, nextButton);
    newNextButton.addEventListener('click', showSecondStageGrid, false);
    var gridSize=testList.length;
    var gridNode=document.getElementById('multiple-grid');
    //Clear the grid data.
    var gridItem=gridNode.firstElementChild;
    while(gridItem) {
        //Get row first child.
        gridItem.removeEventListener('click', toggleGridItem, false);
        gridNode.removeChild(gridItem);
        gridItem=gridRow.firstElementChild;
    }
    //Calculate line count.
    gridRowCount=Math.ceil(gridSize/gridColumnCount);
    var indexCounter=0;
    for(var indexCounter=0; indexCounter<gridSize; ++indexCounter) {
        //Create one item.
        gridItem=document.createElement('div');
        var gridItemName='multiple-grid-item-'+indexCounter.toString();
        gridItem.setAttribute('id', gridItemName);
        gridItem.classList.add('ui');
        gridItem.classList.add('column');
        gridItem.classList.add('grid-item');
        gridItem.classList.add('segment');
        gridItem.addEventListener('click', toggleGridItem, false);
        //Create image.
        var gridImageDiv=document.createElement('div');
        gridImageDiv.classList.add('ui');
        gridImageDiv.classList.add('low-normal');
        gridImageDiv.classList.add('image');
        gridImageDiv.classList.add('row');
        gridImageDiv.classList.add('centered');
        var gridImage=document.createElement('img');
        gridImage.setAttribute('src', testList[indexCounter]);
        gridImage.classList.add('low-normal');
        gridImageDiv.appendChild(gridImage);
        gridItem.appendChild(gridImageDiv);
        //Add item to grid node.
        gridNode.appendChild(gridItem);
    }
    //Upate the title text.
    document.getElementById('title-hint-content').innerHTML=testHintText;
    window.setTimeout(function(){
        $('#multiple-grid').transition('show');
        $('#multiple-container').transition('fade down');
        $('#next-step').transition('fade up');
        $('#title-hint-content').transition('fade down');
        //Show the widget.
        $('#multiple-container').scrollTop(0);
    }, 500);
}

function hideSecondAndSubmit() {
    $('#title-hint-content').transition({
        animation:'fade up',
        onComplete:function() {
            $('#multiple-drive-second').transition('hide');
        }
    });
    $('#multiple-container').transition({
        animation:'scale',
        onComplete:submitData
    });
}

function onSecondDriveKeyConfirm(event) {
    //Left:     A = 65
    //Forward:  W = 87
    //Right:    D = 68
    //Down:     S = 83
    var keyAscII=event.which;
    //Get the previous key.
    //CHeck the key ascii.
    if(keyAscII==87 || keyAscII==65 || keyAscII==68 || keyAscII==83) {
        //Cut down the key down event.
        $(document).off('keydown', onSecondDriveKeyConfirm);
        //Check the key ascii.
        if(keyAscII == 65) {
            keyAscII=0; //Left.
        } else if (keyAscII == 87) {
            keyAscII=1;
        } else if (keyAscII == 68) {
            keyAscII=2;
        }
        //Check the key ascii is the same as previous one.
        if(drivePreviousChoose==keyAscII) {
            //Append the data to drive next.
            driveChoose.push(keyAscII);
            //Show the hide animation.
            if(keyAscII==0) {
                $('#drive-second-column-dimmer-1').dimmer('hide');
                $('#drive-second-column-dimmer-2').dimmer('hide');
                $('#drive-second-container-1').transition('hide');
                $('#drive-second-container-2').transition('hide');
                $('#drive-second-column-1').transition('fade left');
                $('#drive-second-column-2').transition({
                    animation: 'fade left',
                    onComplete : hideSecondAndSubmit
                });
                driveSecondAnime='fade right';
                for(i=0; i<3; ++i) {
                    submitScoreList[i]=70;
                }
            } else if(keyAscII==1) {
                $('#drive-second-column-dimmer-0').dimmer('hide');
                $('#drive-second-column-dimmer-2').dimmer('hide');
                $('#drive-second-container-0').transition('hide');
                $('#drive-second-container-2').transition('hide');
                $('#drive-second-column-0').transition('scale');
                $('#drive-second-column-2').transition({
                    animation: 'scale',
                    onComplete : hideSecondAndSubmit
                });
                driveSecondAnime='scale';
                for(i=3; i<6; ++i) {
                    submitScoreList[i]=70;
                }
            } else if(keyAscII==2) {
                $('#drive-second-column-dimmer-0').dimmer('hide');
                $('#drive-second-column-dimmer-1').dimmer('hide');
                $('#drive-second-container-0').transition('hide');
                $('#drive-second-container-1').transition('hide');
                $('#drive-second-column-0').transition('hide');
                $('#drive-second-column-1').transition({
                    animation: 'fade right',
                    onComplete : hideSecondAndSubmit
                });
                driveSecondAnime='fade left';
                for(i=6; i<9; ++i) {
                    submitScoreList[i]=70;
                }
            }
        } else {
            //Hide all the dimmer.
            $('#drive-second-column-dimmer-0').dimmer('hide');
            $('#drive-second-column-dimmer-1').dimmer('hide');
            $('#drive-second-column-dimmer-2').dimmer('hide');
            //Abandon, relink to drive key down.
            $(document).keydown(onSecondDriveKeyDown);
            //Set the title hint content.
            document.getElementById('title-hint-content').innerHTML=testDriveHintText;
        }
    }
}

function onSecondDriveKeyDown(event) {
    //Left:     A = 65
    //Forward:  W = 87
    //Right:    D = 68
    var keyAscII=event.which;
    if(keyAscII==65){
        //Check the drive level.
        drivePreviousChoose=0;
        //Middle and right dimmer show.
        $('#drive-second-column-dimmer-1').dimmer('show');
        $('#drive-second-column-dimmer-2').dimmer('show');
        //Cut the link.
        $(document).off('keydown', onSecondDriveKeyDown);
        $(document).keydown(onSecondDriveKeyConfirm);
        //Set the title hint content.
        document.getElementById('title-hint-content').innerHTML=testDriveConfirmText;
    } else if(keyAscII==87) {
        //Check the drive level.
        drivePreviousChoose=1;
        //Left and right dimmer show.
        $('#drive-second-column-dimmer-0').dimmer('show');
        $('#drive-second-column-dimmer-2').dimmer('show');
        //Cut the link.
        $(document).off('keydown', onSecondDriveKeyDown);
        $(document).keydown(onSecondDriveKeyConfirm);
        //Set the title hint content.
        document.getElementById('title-hint-content').innerHTML=testDriveConfirmText;
    } else if(keyAscII==68) {
        //Set the check level.
        drivePreviousChoose=2;
        //Middle and left dimmer show.
        $('#drive-second-column-dimmer-0').dimmer('show');
        $('#drive-second-column-dimmer-1').dimmer('show');
        //Cut the link.
        $(document).off('keydown', onSecondDriveKeyDown);
        $(document).keydown(onSecondDriveKeyConfirm);
        //Set the title hint content.
        document.getElementById('title-hint-content').innerHTML=testDriveConfirmText;
    }
}

function driveUpdateSecond() {
    //Set the title hint content.
    document.getElementById('title-hint-content').innerHTML=testDriveHintText;
    //Set url to the second widget.
    var baseInteger=drivePreviousChoose*9;
    for(var i=0; i<9; ++i) {
        //Set the url.
        document.getElementById('drive-second-image-'+i.toString()).setAttribute('src', testList[baseInteger+i]);
    }
    $('#multiple-drive-second').transition({
        animation : driveSecondAnime,
        onComplete : function() {
            $(document).keydown(onSecondDriveKeyDown);
            //Save the time.
            secondStageTime=new Date();
        }
    });
}

function hideAndStartSecond() {
    //Show title.
    $('#multiple-drive').transition({
        animation : driveSecondAnime,
        duration : '2s',
        onComplete : function() {
            driveUpdateSecond();
        }
    });
}

function onDriveKeyConfirm(event) {
    //Left:     A = 65
    //Forward:  W = 87
    //Right:    D = 68
    //Down:     S = 83
    var keyAscII=event.which;
    //Get the previous key.
    //CHeck the key ascii.
    if(keyAscII==87 || keyAscII==65 || keyAscII==68 || keyAscII==83) {
        //Cut down the key down event.
        $(document).off('keydown', onDriveKeyConfirm);
        //Check the key ascii.
        if(keyAscII == 65) {
            keyAscII=0; //Left.
        } else if (keyAscII == 87) {
            keyAscII=1;
        } else if (keyAscII == 68) {
            keyAscII=2;
        }
        //Check the key ascii is the same as previous one.
        if(drivePreviousChoose==keyAscII) {
            //Append the data to drive next.
            driveChoose.push(keyAscII);
            //Show the hide animation.
            if(keyAscII==0) {
                $('#drive-column-dimmer-1').dimmer('hide');
                $('#drive-column-dimmer-2').dimmer('hide');
                $('#drive-mid-content').transition('hide');
                $('#drive-right-content').transition('hide');
                $('#drive-column-1').transition('fade left');
                $('#drive-column-2').transition({
                    animation: 'fade left',
                    onComplete : hideAndStartSecond
                });
                driveSecondAnime='fade right';
                driveChoseBased=0;
                for(var i=0; i<9; ++i) {
                    submitImageList.push(testList[i]);
                    submitScoreList.push(30);
                }
            } else if(keyAscII==1) {
                $('#drive-column-dimmer-0').dimmer('hide');
                $('#drive-column-dimmer-2').dimmer('hide');
                $('#drive-left-content').transition('hide');
                $('#drive-right-content').transition('hide');
                $('#drive-column-0').transition('scale');
                $('#drive-column-2').transition({
                    animation: 'scale',
                    onComplete : hideAndStartSecond
                });
                driveSecondAnime='scale';
                driveChoseBased=9;
                for(var i=9; i<18; ++i) {
                    submitImageList.push(testList[i]);
                    submitScoreList.push(30);
                }
            } else if(keyAscII==2) {
                $('#drive-column-dimmer-0').dimmer('hide');
                $('#drive-column-dimmer-1').dimmer('hide');
                $('#drive-left-content').transition('hide');
                $('#drive-mid-content').transition('hide');
                $('#drive-column-0').transition('fade right');
                $('#drive-column-1').transition({
                    animation: 'fade right',
                    onComplete : hideAndStartSecond
                });
                driveSecondAnime='fade left';
                driveChoseBased=18;
                for(var i=18; i<27; ++i) {
                    submitImageList.push(testList[i]);
                    submitScoreList.push(30);
                }
            }
        } else {
            //Set the title hint content.
            document.getElementById('title-hint-content').innerHTML=testDriveHintText;
            //Hide all the dimmer.
            $('#drive-column-dimmer-0').dimmer('hide');
            $('#drive-column-dimmer-1').dimmer('hide');
            $('#drive-column-dimmer-2').dimmer('hide');
            //Abandon, relink to drive key down.
            $(document).keydown(onDriveKeyDown);
        }
    }
}

function onDriveKeyDown(event) {
    //Left:     A = 65
    //Forward:  W = 87
    //Right:    D = 68
    var keyAscII=event.which;
    if(keyAscII==65){
        //Check the drive level.
        drivePreviousChoose=0;
        //Middle and right dimmer show.
        $('#drive-column-dimmer-1').dimmer('show');
        $('#drive-column-dimmer-2').dimmer('show');
        //Cut the link.
        $(document).off('keydown', onDriveKeyDown);
        $(document).keydown(onDriveKeyConfirm);
        //Set the title hint content.
        document.getElementById('title-hint-content').innerHTML=testDriveConfirmText;
    } else if(keyAscII==87) {
        //Check the drive level.
        drivePreviousChoose=1;
        //Left and right dimmer show.
        $('#drive-column-dimmer-0').dimmer('show');
        $('#drive-column-dimmer-2').dimmer('show');
        //Cut the link.
        $(document).off('keydown', onDriveKeyDown);
        $(document).keydown(onDriveKeyConfirm);
        //Set the title hint content.
        document.getElementById('title-hint-content').innerHTML=testDriveConfirmText;
    } else if(keyAscII==68) {
        //Set the check level.
        drivePreviousChoose=2;
        //Middle and left dimmer show.
        $('#drive-column-dimmer-0').dimmer('show');
        $('#drive-column-dimmer-1').dimmer('show');
        //Cut the link.
        $(document).off('keydown', onDriveKeyDown);
        $(document).keydown(onDriveKeyConfirm);
        //Set the title hint content.
        document.getElementById('title-hint-content').innerHTML=testDriveConfirmText;
    }
}

function updateDrive() {
    //Set the title hint content.
    document.getElementById('title-hint-content').innerHTML=testDriveHintText;
    //Show title.
    $('#title-hint-content').transition('fade up');
    //Reset the drive level.
    driveLevel=0;
    driveChoose=[];
    //Reset the dimmer visibility.
    $('#drive-column-dimmer-0').dimmer('hide');
    $('#drive-column-dimmer-1').dimmer('hide');
    $('#drive-column-dimmer-2').dimmer('hide');
    //Check the size of the test list.
    if(testList.length!=27) {
        //Error Happens!
        //!FIXME: Add hints here.
        console.log('test list length error.');
        return;
    }
    //Reset and insert 0s.
    submitScoreWidgetList=[];
    submitScoreList=[];
    //Loop and set the src to the html.
    var driveImgItem;
    for(var i=0; i<27; ++i) {
        var driveImgItemName='drive-img-'+(i+1).toString();
        document.getElementById(driveImgItemName).setAttribute('src', testList[i]);
    }
    //Show the multiple container.
    $('#multiple-drive').transition({
        animation : 'scale',
        onComplete: function() {
            $(document).keydown(onDriveKeyDown);
        }
    });
    $('#multiple-container').transition('show');
}

function submitKancolleData() {
    //Process data here.
    //!FIXME: Add codes here.
    //Launch submit.
    generalLaunchSubmit();
}

function kancolleGenCard() {
    var cardElement=document.createElement('div');
    cardElement.classList.add('ui');
    cardElement.classList.add('card');
    cardElement.classList.add('kancolle-card');
    var cardImage=document.createElement('div');
    cardImage.classList.add('image');
    var cardImageElement=document.createElement('img');
    cardImageElement.setAttribute('src', './static/images/add.png');
    cardImage.appendChild(cardImageElement);
    cardElement.appendChild(cardImage);
    var cardContent=document.createElement('div');
    cardContent.classList.add('content');
    var cardTitle=document.createElement('p');
    cardTitle.classList.add('header');
    cardTitle.innerHTML='Click the card to select image';
    cardContent.appendChild(cardTitle);
    var cardRemove=document.createElement('div');
    cardRemove.classList.add('meta');
    cardRemove.classList.add('kancolle-hidden');
    var cardRemoveAction=document.createElement('a');
    cardRemoveAction.classList.add('date');
    cardRemoveAction.innerHTML='Remove';
    cardRemove.appendChild(cardRemoveAction);
    var cardRemoveId=document.createElement('div');
    cardRemove.appendChild(cardRemoveId);
    cardContent.appendChild(cardRemove);
    cardElement.appendChild(cardContent);
    //Link the empty card to show candidate.
    cardElement.addEventListener('click', kancolleShowCandidate, false);
    return cardElement;
}

function kancolleSecondNextCheck(recordValue) {
    //Check this.
    var recordName=recordValue;
    if(this.nodeType && this.nodeType==1) {
        //Rating widget.
        var widgetName=this.getAttribute('id');
        recordName=widgetName;
        var imageIndex=submitScoreWidgetList.indexOf(this.getAttribute('id'));
        //Save the score.
        submitScoreList[imageIndex]=recordValue*10;
    } else {
        //It must be an jQ object, means it is a slider widget.
        // console.log(submitScoreWidgetList.indexOf(this.name));
        //Change the item name to store the div.
        recordName=this.name;
    }
    //Get the clicked name.
    if(kancolleScoreCounter.indexOf(recordName)==-1) {
        //A new item enabled.
        kancolleScoreCounter.push(recordName);
        if(kancolleScoreCounter.length==kancolleSelectedCount) {
             //Enable the next button.
             document.getElementById('next-step').classList.remove('disabled');
        }
    }
}

function showSecondStageKancolle() {
    submitImageList=[];
    submitScoreList=[];
    //Upate the title text.
    document.getElementById('title-hint-content').innerHTML=testScoreHintText;
    //Remove the event listener from next button.
    var nextButton=document.getElementById('next-step');
    nextButton.removeEventListener('click', showSecondStageKancolle, false);
    nextButton.classList.add('disabled');
    nextButton.addEventListener('click', submitKancolleData, false);
    //Get the list.
    var kancolleList=document.getElementById('multiple-kancolle-container');
    //Get the element list.
    var cardList=kancolleList.children;
    //Remove the last card in the list.
    kancolleList.removeChild(cardList[cardList.length-1]);
    //Get the latest card list.
    cardList=kancolleList.children;
    //Loop from the first card to last card.
    for(var i=0; i<cardList.length; ++i) {
        //Save the images.
        submitImageList.push(testList[i]);
        //Add one empty score to submit widget list.
        submitScoreList.push(0);
        //Get the card.
        var cardElement=cardList[i];
        //Get card content.
        var cardContent=cardElement.children[1];
        //Hide the remove data.
        cardContent.children[1].classList.add('kancolle-hidden');
        var ratingWidgetName='multiple-kancolle-rating-'+i.toString();
        submitScoreWidgetList.push(ratingWidgetName);
        //Generate the rating widget.
        var ratingWidget=createRatingWidget(ratingWidgetName);
        cardContent.appendChild(ratingWidget);
        //Add widget the list item.
        if(testSingleIndex==0){
            $('#'+ratingWidgetName).rating({onRate: kancolleSecondNextCheck});
        } else if (testSingleIndex==1) {
            $('#'+ratingWidgetName).range({
                name: ratingWidgetName,
                min:0,
                max:100,
                start:0,
                onClick: kancolleSecondNextCheck,
                onChange: secondSliderValue
            });
        }
    }
    //Move back to left most.
    $('#multiple-kancolle-container').scrollLeft(0);
    //Save the time.
    secondStageTime=new Date();
}

function kancolleRemoveCard() {
    //Get the item id.
    var candidateItem=document.getElementById(this.children[1].classList[0]);
    //Reset the state of the candidate item.
    candidateItem.classList.remove('selected-item');
    candidateItem.addEventListener('click', kancolleCandidateClick, false);
    //Get the card element.
    var cardElement=this.parentElement.parentElement;
    //Remove the new card.
    document.getElementById('multiple-kancolle-container').removeChild(cardElement);
    //Decrease and update next.
    --kancolleSelectedCount;
    kancolleUpdateNext();
}

function kancolleCandidateClick() {
    //this is now the item we click.
    var cardChildren=kancolleSelectedCard.children;
    var candidateChild=this.children;
    //The first child is the image.
    var cardImage=cardChildren[0];
    cardImage.firstElementChild.setAttribute('src', candidateChild[0].getAttribute('src'));
    //The second child is the content.
    var cardContent=cardChildren[1].children;
    //First child is the title.
    cardContent[0].innerHTML=candidateChild[1].firstElementChild.innerHTML;
    //Second child is remove. Show the remove button.
    var cardRemove=cardContent[1];
    cardRemove.classList.remove('kancolle-hidden');
    cardRemove.addEventListener('click', kancolleRemoveCard, false);
    //Save the id to the card remove.
    cardRemove.children[1].classList.add(this.getAttribute('id'));
    //Remove the connection of the candidate item to select.
    this.removeEventListener('click', kancolleCandidateClick, false);
    this.classList.add('selected-item');
    //Add a new card.
    var newAddCard=kancolleGenCard();
    document.getElementById('multiple-kancolle-container').appendChild(newAddCard);
    var newCardBoundary=newAddCard.getBoundingClientRect();
    // console.log();
    $('#multiple-kancolle-container').scrollLeft(newCardBoundary.left + newCardBoundary.width);
    //Hide dimmer.
    $('#multiple-kancolle-selector').dimmer('hide');
    //Increase and update next.
    ++kancolleSelectedCount;
    kancolleUpdateNext();
}

function kancolleUpdateNext() {
    //Update the next button state.
    var nextButton=document.getElementById('next-step');
    if(kancolleSelectedCount==0) {
        //Disable the next button.
        if(!nextButton.classList.contains('disabled')) {
            nextButton.classList.add('disabled');
        }
    } else {
        if(nextButton.classList.contains('disabled')) {
            nextButton.classList.remove('disabled');
        }
    }
}

function kancolleShowCandidate() {
    //Save the selected card.
    kancolleSelectedCard=this;
    //Remove the connection of the selected card.
    this.removeEventListener('click', kancolleShowCandidate, false);
    //Show the candidate list.
    $('#multiple-kancolle-selector').dimmer('show');
}

function updateKancolle() {
    //Create the empty item.
    var kancolleContainer=document.getElementById('multiple-kancolle-container');
    kancolleContainer.appendChild(kancolleGenCard());
    //Create wating list nodes.
    var candidateList=document.getElementById('multiple-kancolle-content');
    var itemCount=testList.length;
    for(var i=0; i<itemCount; ++i) {
        //Create the kancollec item.
        var candidateItem=document.createElement('div');
        candidateItem.setAttribute('id', 'kancolle-item-'+i.toString());
        candidateItem.classList.add('item');
        candidateItem.classList.add('kancolle-item');
        var candidateImg=document.createElement('img');
        candidateImg.classList.add('ui');
        candidateImg.classList.add('kancolle-candidate-image');
        candidateImg.classList.add('image');
        candidateImg.setAttribute('src', testList[i]);
        candidateItem.appendChild(candidateImg);
        var candidateContent=document.createElement('div');
        candidateContent.classList.add('content');
        var candidateName=document.createElement('p');
        candidateName.classList.add('kancolle-candidate-text');
        candidateName.innerHTML=testTitle+(i+1).toString();
        candidateContent.appendChild(candidateName);
        candidateItem.appendChild(candidateContent);
        candidateList.appendChild(candidateItem);
        //Link the candidate click.
        candidateItem.addEventListener('click', kancolleCandidateClick, false);
    }
    //Link the next button.
    document.getElementById('next-step').addEventListener('click', showSecondStageKancolle, false);
    //Upate the title text.
    document.getElementById('title-hint-content').innerHTML=testHintText;
    //Scrll back to top.
    $('#multiple-kancolle-content').scrollTop(0);
    window.setTimeout(function(){
        $('#multiple-kancolle').transition('show');
        $('#multiple-container').transition('fade down');
        $('#next-step').transition('fade up');
        $('#title-hint-content').transition('fade down');
    }, 500);
}

function startUp() {
    if(testUIIndex==0) {
        updateList();
    } else if(testUIIndex==1) {
        updateGrid();
    } else if(testUIIndex==2) {
        updateDrive();
    } else if(testUIIndex==3) {
        updateKancolle();
    }
    //Save the time.
    startTime=new Date();
}

$(document)
    .ready(startUp);
