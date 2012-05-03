window.scVisualizations = [];

(function() {
	var waveformWidth 	= 1800,
		waveformHeight 	= 280;
	var sc_loop;

	function start(player) {
		clearListeners();

		var volume = 0,
			nextVolume = 0,
			percentage = 0,
			x = 0,
			prevx = -1,
			counter = 0,
			prevCounter = 0,
			step = 0,
			timeStr = "0:00",
			duration = 	player.api_getCurrentTrack().duration / 1000, //duration in seconds
			durationHours = parseInt(Math.round(duration) / 3600) % 24,
			durationMinutes = parseInt(Math.round(duration) / 60) % 60,
			durationSeconds = Math.round(duration) % 60,
			durationStr = (durationHours > 0 ? durationHours + ":" : "") + durationMinutes
						  + ":" + (durationSeconds < 10 ? "0" + durationSeconds : durationSeconds),
			interval = (1000 / 60); //frames per second

		//create the src canvas
		var sc_wf = document.getElementById('sc_wf');
		if (sc_wf != null) {
			document.body.removeChild(sc_wf);
		}
		var canvas = document.createElement('canvas');
		canvas.setAttribute('style', 'display:none;');
		canvas.setAttribute('width', waveformWidth);
		canvas.setAttribute('height', waveformHeight);
		canvas.id = 'sc_wf';
		document.body.appendChild(canvas);

		var ctx = canvas.getContext('2d');

		//load waveform into canvas
		var waveformImg = new Image();
		waveformImg.onload = function(){
			ctx.clearRect(0, 0, ctx.width, ctx.height);
			ctx.drawImage(waveformImg, 0, 0);
		}
		JSONP.get('/get/' + encodeURIComponent(player.api_getCurrentTrack().waveformUrl.split('?')[0]), {}, function(response){
			waveformImg.src = response;
		});

		//get artwork image
		var artworkImg = new Image();
		artworkImg.src = '/images/default-artwork.jpg';
		if (player.api_getCurrentTrack().artwork != undefined) {
			JSONP.get('/get/' + encodeURIComponent(player.api_getCurrentTrack().artwork.split('?')[0]), {}, function(response){
				artworkImg.src = response;
			});
		}

		//add getters to the soundcloud global context
		soundcloud.getCurrentTrack = function() {
			return player.api_getCurrentTrack();
		}
		soundcloud.getCurrentVolume = function() {
			return volume;
		}
		soundcloud.getNextVolume = function() {
			return nextVolume;
		}
		soundcloud.getCurrentX = function() {
			return Math.floor(waveformWidth * player.api_getTrackPosition() / duration);
		}
		soundcloud.getPercentDone = function() {
			return player.api_getTrackPosition() / duration;
		}
		soundcloud.getArtworkImg = function() {
			return artworkImg;
		}
		soundcloud.getCurrentTimeStr = function() {
			return timeStr;
		}
		soundcloud.getDurationStr = function() {
			return durationStr;
		}

		var calculate = function() {
			percentage = player.api_getTrackPosition() / duration;
			x = Math.floor(waveformWidth * percentage);
			if (x > prevx) {
				//vol @ current position
				volume = (waveformHeight - (countPixels(0) * 2)) / waveformHeight; //between 0 and 1

				//vol @ next position
				nextVolume = (waveformHeight - (countPixels(1) * 2)) / waveformHeight; //between 0 and 1

				//calculate time
				var seconds = Math.round(player.api_getTrackPosition());
				var hours = parseInt(seconds / 3600) % 24;
				var minutes = parseInt(seconds / 60) % 60;
				seconds = seconds % 60;
				timeStr = (hours > 0 ? hours + ":" : "") + minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);

				prevx = x;
				step = (nextVolume - volume) / (counter - prevCounter);
				prevCounter = counter;
			} else {
				volume += step;
			}
			counter += 1;

			scVisualizations.forEach(function(f) { f() });
		}

		//counts pixels from top of waveform image to first transparent pixel (the actual wave)
		var countPixels = function(offset) {
			var count = 0,
				pixels = ctx.getImageData(x+offset, 0, 1, waveformHeight/2).data;
			for (var i = 0, n = pixels.length; i < n; i += 4) {
				if (pixels[i+3] == 0) {
					break;
				} else {
					count += 1;
				}
			}
			return count;
		}

		var seekHandler = function(player, data) {
			step = 0;
			prevx = 1;
		}
		soundcloud.addEventListener('onMediaSeek', seekHandler);

		var pauseHandler = function(player, data) {
			counter = 0;
			clearListeners();
		}
		soundcloud.addEventListener('onMediaPause', pauseHandler);

		var endHandler = function(player, data) {
			step = 0;
			prevx = -1;
			clearListeners();
		}
		soundcloud.addEventListener('onMediaEnd', endHandler);

		function clearListeners() {
			soundcloud.removeEventListener('onMediaPause', pauseHandler);
			soundcloud.removeEventListener('onMediaEnd', endHandler);
			soundcloud.removeEventListener('onMediaSeek', seekHandler);
			if (window.loop != null) {
				clearInterval(window.loop);
			}
		}

		//start the event loop
		window.loop = setInterval(calculate, interval);
	}

	function soundcloudReady() {
		soundcloud.addEventListener('onMediaPlay', function(player, data) {
			start(player);
		});
	}

	function getItStarted() {
		//load soundcloud api js if not already loaded
		if (typeof(window.soundcloud) == 'undefined') {
			var script = document.createElement('script');
			script.src = 'https://raw.github.com/soundcloud/Widget-JS-API/master/soundcloud.player.api.js';
			var head = document.getElementsByTagName('head')[0],
				done = false;
			script.onload = script.onreadystatechange = function() {
				if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
					done = true;
					soundcloudReady();
					script.onload = script.onreadystatechange = null;
					head.removeChild(script);
				};
	        };
	        head.appendChild(script);
		} else {
			soundcloudReady();
		}
	}

	domLoaded(getItStarted);
})();

