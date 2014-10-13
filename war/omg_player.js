if (typeof omg != "object")
	omg = {};

(function setupPlayer() {

    var p = {playing: false, loadedSounds: {}};
    omg.player = p;

    if (!window.AudioContext)
        window.AudioContext = window.webkitAudioContext;

    try {
        p.context = new AudioContext();
        if (!p.context.createGain) 
            p.context.createGain = p.context.createGainNode;

    }
    catch (e) {
        document.getElementById("no-web-audio").style.display = "block";
        return;
    }

    p.onBeatPlayedListeners = [];

    p.iSubBeat = 0;
    p.loopStarted = 0;

    p.beats = 8;
    p.subbeats = 4;
    
    p.nextUp = null;
    
    p.play = function (song) {

    	p.prepareSong(song);
    	
    	if (p.playing) {
    		p.nextUp = song;
    		return p.playingIntervalHandle;
    	}
		p.song= song;

		
        p.song.playingSection = 0;
    
        if (!p.song.sections || !p.song.sections.length){
        	console.log("no sections to play()");
        	return -1;
    	}
        
        p.playing = true;
        p.loopStarted = Date.now();
        p.iSubBeat = 0;

    	//todo this bpm thing isn't consistent
        var beatsPerSection = p.beats * p.subbeats;
    	p.subbeatLength = song.subbeatMillis || 125; 
    	
    	p.playingIntervalHandle = setInterval(function() {
            p.playBeat(p.song.sections[p.song.playingSection], 
            		p.iSubBeat);

            p.iSubBeat++;
            if (p.iSubBeat == beatsPerSection) {
            
                p.iSubBeat = 0;
                p.loopStarted = Date.now();
                p.song.playingSection++;
                
                if (p.nextUp) {
                	p.song = p.nextUp;
                	p.song.playingSection = 0;
                	p.nextUp = null;
                }
                
                if (p.song.playingSection >= p.song.sections.length) {
                	if (p.song.loop) {
                		p.song.playingSection = 0;
                	}
                	else {
                		p.stop();
                	}
                }
            }
    		
    	}, p.subbeatLength);

        // ??
        p.songStarted = p.loopStarted;
        
        if (typeof(p.onPlay) == "function") {
        	p.onPlay();
        }
        
        return p.playingIntervalHandle;
    };

    p.stop = function () {
    	clearInterval(p.playingIntervalHandle);
    	p.playing = false;
    	
        if (typeof(p.onStop) == "function") {
        	p.onStop();
        }

    };
    
    p.loadPart = function (part, data) {

        part.currentI = -1;
        part.nextBeat = 0;
        part.soundsLoading = 0;
    	part.loaded = false;
        if (data.type == "DRUMBEAT") {
            var soundsAlreadyLoaded = 0;
    	    // backwards compat: track array was called data early on
    	    if (!data.tracks && data.data) {
    	        data.tracks = data.data;
    	        delete data.data;
    	    }
            var tracks = data.tracks;
            //fixSound(tracks, data.kit);
            for (var i = 0; i < tracks.length; i++) {
            	if (!tracks[i].sound) {
            		soundsAlreadyLoaded++;
            	}
            	else if (p.loadedSounds[tracks[i].sound]) {
                    //tracks[i].audio = p.loadedSounds[tracks[i].sound];
                    soundsAlreadyLoaded++;
                }
                else {
                    p.loadSound(tracks[i].sound, part);
                }
            }
            if (soundsAlreadyLoaded == tracks.length) {
            	part.loaded = true;
            }
        }
        if (data.type == "MELODY" || data.type == "BASSLINE") {

        	var rootNote;
        	var ascale;
        	//if (p.arrangement.data.rootNote != undefined) {
        	//	rootNote = p.arrangement.data.rootNote;
        	//}
        	//else {
        		//backwards compat, rootNote was misspelled rooteNote
        		if (data.rooteNote != undefined && data.rootNote == undefined) {
        			data.rootNote = data.rooteNote;
        			delete data.rooteNote;
        		}
        		rootNote = data.rootNote % 12;
        	//}

        	//if (p.arrangement.data.ascale != undefined) {
        	//	ascale = p.arrangement.data.ascale;
        	//}
        	//else {
        		if (!data.ascale && data.scale) {
        			data.ascale = omg.util.splitInts(data.scale);
        		}
        		ascale = data.ascale;
        	//}
			p.rescale(data, rootNote, ascale);
			
			if (typeof data.sound == "string" &&
					data.sound.indexOf("PRESET_") == 0) {
				p.setupPartWithSoundSet(p.getPresetSoundSet(data.sound), part);
			}
        	var soundsToLoad = 0;
	
		    for (var ii = 0; ii < data.notes.length; ii++) {
			    note = data.notes[ii];
			
			    if (note.rest)
				    continue;
			    
			    if (!note.sound)
				    continue;
			
                if (p.loadedSounds[note.sound]) 
				    continue;

                soundsToLoad++;
                p.loadSound(note.sound, part);
    		}
		
            if (soundsToLoad == 0) {
            	part.loaded = true;
        	}

        }
        if (data.type == "CHORDPROGRESSION") {
        	part.loaded = true;
        }
        
        if (data.volume == undefined) {
        	data.volume = 0.6;
        }
        
    };

        
    p.setNewBpm =  function (bpm) {
    	if (bpm > 40 && bpm < 300) {
    		omg.bpm = bpm;

        	if (p.intervalHandle && p.playing) {
        		clearInterval(p.intervalHandle);
            	p.go();        		
        	}
    	}
    };
    
    p.playWhenReady = function (sections) {
    	var allReady = true;

    	for (var i = 0; i < sections.length; i++) {
        	for (var j = 0; j < sections[i].parts.length; j++) {
        		if (!sections[i].parts[j].loaded) {
        			allReady = false;
        			omg.util.d("section " + i + " part " + j + " is not ready");
        		}
            }
    	}
    	if (!allReady) {
    		setTimeout(function () {
    			p.playWhenReady(sections);
    		}, 600);
    	}
    	else {
    		p.play(sections);
    	}
    };

    p.prepareSong = function (song) {
    	
    	var section;
    	var part;

        for (var isection = 0; isection < song.sections.length; isection++) {
        	
        	section = song.sections[isection];
            for (var ipart = 0; ipart < section.parts.length; ipart++) {
            	part = section.parts[ipart];
            	p.loadPart(part, part.data);
            }
        }
    };

    /*p.prepareArrangementData = function (arrangement) {
    	var rawSection;
    	var section;
    	var rawPart;
    	var part;
    	
    	var parrangement = {raw: arrangement, sections: []};

        for (var isection = 0; isection < arrangement.sections.length; isection++) {
        	
        	rawSection = arrangement.sections[isection];
        	section = {raw: rawSection, parts: []};

            for (var ipart = 0; ipart < rawSection.parts.length; ipart++) {
            	rawPart = rawSection.parts[ipart];
            	part = {raw: rawPart, nextBeat: 0, currentI: -1};
            	section.parts.push(part);

            	p.loadPart(part, rawPart);
            }
        	parrangement.sections.push(section);
        }
        parrangement.prepared = true;
        return parrangement;
    };*/
        
    p.playBeat = function (section, iSubBeat) {
        for (var ip = 0; ip < section.parts.length; ip++) {
            p.playBeatForPart(iSubBeat, section.parts[ip]);
        }
        
        for (var il = 0; il < p.onBeatPlayedListeners.length; il++) {
            p.onBeatPlayedListeners[il].call(null, iSubBeat);
        }

    };

    p.playBeatForPart = function (iSubBeat, part) {
        if (part.data.type == "DRUMBEAT") {
            p.playBeatForDrumPart(iSubBeat, part);        
        }
        if (part.data.type == "MELODY" || part.data.type == "BASSLINE") {
            p.playBeatForMelody(iSubBeat, part);        
        }
    };

    p.playBeatForDrumPart = function (iSubBeat, part) {
        var tracks = part.data.tracks;

    	if (part.muted)
    		return;

        for (var i = 0; i < tracks.length; i++) {
            if (tracks[i].data[iSubBeat]) {
            	p.playSound(tracks[i].sound, part.data.volume);
            }
        }
    };

    p.playBeatForMelody = function (iSubBeat, part) {

    	var data = part.data;
    	var beatToPlay = iSubBeat;
        if (iSubBeat == 0) {
        	if (part.currentI === -1 || part.currentI === data.notes.length) {
        		part.currentI = 0;
        		part.nextBeat = 0;
        		part.loopedBeats = 0;
        	}
        	else {
        		if (!part.loopedBeats) part.loopedBeats = 0;
    			part.loopedBeats += 32;
        	}
        }

        if (part.loopedBeats) {
        	beatToPlay += part.loopedBeats;
        }

        if (beatToPlay == part.nextBeat) {
            var note = data.notes[part.currentI];
            
//            if (part.soundset) {
        	if (note && note.sound) {
        	    if (!part.muted) {
            		p.playNote(note, part, data);
        		}
            }
            else {
                if (!part.osc) {
                	p.makeOsc(part);
                }

                if (!note || note.rest)
                    part.osc.frequency.setValueAtTime(0, 0);
                else {
                	
                	var freq = p.makeFrequency(note.scaledNote);
                	part.osc.frequency.setValueAtTime(freq, 0);
                	part.playingI = part.currentI;
                	var playingI = part.playingI;
                	setTimeout(function () {
                		if (part.playingI == playingI) {
                			part.osc.frequency.setValueAtTime(0, 0);
                		}
                	}, p.subbeats * note.beats * p.subbeatLength * 0.85);
                }
            }
        	
            if (note) {
                part.nextBeat += p.subbeats * note.beats;
                part.currentI++;
            }
        }
    };
    
    p.makeOsc = function (part) {
    		
		if (part.osc) {
			try {
				part.osc.stop(0);
				part.osc.disconnect(part.gain);
				part.gain.disconnect(p.context.destination);
			}
			catch (e) {}
		}

		part.osc = p.context.createOscillator();

	    if (part.data.type == "BASSLINE") {
	        part.osc.type = part.osc.SAWTOOTH || "sawtooth";
	    }

	    part.gain = p.context.createGain();
	    part.osc.connect(part.gain);
	    part.gain.connect(p.context.destination);
	    
	    if (part.muted) {
	    	part.gain.gain.value = 0;
	    	part.gain.gain.preMuteGain = 0.15;
	    }
	    else {
	        part.gain.gain.value = 0.15;    	
	    }
	 
	    part.osc.frequency.setValueAtTime(0, 0);
	    if (part.osc.start)
	        part.osc.start(0);
	    else 
	        part.osc.noteOn(0);
	    part.oscStarted = true;

    };
    
    p.makeFrequency = function (mapped) {
        return Math.pow(2, (mapped - 69.0) / 12.0) * 440.0;
    };
    
    p.initSound = function () {
        p.playedSound = true;
        var osc = p.context.createOscillator();
        osc.connect(p.context.destination);
        osc.frequency.setValueAtTime(0, 0);
        if (osc.start) {
            osc.start(0);
        }
        else {
            osc.noteOn(0);
        }
        setTimeout(function () {
            if (osc.stop) {
                osc.stop(0);
            }
            else {
                osc.noteOff(0);
            }
            osc.disconnect(p.context.destination);

        }, 500);
    };

    p.playSound = function (sound, volume) {
        if (omg.player.loadedSounds[sound] && 
        		omg.player.loadedSounds[sound] !== "loading") {
        	    	
            var source = omg.player.context.createBufferSource();
            source.buffer = omg.player.loadedSounds[sound];                   
            //source.connect(omg.player.context.destination);
            if (source.start)
                source.start(0);
            else {
            	source.noteOn(0);
            	source.stop = function () {
            		source.noteOff(0);
            	};
            } 

            source.gain2 = omg.player.context.createGain();
            source.connect(source.gain2);
            source.gain2.connect(omg.player.context.destination);
            
            source.gain2.gain.value = volume; 

            return source;
        }
    };

    p.loadSound = function (sound, part) {

        if (!sound || !omg.player.context) {
            return;
        }

        var key = sound;
        var url = sound;
        if (sound.indexOf("PRESET_") == 0) {
            url = "audio/" + sound.substring(7).toLowerCase() + ".mp3";
        }
        
        omg.player.loadedSounds[key] = "loading";
        
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        part.soundsLoading++;

        // Decode asynchronously
        request.onload = function() {
            omg.player.context.decodeAudioData(request.response, function(buffer) {
                omg.player.loadedSounds[key] = buffer;
                p.onSoundLoaded(true, part);
            }, function () {
                omg.util.d("error :(");
                p.onSoundLoaded(false, part);
            });
        }
        request.send();

    };

    p.onSoundLoaded = function (success, part) {

        part.soundsLoading--;
        if (part.soundsLoading < 1) {
        	part.loaded = true;
        }
    };
    
    p.rescale = function (data, rootNote, scale) {

    	var octaveShift = data.octave || data.octaveShift;
    	var octaves2;
    	if (isNaN(octaveShift)) 
    		octaveShift = data.type == "BASSLINE" ? 3 : 5;
    	var newNote;
    	var onote;
    	var note;
    	
    	for (var i = 0; i < data.notes.length; i++) {
    		octaves2 = 0;
    		
    		onote = data.notes[i];
    		newNote = onote.note;
    		while (newNote >= scale.length) {
    			newNote = newNote - scale.length;
    			octaves2++;
    		}
    		while (newNote < 0) {
    			newNote = newNote + scale.length;
    			octaves2--;
    		}
    		
    		newNote = scale[newNote] + octaves2 * 12 + octaveShift * 12 + rootNote;

    		onote.scaledNote = newNote;
    	}
    	
    };

    p.setupPartWithSoundSet = function (ss, part, load) {

    	if (!ss)
    		return;
    	
    	//part.soundset = ss;
    	var note;
    	var noteIndex;
    	
    	var prefix = ss.data.prefix || "";
    	var postfix = ss.data.postfix || "";

    	console.log(ss);
    	for (var ii = 0; ii < part.data.notes.length; ii++) {
    		note = part.data.notes[ii];
    		
    		if (note.rest)
    			continue;

    		noteIndex = note.scaledNote - ss.bottomNote;
    		if (noteIndex < 0) {
    			noteIndex = noteIndex % 12 + 12;
    		}
    		else {
    			while (noteIndex >= ss.data.data.length) {
    				noteIndex = noteIndex - 12;
    			}
    		}

    		note.sound = prefix + ss.data.data[noteIndex].url + postfix;

    		if (!note.sound)
    			continue;
    		
            if (load && !p.loadedSounds[note.sound]) {
                p.loadSound(note.sound, part);
            }
    	}

    };

    p.getPresetSoundSet = function (preset) {
    	var oret;
    	if (preset == "PRESET_SYNTH1") {
    		oret = {"name" : "Keyboard", 
    				"id" : -101, "bottomNote" : 33, 
    				"data" : {"name":"PRESET_SYNTH1",
    				"data":[
    		        {"url":"a1","caption":"A1"},{"url":"bf1","caption":"Bb1"},{"url":"b1","caption":"B1"},{"url":"c2","caption":"C2"},{"url":"cs2","caption":"C#2"},{"url":"d2","caption":"D2"},
    		    	{"url":"ds2","caption":"D#2"},{"url":"e2","caption":"E3"},{"url":"f2","caption":"F2"},{"url":"fs2","caption":"F#2"},{"url":"g2","caption":"G2"},{"url":"gs2","caption":"G#2"},
    		        {"url":"a2","caption":"A2"},{"url":"bf2","caption":"Bb2"},{"url":"b2","caption":"B2"},{"url":"c3","caption":"C3"},{"url":"cs3","caption":"C#3"},{"url":"d3","caption":"D3"},
    		        {"url":"ds3","caption":"D#3"},{"url":"e3","caption":"E3"},{"url":"f3","caption":"F3"},{"url":"fs3","caption":"F#3"},{"url":"g3","caption":"G3"},{"url":"gs3","caption":"G#3"},
    		        {"url":"a3","caption":"A3"},{"url":"bf3","caption":"Bb3"},{"url":"b3","caption":"B3"},{"url":"c4","caption":"C4"},{"url":"cs4","caption":"C#4"},{"url":"d4","caption":"D4"},
    		        {"url":"ds4","caption":"D#4"},{"url":"e4","caption":"E4"},{"url":"f4","caption":"F4"},{"url":"fs4","caption":"F#4"},{"url":"g4","caption":"G4"},{"url":"gs4","caption":"G#4"},
    		        {"url":"a4","caption":"A4"},{"url":"bf4","caption":"Bb4"},{"url":"b4","caption":"B4"},{"url":"c5","caption":"C5"},{"url":"cs5","caption":"C#5"},{"url":"d5","caption":"D5"},
    	        	{"url":"ds5","caption":"D#5"},{"url":"e5","caption":"E5"},{"url":"f5","caption":"F5"},{"url":"fs5","caption":"F#5"},{"url":"g5","caption":"G5"},{"url":"gs5","caption":"G#5"},		
    		        {"url":"a5","caption":"A5"},{"url":"bf5","caption":"Bb5"},{"url":"b5","caption":"B5"},{"url":"c6","caption":"C6"},{"url":"cs6","caption":"C#6"},{"url":"d6","caption":"D6"},
    		        {"url":"ds6","caption":"D#6"},{"url":"e6","caption":"E6"},{"url":"f6","caption":"F6"},{"url":"fs6","caption":"F#6"},{"url":"g6","caption":"G6"},{"url":"gs6","caption":"G#6"},
    	        	{"url":"a6","caption":"A6"}
    		        ],
    		        "prefix":"https://dl.dropboxusercontent.com/u/24411900/omg/kb/kb1_",
    		        "postfix":".mp3","bottomNote":33} };
    		if (omg.dev) {
    			oret.data.prefix = "http://localhost/mp3/kb/kb1_";
    		}
    	}
    	if (preset == "PRESET_GUITAR1") {
    		oret = {"name" : "Electric Guitar", 
    			"id" : -201, "bottomNote" : 40, 
    			"data" : {"name":"PRESET_GUITAR1",
    			"data":[
    	        {"url":"e","caption":"E2"},{"url":"f","caption":"F2"},{"url":"fs","caption":"F#2"},{"url":"g","caption":"G2"},{"url":"gs","caption":"G#2"},{"url":"a","caption":"A2"},
    	    	{"url":"bf","caption":"Bb2"},{"url":"b","caption":"B2"},{"url":"c","caption":"C3"},{"url":"cs","caption":"C#3"},{"url":"d","caption":"D3"},{"url":"ds","caption":"D#3"},
    	        {"url":"e2","caption":"E3"},{"url":"f2","caption":"F3"},{"url":"fs2","caption":"F#2"},{"url":"g2","caption":"G2"},{"url":"gs2","caption":"G#2"},{"url":"a2","caption":"A3"},
    	    	{"url":"bf2","caption":"Bb3"},{"url":"b2","caption":"B3"},{"url":"c2","caption":"C4"},{"url":"cs2","caption":"C#4"},{"url":"d2","caption":"D4"},{"url":"ds2","caption":"D#4"},
    	        {"url":"e3","caption":"E4"},{"url":"f3","caption":"F4"},{"url":"fs3","caption":"F#4"},{"url":"g3","caption":"G4"},{"url":"gs3","caption":"G#4"},{"url":"a3","caption":"A4"},
    	    	{"url":"bf3","caption":"Bb4"},{"url":"b3","caption":"B4"},{"url":"c3","caption":"C5"},{"url":"cs3","caption":"C#5"},{"url":"d3","caption":"D5"},{"url":"ds3","caption":"D#5"},
    	        {"url":"e4","caption":"E5"},{"url":"f4","caption":"F5"},{"url":"fs4","caption":"F#5"},{"url":"g4","caption":"G5"},{"url":"gs4","caption":"G#5"},{"url":"a4","caption":"A5"},
    	    	{"url":"bf4","caption":"Bb5"},{"url":"b4","caption":"B5"},{"url":"C4","caption":"C6"},{"url":"cs4","caption":"C#6"}
    	        ],
    	        "prefix":"https://dl.dropboxusercontent.com/u/24411900/omg/electric/electric_",
    	        "postfix":".mp3","bottomNote":40} };
    		if (omg.dev) {
//    			oret.data.prefix = "http://localhost/mp3/kb/kb1_";
    		}
    	}
    	if (preset == "PRESET_BASS") {
    		oret = {"name" : "Bass1", "id" : 1540004, "bottomNote" : 28, 
    				"data" : {"name":"Bass1","data":[
                     {"url":"e","caption":"E2"},{"url":"f","caption":"F2"},{"url":"fs","caption":"F#2"},{"url":"g","caption":"G2"},{"url":"gs","caption":"G#2"},{"url":"a","caption":"A2"},
                     {"url":"bf","caption":"Bb2"},{"url":"b","caption":"B2"},{"url":"c","caption":"C3"},{"url":"cs","caption":"C#3"},{"url":"d","caption":"D3"},{"url":"ds","caption":"Eb3"},
                     {"url":"e2","caption":"E3"},{"url":"f2","caption":"F3"},{"url":"fs2","caption":"F#3"},{"url":"g2","caption":"G3"},{"url":"gs2","caption":"G#3"},{"url":"a2","caption":"A3"},
                     {"url":"bf2","caption":"Bb3"},{"url":"b2","caption":"B3"},{"url":"c2","caption":"C4"}
                     ],"prefix": "https://dl.dropboxusercontent.com/u/24411900/omg/bass1/bass_",
                     "postfix": ".mp3",
                     "bottomNote":19} };
    		
    		if (omg.dev) {
    			oret.data.prefix = "http://localhost/mp3/bass_";
    		}
    	}

    	return oret;
    };
    
    p.playNote = function (note, part, data) {

    	var audio = p.playSound(note.sound, data.volume);
    	var fromNow = (note.beats * 4 * p.subbeatLength)/1000;

    	//setTimeout(function () {
    	//	fadeOut(audio.gain2.gain, function () {
    	//		audio.stop(0);
    	//	});
    	//}, fromNow - 100);

    	if (audio)
    		audio.stop(p.context.currentTime + fromNow * 0.98);
    	
        if (part)
        	part.currentAudio = audio;
    };


    p.playSound = function (sound, volume) {
        if (p.loadedSounds[sound] && 
        		p.loadedSounds[sound] !== "loading") {
        	    	
            var source = p.context.createBufferSource();
            source.buffer = p.loadedSounds[sound];                   
            //source.connect(omg.player.context.destination);
            if (source.start)
                source.start(0);
            else {
            	source.noteOn(0);
            	source.stop = function () {
            		source.noteOff(0);
            	};
            } 

            source.gain2 = p.context.createGain();
            source.connect(source.gain2);
            source.gain2.connect(p.context.destination);
            
            source.gain2.gain.value = volume; 

            return source;
        }
    };

})();

