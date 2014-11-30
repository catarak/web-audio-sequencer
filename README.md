#Baby's First Web Audio Sequencer

This is my first forray into the world of the Web Audio API! I decided to create a drum sequencer, because, who doesn't love playing with drum machines?

A few references:
* [Shiny Drum Machine](http://chromium.googlecode.com/svn/trunk/samples/audio/shiny-drum-machine.html) - My main inspiration
* [Ember.js Drum Machine](https://github.com/adamjmurray/Ember-Drum-Sequencer) - Another inspiration
* [Virtual Synth Pad Tutorial](http://www.sitepoint.com/html5-web-audio-api-tutorial-building-virtual-synth-pad/) - A great starter tutorial, with a few issues
* [Audio Scheduling](http://www.html5rocks.com/en/tutorials/audio/scheduling/) - An important read on why you need to synchronize to the Web Audio API clock
* [Free Sound](http://www.freesound.org/) - The best place to get free sounds

Due to the need to persist samples, and have associations between Kits, Samples, and so on, I just realized this work work well as a Rails app. 