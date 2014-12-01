//audio node variables
var context;
var convolver;
var compressor;
var masterGainNode;
var effectLevelNode;
var lowPassFilterNode;

var noteTime;
var startTime;
var lastDrawTime = -1;
var LOOP_LENGTH = 4;
var rhythmIndex = 0;
var timeoutId;
var testBuffer = null;

var currentKit = null;

if (window.hasOwnProperty('AudioContext') && !window.hasOwnProperty('webkitAudioContext')) {
  window.webkitAudioContext = AudioContext;
}

$(function() {
  init();
  toggleSelectedListener();
  playPauseListener();
  lowPassFilterListener();
  createLowPassFilterSliders();
});

function createLowPassFilterSliders() {
  $("#freq-slider").slider({
    value: 1,
    min: 0,
    max: 1,
    step: 0.01,
    disabled: true,
    slide: changeFrequency
  });
  $("#quality-slider").slider({
    value: 0,
    min: 0,
    max: 1,
    step: 0.01,
    disabled: true,
    slide: changeQuality
  });
}

function lowPassFilterListener() {
  $('#lpf').click(function() {
    $(this).toggleClass("active");
    $(this).blur();
    if ($(this).hasClass("btn-default")) {
      $(this).removeClass("btn-default");
      $(this).addClass("btn-warning");
      lowPassFilterNode.active = true;
      $("#freq-slider,#quality-slider").slider( "option", "disabled", false );
    }
    else {
      $(this).addClass("btn-default");
      $(this).removeClass("btn-warning");
      lowPassFilterNode.active = false;
      $("#freq-slider,#quality-slider").slider( "option", "disabled", true );
    }
  })
}

function changeFrequency(event, ui) {
  var minValue = 40;
  var maxValue = context.sampleRate / 2;
  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  var multiplier = Math.pow(2, numberOfOctaves * (ui.value - 1.0));
  lowPassFilterNode.frequency.value = maxValue * multiplier;
}

function changeQuality(event, ui) {
  //30 is the quality multiplier, for now. 
  lowPassFilterNode.Q.value = ui.value * 30;
}

function playPauseListener() {
  $('#play-pause').click(function() {
    var $span = $(this).children("span");
    if($span.hasClass('glyphicon-play')) {
      $span.removeClass('glyphicon-play');
      $span.addClass('glyphicon-pause');
      handlePlay();
    } 
    else {
      $span.addClass('glyphicon-play');
      $span.removeClass('glyphicon-pause');
      handleStop();
    }
  });
}

function toggleSelectedListener() {
  $('.pad').click(function() {
    $(this).toggleClass("selected");
  });
}

function init() {
  initializeAudioNodes();
  loadKits();
}

function initializeAudioNodes() {
  context = new webkitAudioContext();
  var finalMixNode;
  if (context.createDynamicsCompressor) {
      // Create a dynamics compressor to sweeten the overall mix.
      compressor = context.createDynamicsCompressor();
      compressor.connect(context.destination);
      finalMixNode = compressor;
  } else {
      // No compressor available in this implementation.
      finalMixNode = context.destination;
  }


  // Create master volume.
  // for now, the master volume is static, but in the future there will be a slider
  masterGainNode = context.createGain();
  masterGainNode.gain.value = 0.7; // reduce overall volume to avoid clipping
  masterGainNode.connect(finalMixNode);

  //connect all sounds to masterGainNode to play them

  //don't need these for now, but soon I'll add reverb
  // // Create effect volume.
  // effectLevelNode = context.createGain();
  // effectLevelNode.gain.value = 1.0; // effect level slider controls this
  // effectLevelNode.connect(masterGainNode);

  // // Create convolver for effect
  // convolver = context.createConvolver();
  // convolver.connect(effectLevelNode);

  //Create Low Pass Filter
  lowPassFilterNode = context.createBiquadFilter();
  //this is for backwards compatibility, the type used to be an integer
  lowPassFilterNode.type = (typeof lowPassFilterNode.type === 'string') ? 'lowpass' : 0; // LOWPASS
  //default value is max cutoff, or passing all frequencies
  lowPassFilterNode.frequency.value = context.sampleRate / 2;
  lowPassFilterNode.connect(masterGainNode);
  lowPassFilterNode.active = false;
}

function loadKits() {
  //name must be same as path
  var kit = new Kit("TR808");
  kit.load();

  //TODO: figure out how to test if a kit is loaded
  currentKit = kit;

}


//TODO delete this
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

//TODO delete this
function sequencePads() {
  $('.pad.selected').each(function() {
    $('.pad').removeClass("selected");
    $(this).addClass("selected");
  });
}

function playNote(buffer, noteTime) {
  var voice = context.createBufferSource();
  voice.buffer = buffer;
  //change THIS to add reverb and stuff

  //add button to turn Filter on and off
  if (lowPassFilterNode.active) {
    voice.connect(lowPassFilterNode); 
  }
  else {
    voice.connect(masterGainNode);
  }
  voice.start(noteTime);
}

function schedule() {
  var currentTime = context.currentTime;

  // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
  currentTime -= startTime;

  while (noteTime < currentTime + 0.200) {
      var contextPlayTime = noteTime + startTime;
      var $currentPads = $(".column_" + rhythmIndex);
      $currentPads.each(function() {
        if ($(this).hasClass("selected")) {
          var instrumentName = $(this).parent().data("instrument");
          switch (instrumentName) {
          case "kick":
            playNote(currentKit.kickBuffer, contextPlayTime);
            break;
          case "snare":
            playNote(currentKit.snareBuffer, contextPlayTime);
            break;
          case "hihat":
            playNote(currentKit.hihatBuffer, contextPlayTime);
            break;
        }
          //play the buffer
          //store a data element in the row that tells you what instrument
        }
      });
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

    //can change this to class selector to select a column
    var $newRows = $('.column_' + xindex);
    var $oldRows = $('.column_' + lastIndex);
    
    $newRows.addClass("playing");
    $oldRows.removeClass("playing");
}

function advanceNote() {
    // Advance time by a 16th note...
    // var secondsPerBeat = 60.0 / theBeat.tempo;
    var secondsPerBeat = 60.0 / 60.0;
    rhythmIndex++;
    if (rhythmIndex == LOOP_LENGTH) {
        rhythmIndex = 0;
    }
   
    //0.25 because each square is a 16th note
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

function handleStop(event) {
  clearTimeout(timeoutId);
  rhythmIndex = 0;
  $(".pad").removeClass("playing");
}