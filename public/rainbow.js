(function() {
	function init() {
		var color = Math.floor(Math.random() * 360);
		var canvas = document.getElementById('rainbow');
		var width = canvas.width;
		var height = canvas.height;
		var bgcolor = "rgba(255,255,255,1)";
		var barWidth = 5; // pixels for progress indicator
		var fadeSpeed = 6; // between 1 and 10, 1=fast, 10=slow
		//var waveformType = 1; // 1 = mirrored, 2 = half waveform
		var skeleton = true; // turn on skeleton mode #winning
		var skeletonbgcolor = "rgba(255,255,255,.15)";
		var originalBarWidth = barWidth;

		var ctx = canvas.getContext('2d');

		var loop = function() {
			var x = Math.floor((soundcloud.getCurrentX()/1800)*width);
			var volume = soundcloud.getCurrentVolume();
			var nextVolume = soundcloud.getNextVolume();
			var waveformHeight = height * volume;
			ctx.fillStyle = bgcolor;
			ctx.fillRect(x,0,width-x,height); //background
			ctx.fillStyle = "hsla(" + (color+x/fadeSpeed) % 360 + ", 100%, 50%, " + volume + ")";
			ctx.fillRect(x-2,height/2 - (waveformHeight/2),1,waveformHeight); //middle bar
			//ctx.fillStyle = "hsla(" + 360 - ((color+x/fadeSpeed) % 360) + ", 100%, 50%, " + _sc_volume + ")";
			if (barWidth > originalBarWidth) {
				barWidth -= 1;
			}
			if ((nextVolume - volume) > .07 ) {
				barWidth = originalBarWidth * 2;
			}
			ctx.fillRect(x+1,height/2 - (waveformHeight/2),barWidth,waveformHeight); //end cap
			if (skeleton) {
				ctx.fillStyle = skeletonbgcolor;
				ctx.fillRect(x-3,height/2 - (waveformHeight/4),1,waveformHeight/2);
				//ctx.fillRect(x-3,height/2 - (waveformHeight/16),1,waveformHeight/8);
			}
		}
		scVisualizations.push(loop);
	}

	domLoaded(init);
})();