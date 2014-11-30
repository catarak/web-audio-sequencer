var context;
var noteTime;
var startTime;
var lastDrawTime = -1;
var LOOP_LENGTH = 4;
var rhythmIndex = 0;
var timeoutId;
var testBuffer = null;

$(function() {
  $('.pad').click(function() {
    $(this).toggleClass("selected");
  });
  init();
  handlePlay();
});

function init() {
  context = new webkitAudioContext();
  loadTestBuffer();
}

function loadTestBuffer() {
  var request = new XMLHttpRequest();
  var url = "http://www.freesound.org/data/previews/102/102130_1721044-lq.mp3";
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  request.onload = function() {
    context.decodeAudioData(
      request.response,
      function(buffer) { 
        testBuffer = buffer;
      },
      function(buffer) {
        console.log("Error decoding drum samples!");
      }
    );
  }
  request.send();
}

function sequencePads() {
  $('.pad.selected').each(function() {
    $('.pad').removeClass("selected");
    $(this).addClass("selected");
  });
}

function playNote(buffer, noteTime) {
  var voice = context.createBufferSource();
  voice.buffer = buffer;
  voice.connect(context.destination);
  voice.start(noteTime);
}

function schedule() {
  var currentTime = context.currentTime;

  // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
  currentTime -= startTime;

  while (noteTime < currentTime + 0.200) {
      var contextPlayTime = noteTime + startTime;
      var $currentPad = $("#pad_" + rhythmIndex);

      if ($currentPad.hasClass("selected")) {
        //just need to initialize a buffer
        playNote(testBuffer, contextPlayTime);
      }
      if (noteTime != lastDrawTime) {
          lastDrawTime = noteTime;
          drawPlayhead(rhythmIndex);
      }
      advanceNote();
  }

  timeoutId = setTimeout("schedule()", 0);
}

function drawPlayhead(xindex) {
    var lastIndex = (xindex + LOOP_LENGTH - 1) % LOOP_LENGTH;

    var $newRow = $('#pad_' + xindex);
    var $oldRow = $('#pad_' + lastIndex);
    
    $newRow.addClass("playing");
    $oldRow.removeClass("playing");
}

function advanceNote() {
    // Advance time by a 16th note...
    // var secondsPerBeat = 60.0 / theBeat.tempo;
    var secondsPerBeat = 60.0 / 60.0;
    rhythmIndex++;
    if (rhythmIndex == LOOP_LENGTH) {
        rhythmIndex = 0;
    }
   
    noteTime += 0.25 * secondsPerBeat
    // if (rhythmIndex % 2) {
    //     noteTime += (0.25 + kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    // } else {
    //     noteTime += (0.25 - kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    // }

}

function handlePlay(event) {
    noteTime = 0.0;
    startTime = context.currentTime + 0.005;
    schedule();
}