function domLoaded(callback) {
	/* Internet Explorer */
	/*@cc_on
	@if (@_win32 || @_win64)
	    document.write('<script id="ieScriptLoad" defer src="//:"><\/script>');
	    document.getElementById('ieScriptLoad').onreadystatechange = function() {
	        if (this.readyState == 'complete') {
	            callback();
	        }
	    };
	    return;
	@end @*/
	/* Mozilla, Chrome, Opera */
	if (document.addEventListener) {
	    document.addEventListener('DOMContentLoaded', callback, false);
	    return;
	}
	/* Safari, iCab, Konqueror */
	if (/KHTML|WebKit|iCab/i.test(navigator.userAgent)) {
	    var DOMLoadTimer = setInterval(function () {
	        if (/loaded|complete/i.test(document.readyState)) {
	            callback();
	            clearInterval(DOMLoadTimer);
	        }
	    }, 10);
	    return;
	}
	/* Other web browsers */
	window.onload = callback;
};

//This prototype is provided by the Mozilla foundation and
//is distributed under the MIT license.
//http://www.ibiblio.org/pub/Linux/LICENSES/mit.license
if (!Array.prototype.forEach)
{
  Array.prototype.forEach = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        fun.call(thisp, this[i], i, this);
    }
  };
}

/*
* Lightweight JSONP fetcher
* Copyright 2010-2012 Erik Karlsson. All rights reserved.
* BSD licensed
*/
var JSONP = (function() {
  var counter = 0,
      head, query, key, window = this,
      config = {};

  function load(url) {
    var script = document.createElement('script'),
        done = false;
    script.src = url;
    script.async = true;

    script.onload = script.onreadystatechange = function() {
      if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
        done = true;
        script.onload = script.onreadystatechange = null;
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }
    };
    if (!head) {
      head = document.getElementsByTagName('head')[0];
    }
    head.appendChild(script);
  }

  function encode(str) {
    return encodeURIComponent(str);
  }

  function jsonp(url, params, callback, callbackName) {
    query = (url || '').indexOf('?') === -1 ? '?' : '&';
    params = params || {};
    for (key in params) {
      if (params.hasOwnProperty(key)) {
        query += encode(key) + "=" + encode(params[key]) + "&";
      }
    }
    var jsonp = "json" + (++counter);
    window[jsonp] = function(data) {
      callback(data);
      try {
        delete window[jsonp];
      } catch (e) {}
      window[jsonp] = null;
    };

    load(url + query + (callbackName || config['callbackName'] || 'callback') + '=' + jsonp);
    return jsonp;
  }

  function setDefaults(obj) {
    config = obj;
  }
  return {
    get: jsonp,
    init: setDefaults
  };
}());