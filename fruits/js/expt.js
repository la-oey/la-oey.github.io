function debugLog(message){
  if(expt.debug){
    console.log(message);
  }
}

var trialData = [];
var expt = {
    name: 'FruityStudy',
    maxTrials: 144,
    maxBlocks: 4,
    numTrialsBlock: 36,
    structure: ["a","b","c","d"],
    debug: false,
    rmse_threshold: 0.5,
    rmse_match: 'color',
    saveURL: 'submit.simple.php',
    sona: {
        experiment_id: 1512,
        credit_token: '04417d3a924f450eb4818b0a73f6c0b0',
    }
};

var trial = {
    block: 0,
    trialNumber: 0,
    trialWithinBlock: 0,
    trialDict: [],
    sent: "",
    order: 0,
    prosody: 0,
    audio: "",
    boxOrder: [],
    selectedBox: "",
    selectedTxt: "",
    startTime: 0,
    audioEndTime: 0,
    responseTime: 0,
    trialTime: 0
};


var setup = {
    stimList: [],
    trialStim: [],
    stimType: "",
    structureIndex: 0,
    sentence: []
}

var client = parseClient();
var stimFinal = [];
var stimFinal2 = [];
var stimList = [];
var stimList2 = [];
var stimFillList = []
var countStim = 0;
var countStim2 = 0;
var countStimFill = 0;
var structInd = sampleInd(0,expt.structure.length - 1); //replace with set list?
var structInd2 = sampleInd(0,expt.structure.length - 1);



function pageLoad(){
    document.getElementById('consent').style.display = 'block';
    $('#continueConsent').attr('disabled',true);
    $('input:radio[name="consent"]').change(
        function(){
            if($(this).is(':checked') && $(this).val()=="yes"){
                $('#continueConsent').attr('disabled',false);
            }
        });
    $('#maxTrials').html(expt.maxTrials);
}

