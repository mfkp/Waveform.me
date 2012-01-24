var color = Math.random() * 360;

function play(player) {
	var width = 1800;
	var height = 280;
	var bgcolor = "rgba(255,255,255,1)";
	var barWidth = 5; // pixels for progress indicator (at max volume)
	var fadeSpeed = 6; // between 1 and 10, 1=fast, 10=slow
	var waveformType = 1; // 1 = mirrored, 2 = half waveform
	var skeleton = true; // turn on skeleton mode #winning
	var skeletonbgcolor = "rgba(255,255,255,.05)";
	var duration = 	player.api_getCurrentTrack().duration / 1000; //duration in seconds
	var steps = Math.ceil(duration / 20); //duration over 25 seems about right
	var interval = duration * (5.0 / 9.0) / steps;
	var KyleConstant = 1.005; //this is science don't mess with it

	var ctx = document.getElementById('canvas').getContext('2d');
	var src = document.getElementById('canvas2').getContext('2d');

	var x = width * player.api_getTrackPosition() / duration;
	var counter = 999; //start high so it starts on right part of loop
	var pixFromTop = 0;
	var volume = 0;

	var loop = setInterval(function() {

		if (counter < steps) {
			pixFromTop = pixFromTop * KyleConstant;
			counter += 1;
		} else {
			x = width * player.api_getTrackPosition() / duration;
			var pixels = src.getImageData(Math.floor(x), 0, 1, height/2).data;

			pixFromTop = 0;
			for (var i = 0, n = pixels.length; i < n; i += 4) {
				if (pixels[i+3] == 0) {
					break;
				} else {
					pixFromTop += 1;
				}
			}
			volume = (height - (pixFromTop * 2)) / height; //between 0 and 1
			counter = 0;
		}
		//ctx.fillStyle = "hsla(" + 360 - (color+x/fadeSpeed) % 360 + ", 100%, " + volume * 100 + "%, " + volume + ")";
		//ctx.clearRect(x,0,width-x,height);
		ctx.fillStyle = bgcolor;
		ctx.fillRect(x,0,width-x,height); //background
		//var lightness = 80 - (((height/2 - volume) / (height/2)) * 25);
		//var lightness = ((height-pixFromTop)/height * 100) / 2;
		ctx.fillStyle = "hsla(" + (color+x/fadeSpeed) % 360 + ", 100%, 50%, 1)";
		ctx.fillRect(x-2,pixFromTop*waveformType,1,(height-(pixFromTop*2)/waveformType)); //middle bar
		ctx.fillStyle = "hsla(" + 360 - ((color+x/fadeSpeed) % 360) + ", 100%, 50%, " + volume + ")";
		ctx.fillRect(x+1,pixFromTop,barWidth,height-(pixFromTop*2)); //end cap
		if (skeleton) {
			ctx.fillStyle = skeletonbgcolor;
			var offset = (height - (pixFromTop*3)) * volume;
			ctx.fillRect(x-3,offset+30,1,height-(offset*2)-60);
		}
		//ctx.globalAlpha = volume;

	}, interval);

	soundcloud.addEventListener('onMediaPause', function(player, data) {
		clearInterval(loop);
	});
}

function onLoad() {
	soundcloud.addEventListener('onPlayerReady', function(player, data) {
		console.log('starting');
		var ctx = document.getElementById('canvas2').getContext('2d');  
		var img = new Image();  
		img.onload = function(){  
			ctx.drawImage(img, 0, 0); 
		}
		img.src = '/' + encodeURIComponent(player.api_getCurrentTrack().waveformUrl.split('?')[0]);
		console.log(player.api_getCurrentTrack());
		player.api_play();
	});
	soundcloud.addEventListener('onMediaPlay', function(player, data) {
		play(player);
	});
}