//seeking backwards bug
//memory leak?

function play(player, artworkImg) {
	var canvas = document.getElementById('canvas3');
	var width = canvas.width;
	var height = canvas.height;
	var half = width / 2;
	var playButtonSize = width / 5;
	var duration = 	player.api_getCurrentTrack().duration / 1000; //duration in seconds
	var waveformWidth = 1800;
	var waveformHeight = 280;
	//var interval = duration * (1000 / waveformWidth);
	var interval = (1000 / 30);

	var ctx = canvas.getContext('2d');
	var src = document.getElementById('canvas2').getContext('2d');

	var x = waveformWidth * player.api_getTrackPosition() / duration;
	var circlesWidth = (playButtonSize/(width/20));
	var prevx = -1,
		pixFromTop = 0,
		volume = 0,
		nextVolume = 0,
		amplitude = 0,
		counter = 0,
		prevCounter = 0,
		avg = 0,
		step = 0;

	var loop = setInterval(function() {

		x = Math.floor(waveformWidth * player.api_getTrackPosition() / duration);
		if (x > prevx) {
			//current position
			var pixels = src.getImageData(x, 0, 1, waveformHeight/2).data;
			pixFromTop = 0;
			for (var i = 0, n = pixels.length; i < n; i += 4) {
				if (pixels[i+3] == 0) {
					break;
				} else {
					pixFromTop += 1;
				}
			}
			volume = (waveformHeight - (pixFromTop * 2)) / waveformHeight; //between 0 and 1

			//next position
			var pixels = src.getImageData(x+1, 0, 1, waveformHeight/2).data;
			pixFromTop = 0;
			for (var i = 0, n = pixels.length; i < n; i += 4) {
				if (pixels[i+3] == 0) {
					break;
				} else {
					pixFromTop += 1;
				}
			}
			nextVolume = (waveformHeight - (pixFromTop * 2)) / waveformHeight; //between 0 and 1

			prevx = x;
			avg = (counter - prevCounter);
			step = (nextVolume - volume) / avg;
			prevCounter = counter;
		} else {
			volume += step;
		}

		amplitude = (half - playButtonSize) * volume + playButtonSize - (playButtonSize/10);

		ctx.clearRect(0,0,width,height);

		//black outer circle
		ctx.fillStyle = "rgba(0,0,0,1)";
		ctx.beginPath();
		ctx.arc(half,half,amplitude + 5,0,Math.PI*2,true);
		ctx.arc(half,half,playButtonSize+(playButtonSize/10),0,Math.PI*2,false); // outer (unfills it)
		ctx.closePath();
		ctx.fill();

		//white inner circle
		ctx.fillStyle = "rgba(255,255,255,1)";
		ctx.beginPath();
		ctx.arc(half, half, playButtonSize + (playButtonSize/10), 0,Math.PI*2, true);
		ctx.closePath();
		ctx.fill();

		//draw record lines
		ctx.fillStyle = "rgba(35,35,35,1)";
		for (var i = playButtonSize+(playButtonSize/10); i < amplitude; i+=circlesWidth) {
			ctx.beginPath();
			ctx.arc(half,half,i,0,Math.PI*2,true);
			ctx.arc(half,half,i-1,0,Math.PI*2,false);
			ctx.fill();
			ctx.closePath();
		}

		//draw artwork
		if (artworkImg.src) {
			ctx.save();
				ctx.beginPath();
				ctx.arc(half, half, playButtonSize, 0, Math.PI * 2, true);
				ctx.arc(half, half, playButtonSize/6, 0, Math.PI * 2, false);
				ctx.closePath();
				ctx.clip();
				ctx.translate(half, half);
				ctx.rotate((counter % 360)*Math.PI/180);
				ctx.drawImage(artworkImg, -playButtonSize, -playButtonSize, playButtonSize*2, playButtonSize*2);
				ctx.translate(-half, -half);
		    ctx.restore();
		}

		counter += 1;

	}, interval);

	soundcloud.addEventListener('onMediaSeek', function(player, data) {
		// counter = 0;
		// prevCounter = 0;
		// avg = 0;
		step = 0;
		clearInterval(loop);
		//play(player, artworkImg);
		loop();
		return;
	});
	soundcloud.addEventListener('onMediaPause', function(player, data) {
		clearInterval(loop);
	});
	soundcloud.addEventListener('onMediaEnd', function(player, data) {
		clearInterval(loop);
	});
}

function onLoad() {
	if (typeof(window.soundcloud) == 'undefined') {
		var script = document.createElement('script');
		script.src = 'https://raw.github.com/soundcloud/Widget-JS-API/master/soundcloud.player.api.js';
		var head = document.getElementsByTagName('head')[0],
			done = false;
		script.onload = script.onreadystatechange = function() {
			if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
				done = true;
				soundCloudReady();
				script.onload = script.onreadystatechange = null;
				head.removeChild(script);
			};
        };
        head.appendChild(script);
	} else {
		soundCloudReady();
	}
}

function soundCloudReady() {
	var artworkImg = new Image();
	soundcloud.addEventListener('onPlayerReady', function(player, data) {
		var ctx = document.getElementById('canvas2').getContext('2d');
		//load waveform into canvas
		var img = new Image();
		img.onload = function(){ ctx.drawImage(img, 0, 0); }
		img.src = '/' + encodeURIComponent(player.api_getCurrentTrack().waveformUrl.split('?')[0]);
		//get artwork image
		if (player.api_getCurrentTrack().artwork != undefined) {
			artworkImg.src = '/' + encodeURIComponent(player.api_getCurrentTrack().artwork.split('?')[0]);
		} else {
			artworkImg.src = 'http://im.in.com/media/download/wallpapers/2009/Oct/music-abstract_02_420x315.jpg';
		}
		//console.log(player.api_getCurrentTrack());
		player.api_play();
	});
	soundcloud.addEventListener('onMediaPlay', function(player, data) {
		play(player, artworkImg);
	});
}