function clickConsent(){
    document.getElementById('consent').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

function clickInstructions(){
    document.getElementById('instructions').style.display = 'none';
    stimList = shuffle(stim.slice(0));
	stimFinal = stimList.slice(0);
    stimList2 = shuffle(stim2.slice(0));
	stimFinal2 = stimList2.slice(0);
    stimFillList = shuffle(stimFill.slice(0));
    stimFinalFill = stimList2.slice(0);
    blockStimList = [];
    exptFullList = [];

    //create list for block here
    for(var i=0; i<stimFinal.length+stimFinal2.length+stimFinalFill.length; i++){
        var sampledLists = [];
        if(stimList.length > 0){
            sampledLists.push("stimList");
        }
        if(stimList2.length > 0){
            sampledLists.push("stimList2");
        }
        if(stimFillList.length > 0){
            sampledLists.push("stimFillList");
        }
        setup.stimType = sample(sampledLists);

        if(setup.stimType == "stimList"){
            setup.trialStim = stimList.slice(0);
            setup.structureIndex = structInd;
            stimList.splice(0,1);
            if(structInd == (expt.structure.length - 1)){
                structInd = 0;
            } else{
                ++structInd;
            }
            
        } else if(setup.stimType == "stimList2"){
            setup.trialStim = stimList2.slice(0);
            setup.structureIndex = structInd2;
            stimList2.splice(0,1);
            if(structInd2 == (expt.structure.length - 1)){
                structInd2 = 0;
            } else{
                ++structInd2;
            }
        } else{
            setup.trialStim = stimFillList.slice(0);
            setup.structureIndex = 0;
            stimFillList.splice(0,1);
        }
        blockStimList.push({'list':setup.stimType, 'structureIndex':setup.structureIndex, 'trialStim':setup.trialStim[0]});
    }
    exptFullList.push(blockStimList);

    var tempBlockStimList = blockStimList.slice(0);
    for(var r=0; r<(expt.maxBlocks-1); r++){
        var newBlockStimList = []
        for(var s=0; s<tempBlockStimList.length; s++){
            var tempStructureIndex = 0;
            if(tempBlockStimList[s]['list'] != 'stimFillList'){
                if(tempBlockStimList[s]['structureIndex'] == (expt.structure.length - 1)){
                    tempStructureIndex = 0;
                } else{
                    tempStructureIndex = tempBlockStimList[s]['structureIndex'] + 1;
                }
            }
            newBlockStimList.push({'list':tempBlockStimList[s]['list'], 'structureIndex':tempStructureIndex, 'trialStim':tempBlockStimList[s]['trialStim']});
        }
        tempBlockStimList = newBlockStimList.slice(0);
        exptFullList.push(newBlockStimList);
    }

    trialStart();
}

function select(cell){
    $('#next').attr('disabled',false);
    if(cell == cellL){
        trial.selectedBox = "left";
        trial.selectedTxt = trial.boxOrder[0];
        $('#cellR').css({'background-color':'white'}); //if cellR previously clicked, unhighlights it
        $('#cellL').css({'background-color':'yellow'});
    } else{
        trial.selectedBox = "right";
        trial.selectedTxt = trial.boxOrder[1];
        $('#cellL').css({'background-color':'white'}); //if cellL previously clicked, unhighlights it
        $('#cellR').css({'background-color':'yellow'});
    }
}

function trialStart(){
    document.getElementById('trial').style.display = 'block';
    $('#next').attr('disabled',true);
    $('#round').html('Round ' + (trial.trialNumber + 1) + " of " + expt.maxTrials);
    $('.cell').css({'background-color':'gray', 'pointer-events':'none'});

    trial.trialDict = exptFullList[trial.block][trial.trialWithinBlock];

    if(trial.trialDict['list'] == 'stimFillList'){
        trial.sent = fillerSent(trial.trialDict['trialStim']);
    } else{
        trial.sent = sentence(trial.trialDict['trialStim'],expt.structure[trial.trialDict['structureIndex']]);
    }
    trial.order = trial.sent['order'];
    trial.prosody = trial.sent['prosody'];
    trial.audio = trial.sent['audio'];
    
    $('#stimTxt').html(trial.sent['txt']); 
	
    trial.boxOrder = shuffle([trial.trialDict['trialStim']['adj1'], trial.trialDict['trialStim']['adj2']]);   
    $('#txtL').html(trial.boxOrder[0]);
    $('#txtR').html(trial.boxOrder[1]);

    trial.startTime = new Date().getTime();
}

function trialDone(){
    document.getElementById('trial').style.display = 'none';
    trial.responseTime = new Date().getTime() - trial.audioEndTime;
    trial.trialTime = new Date().getTime() - trial.startTime;

    // record what the subject said
    trialData.push({
        trialNumber: trial.trialNumber, //{0:143}
        blockNumber: trial.block, //{0:3}
        trialInBlock: trial.trialWithinBlock, //{0:35}
        stimType: trial.trialDict['list'], //{stimList, stimList2, stimFillList}
        structureIndex: expt.structure[trial.trialDict['structureIndex']], //{a, b, c, d}
        produce: trial.trialDict['trialStim']['produce'],
        adjFirst: trial.sent['adjFirst'], //1st adj in sentence
        adjSecond: trial.sent['adjSecond'], //2nd adj in sentence
        nounPhrase: trial.sent['txt'],
        fullSentence: $('#sentence').text(),
        order: trial.order,
        prosody: trial.prosody,
        audio: trial.audio,
        boxLeft: trial.boxOrder[0],
        boxRight: trial.boxOrder[1],
        selectedBox: trial.selectedBox,
        selectedTxt: trial.selectedTxt,
        responseTime: trial.responseTime,
        trialTime: trial.trialTime
    });
    // increment the trialNumber
    ++trial.trialNumber;
    ++trial.trialWithinBlock;
    if(trial.trialNumber % expt.numTrialsBlock == 0){
        trial.trialWithinBlock = 0;
        ++trial.block;
    }
    
    // if we are done with all trials, then go to completed page
    if(trial.trialNumber >= expt.maxTrials){
        // these lines write to server
        debugLog(trialData);
        debugLog(client);
        data = {client: client, trials: trialData};
        writeServer(data);
        document.getElementById('trial').style.display = 'none';
        document.getElementById('completed').style.display = 'block';
    }
    else {
        trialStart();
    }
}

function experimentDone(){
    submitExternal(client);
}


function shuffle(array){
 	var tornado = array.slice(0);
  	var return_array = [];
  	for(var i=0; i<array.length; i++){
		var randomIndex = Math.floor(Math.random()*tornado.length);
    	return_array.push(tornado.splice(randomIndex, 1)[0]);
	}
  	return return_array;   
}

function sample(array){
    return(array[Math.floor(Math.random() * array.length)]);
}

function sampleInd(min, max){
    return(Math.floor(Math.random() * (max - min)) + min);
}