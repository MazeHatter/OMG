if (typeof omg != "object")
	omg = {};

(function setupPlayer() {

    var p = {playing: false, loadedSounds: {}};

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


    omg.player = p;
    p.iSubBeat = 0;
    p.loopStarted = 0;

    p.beats = 8;
    p.subbeats = 4;
    
    p.play = function (arrangement) {

        p.prepareArrangement(arrangement);
        p.arrangement.playingSection = 0;
    
        p.playing = true;
        p.loopStarted = Date.now();
        p.iSubBeat = 0;

    	//todo this bpm thing isn't consistent
        var beatsPerSection = p.beats * p.subbeats;
    	p.subbeatLength = arrangement.subbeatMillis || 125; 

    	var intervalHandle = setInterval(function() {
            p.playBeat(p.arrangement.sections[p.arrangement.playingSection], 
            		p.iSubBeat);

            p.iSubBeat++;
            if (p.iSubBeat == beatsPerSection) {
            
                p.iSubBeat = 0;
                p.loopStarted = Date.now();
                p.arrangement.playingSection++;
                
                if (p.arrangement.playingSection >= arrangement.sections.length) {
                	clearInterval(intervalHandle);
                }
            }
    		
    	}, p.subbeatLength);

        // ??
        p.songStarted = p.loopStarted;
        
        return intervalHandle;
    };
    


    p.loadPart = function (part, data) {

        part.currentI = -1;
        part.nextBeat = 0;
        part.soundsLoading = 0;
    	part.loaded = false;
        if (data.type == "DRUMBEAT") {
            var soundsAlreadyLoaded = 0;
            var tracks = data.data;
            fixSound(tracks, data.kit);
            for (var i = 0; i < tracks.length; i++) {
            	if (!tracks[i].sound) {
            		soundsAlreadyLoaded++;
            	}
            	else if (p.loadedSounds[tracks[i].sound]) {
                    //tracks[i].audio = p.loadedSounds[tracks[i].sound];
                    soundsAlreadyLoaded++;
                }
                else {
                    loadSound(tracks[i].sound, part);
                }
            }
            if (soundsAlreadyLoaded == tracks.length) {
            	part.loaded = true;
            }
        }
        if (data.type == "MELODY" || data.type == "BASSLINE") {
        	
			rescale(part, omg.section.data.rootNote, 
					omg.section.data.ascale);
        	
			if (typeof data.sound == "string" &&
					data.sound.indexOf("PRESET_") == 0) {
				setupPartWithSoundSet(getPresetSoundSet(data.sound), part);
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
                loadSound(note.sound, part);
    		}
		
            if (soundsToLoad == 0) {
            	part.loaded = true;
        	}
    

            // this starts the player over if there
            // are no other sections in the remixer
            // this shouldn't be here, and probalby will never
            // work because the part is now added before this function
            // instead of after it            
            if (omg.section.parts.length == 0)
                p.iSubBeat = -1;

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

        	debug("set new bpm");
    	}
    };
    
    p.playWhenReady = function (parts) {
    	var allReady = true;
        var sections;
        if (p.source == "remixer") {
            sections = [omg.section];
        }
        else if (p.source == "rearranger") {
            sections = omg.rearranger.client.sections;
        }
    	for (var i = 0; i < sections.length; i++) {
        	for (var j = 0; j < sections[i].parts.length; j++) {
        		if (!sections[i].parts[j].loaded) {
        			allReady = false;
        			debug("section " + i + " part " + j + " is not ready");
        		}
            }
    	}
    	if (!allReady) {
    		setTimeout(function () {
    			p.playWhenReady(parts);
    		}, 600);
    	}
    	else {
    		p.play();
    	}
    };
    
    p.prepareArrangement = function (arrangement) {
    	var rawSection;
    	var section;
    	var rawPart;
    	var part;
    	
    	
    	p.arrangement = {raw: arrangement, sections: []};

        for (var isection = 0; isection < arrangement.sections.length; isection++) {
        	
        	rawSection = arrangement.sections[isection];
        	section = {raw: rawSection, parts: []};

            for (var ipart = 0; ipart < rawSection.parts.length; ipart++) {
            	rawPart = rawSection.parts[ipart];
            	part = {raw: rawPart, nextBeat: 0, currentI: -1};
            	section.parts.push(part);

            }
        	p.arrangement.sections.push(section);
        }
    };
        
    p.playBeat = function (section, iSubBeat) {
        for (var ip = 0; ip < section.parts.length; ip++) {
            p.playBeatForPart(iSubBeat, section.parts[ip]);
        }

    }

    p.playBeatForPart = function (iSubBeat, part) {
        if (part.raw.type == "DRUMBEAT") {
            p.playBeatForDrumPart(iSubBeat, part);        
        }
        if (part.raw.type == "MELODY" || part.raw.type == "BASSLINE") {
            p.playBeatForMelody(iSubBeat, part);        
        }

    }

    p.playBeatForDrumPart = function (iSubBeat, part) {
        var tracks = part.data;
        
    	if (part.muted)
    		return;

        for (var i = 0; i < tracks.length; i++) {
            if (tracks[i].data[iSubBeat]) {
            	playSound(tracks[i].sound, data.volume);
            }
        }
    };

    p.playBeatForMelody = function (iSubBeat, part) {
    	
    	var data = part.raw;
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
        	console.log("play 2");
            var note = data.notes[part.currentI];
            
//            if (part.soundset) {
        	if (note && note.sound) {
        	    if (!part.muted) {
            		playNote(note, part, data);        		
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

	    if (part.raw.type == "BASSLINE") {
	        part.osc.type = part.osc.SAWTOOTH || "sawtooth";
	    }

	    part.gain = p.context.createGain();
	    part.osc.connect(part.gain);
	    part.gain.connect(p.context.destination);
	    
	    if (part.muted) {
	    	part.gain.gain.value = 0;
	    	part.gain.gain.preMuteGain = 0.6; //0.15;
	    }
	    else {
	        part.gain.gain.value = 0.6; //0.15;    	
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
    }
    
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
    }


})();