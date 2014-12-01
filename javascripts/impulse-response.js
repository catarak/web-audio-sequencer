function ImpulseResponse(url) {
  this.url = url;
  this.startedLoading = false;
  this.isLoaded = false;
  this.buffer = null;
}

ImpulseResponse.prototype.load = function() {
  if (this.startedLoading) {
    return;
  }

  var request = new XMLHttpRequest();
  request.open("GET", this.url, true);
  request.responseType = "arraybuffer";
  this.request = request;
  
  var asset = this;

  this.startedLoading = true;
  request.onload = function() {
    context.decodeAudioData(
      request.response,
      function(buffer) {
        asset.buffer = buffer;
        asset.isLoaded = true;              
      },
      function(buffer) {
        console.log("Error decoding impulse response!");
      }
    );
  }
  request.send();
};