function OMGSong(div) {
	this.div = div;
	this.data = {type: "SONG"};
	this.sections = [];
	
	// key? tempo? yes, we need that shit
};

function OMGSection(div) {
	this.div = div;
	this.data = {type: "SECTION"};
	this.parts = [];
	
	// key? tempo? we need it here too, I guess
}

function OMGDrumpart(div) {
	this.div = div;	
	
	this.data = {"type":"DRUMBEAT","bpm":120,"kit":0,
		    isNew: true,
			"tracks":[{"name":"kick","sound":"PRESET_HH_KICK",
			"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
	        {"name":"snare","sound":"PRESET_HH_CLAP",
        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
	        {"name":"closed hi-hat","sound":"PRESET_ROCK_HIHAT_CLOSED",
        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
	        {"name":"open hi-hat","sound":"PRESET_HH_HIHAT",
        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
	        {"name":"tambourine","sound":"PRESET_HH_TAMB",
        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},
	        {"name":"scratch","sound":"PRESET_HH_SCRATCH",
        	"data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        	        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
	      ]}
	
	// key? tempo? we need it here too, I guess
	
}

function OMGPart(div) {
	this.div = div;
	this.data = {type: "MELODY", notes: []};
		
	// key? tempo? we need it here too, I guess
	
}


//this is cuz a way early bug in OMG Drums not using the right sound names
// but its not being called (as of press time)
omg.player.fixSound  = function (tracks, kit) {	
    if (tracks.length == 8 && tracks[0].sound == "PRESET_HH_KICK"
        && tracks[1].sound == "PRESET_HH_KICK"
            && tracks[2].sound == "PRESET_HH_KICK") {

        tracks[0].sound = kit == 0 ? "PRESET_HH_KICK" : "PRESET_ROCK_KICK"; 
        tracks[1].sound = kit == 0 ? "PRESET_HH_CLAP" : "PRESET_ROCK_SNARE";
        tracks[2].sound = "PRESET_ROCK_HIHAT_CLOSED" ;
        tracks[3].sound = kit == 0 ? "PRESET_HH_HIHAT" : "PRESET_ROCK_HIHAT_MED";
        tracks[4].sound = kit == 0 ? "PRESET_HH_TAMB" : "PRESET_ROCK_HIHAT_OPEN";
        tracks[5].sound = kit == 0 ? "PRESET_HH_SCRATCH" : "PRESET_ROCK_CRASH";
        tracks[6].sound = "";
        tracks[7].sound = "";
    }
    else if (tracks.length > 0 && tracks[0].sound == "PRESET_ROCK_KIT") {
        tracks[0].sound = "PRESET_ROCK_KICK";        
    }
};
