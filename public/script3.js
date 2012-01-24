var _sc_loop;
var _sc_artworkImg = new Image();

(function() {
	function play(player) {
		var canvas = document.getElementById('canvas3');
		var width = canvas.width;
		var height = canvas.height;
		var half = width / 2;
		var playButtonSize = width / 5;
		var interval = (1000 / 30);

		var ctx = canvas.getContext('2d');

		var circlesWidth = (playButtonSize/(width/20));
		var x = 0,
			prevx = -1,
			volume = 0,
			counter = 0,
			amplitude = 0,
			counter = 0,
			prevCounter = 0,
			step = 0;
		var initialize = true;
		var loop;

		var animation = function() {
				
			if (typeof(soundcloud) == 'undefined' || typeof(soundcloud.getCurrentVolume) == 'undefined') {
				return;
			} else if (initialize){
				soundCloudReady();
			}

			x = soundcloud.getCurrentX();

			if (x > prevx) {
				volume = soundcloud.getCurrentVolume();
				prevx = x;
				step = (soundcloud.getNextVolume() - volume) / (counter - prevCounter);
				prevCounter = counter;
			} else {
				volume += step;
			}

			amplitude = (half - playButtonSize) * volume + playButtonSize - (playButtonSize/10);

			ctx.clearRect(0,0,width,height);

			//black outer circle
			ctx.fillStyle = "rgba(0,0,0,1)";
			ctx.beginPath();
			ctx.arc(half,half,amplitude,0,Math.PI*2,true);
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
			if (_sc_artworkImg.src) {
				ctx.save();
					ctx.beginPath();
					ctx.arc(half, half, playButtonSize, 0, Math.PI * 2, true);
					ctx.arc(half, half, playButtonSize/6, 0, Math.PI * 2, false);
					ctx.closePath();
					ctx.clip();
					ctx.translate(half, half);
					ctx.rotate((counter % 360)*Math.PI/180);
					ctx.drawImage(_sc_artworkImg, -playButtonSize, -playButtonSize, playButtonSize*2, playButtonSize*2);
					ctx.translate(-half, -half);
			    ctx.restore();
			}

			counter += 1;
		}
		var loop = setInterval(animation, interval);

		function soundCloudReady() {
			soundcloud.addEventListener('onMediaSeek', function(player, data) {
				step = 0;
				prevx = -1;
			});
			soundcloud.addEventListener('onMediaPause', function(player, data) {
				clearInterval(loop);
			});
			soundcloud.addEventListener('onMediaEnd', function(player, data) {
				clearInterval(loop);
			});
			soundcloud.addEventListener('onMediaPlay', function(player, data) {
				loop = setInterval(animation, interval);
			});
			initialize = false;
		}

	}

	domLoaded(play);

})();