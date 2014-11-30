var NUM_INSTRUMENTS = 2;

function Kit(name) {
  this.SAMPLE_BASE_PATH = "sounds/drum-samples/";
  this.name = name;

  this.kickBuffer = null;
  this.snareBuffer = null;
  this.hihatBuffer = null;

  this.startedLoading = false;
  this.isLoaded = false;
  this.instrumentLoadCount = 0;
}

Kit.prototype.pathName = function() {
  return this.SAMPLE_BASE_PATH + this.name + "/";
};

Kit.prototype.load = function() {
  if (this.startedLoading) {
    return;
  }

  this.startedLoading = true;

  var pathName = this.pathName();

  //don't want to have set number of instruments, or whatever
  var kickPath = pathName + "kick.mp3";
  var snarePath = pathName + "snare.mp3";
  var hihatPath = pathName + "hihat.mp3";

  this.loadSample(kickPath, "kick");
  this.loadSample(snarePath, "snare");
  this.loadSample(hihatPath, "hihat");
};

//also make a class per buffer/sample? can store prettified name?

//this should definitely be part of a sample class, pass in kit or st
//if we have the name of a sample type, then we can do metaprogramming awesomeness. 
Kit.prototype.loadSample = function(url, instrumentName) {
  //need 2 load asynchronously 
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var kit = this;

  request.onload = function() {
    context.decodeAudioData(
      request.response,
      function(buffer) {
        switch (instrumentName) {
          case "kick":
            kit.kickBuffer = buffer;
            break;
          case "snare":
            kit.snareBuffer = buffer;
            break;
          case "hihat":
            kit.hihatBuffer = buffer;
            break;
        }
        kit.instrumentLoadCount++;
        if (kit.instrumentLoadCount === NUM_INSTRUMENTS) {
          kit.isLoaded = true;
        }
      },
      function(buffer) {
        console.log("Error decoding drum samples!");
      }
    );
  }
  request.send();
}