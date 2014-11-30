function Kit(name) {
  this.SAMPLE_BASE_PATH = "sounds/drum-samples/";
  this.name = name;

  this.kickBuffer = null;
  this.snareBuffer = null;
  this.hihatBuffer = null;

  this.startedLoading = false;
  this.isLoaded = false;
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

  //TEMPORARY
  //kickPath = "http://www.freesound.org/data/previews/102/102130_1721044-lq.mp3";

  this.loadSample(kickPath);


};

//also make a class per buffer/sample? can store prettified name?

//this should definitely be part of a sample class, pass in kit or st
//if we have the name of a sample type, then we can do metaprogramming awesomeness. 
Kit.prototype.loadSample = function(url) {
  //need 2 load asynchronously 
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var kit = this;

  request.onload = function() {
    context.decodeAudioData(
      request.response,
      function(buffer) {
        kit.kickBuffer = buffer;
        kit.isLoaded = true;
      },
      function(buffer) {
        console.log("Error decoding drum samples!");
      }
    );
  }
  request.send();
}