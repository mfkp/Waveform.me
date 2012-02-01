(function() {
	function init() {
		var color = Math.floor(Math.random() * 360);
		var canvas = document.getElementById('rainbow');
		var width = canvas.width;
		var height = canvas.height;
		var bgcolor = "rgba(255,255,255,0)";
		var barWidth = 5; // pixels for progress indicator
		var fadeSpeed = 6; // between 1 and 10, 1=fast, 10=slow
		//var waveformType = 1; // 1 = mirrored, 2 = half waveform
		var skeleton = true; // turn on skeleton mode #winning
		var skeletonbgcolor = "rgba(255,255,255,.05)";
		var originalBarWidth = barWidth;

		var ctx = canvas.getContext('2d');

		var loop = function() {
			var x = Math.floor((soundcloud.getCurrentX()/1800)*width);
			var volume = soundcloud.getCurrentVolume();
			var nextVolume = soundcloud.getNextVolume();
			var waveformHeight = height * volume;
			ctx.fillStyle = bgcolor;
			ctx.clearRect(x,0,width-x,height);
			ctx.fillStyle = "hsla(" + (color+x/fadeSpeed) % 360 + ", 100%, 50%, " + volume + ")";
			ctx.fillRect(x,height/2 - (waveformHeight/2),1,waveformHeight); //middle bar
			if (barWidth > originalBarWidth) {
				barWidth -= 1;
			}
			if ((nextVolume - volume) > .07 ) {
				barWidth = originalBarWidth * 2;
			}
			ctx.fillRect(x+1,height/2 - (waveformHeight/2),barWidth,waveformHeight); //end cap
			if (skeleton) {
				ctx.fillStyle = skeletonbgcolor;
				ctx.fillRect(x,height/2 - (waveformHeight/4),1,waveformHeight/2);
			}
		}
		scVisualizations.push(loop);
	}

	domLoaded(init);
})();