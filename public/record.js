(function() {
	function init() {
		var canvas = document.getElementById('record');
		var width = canvas.width;
		var height = canvas.height;
		var half = width / 2;
		var innerSize = width / 5;
		var interval = (1000 / 30); //30 fps

		var ctx = canvas.getContext('2d');

		var circlesWidth = innerSize / (width/20);
		var amplitude = 0;
		var artworkImg = new Image();
		var percentDone = 0;

		var loop = function() {
			amplitude = (half - innerSize) * soundcloud.getCurrentVolume() + innerSize - (innerSize/10);
			percentDone = soundcloud.getPercentDone();

			ctx.clearRect(0,0,width,height);

			//progress ring
			ctx.strokeStyle = "rgba(0,255,0,0.6)";
			ctx.lineWidth = 5;
			ctx.beginPath();
			ctx.arc(half,half,amplitude + 5,Math.PI*1.5,Math.PI*1.5+(Math.PI*2*percentDone),false);
			ctx.stroke();

			//black outer circle
			ctx.fillStyle = "rgba(0,0,0,1)";
			ctx.beginPath();
			ctx.arc(half,half,amplitude,0,Math.PI*2,true);
			ctx.arc(half,half,innerSize+(innerSize/10),0,Math.PI*2,false); // outer (unfills it)
			ctx.closePath();
			ctx.fill();

			//white inner circle
			ctx.fillStyle = "rgba(255,255,255,1)";
			ctx.beginPath();
			ctx.arc(half, half, innerSize + (innerSize/10), 0,Math.PI*2, true);
			ctx.closePath();
			ctx.fill();

			//draw record lines
			ctx.fillStyle = "rgba(35,35,35,1)";
			for (var i = innerSize+(innerSize/10); i < amplitude; i+=circlesWidth) {
				ctx.beginPath();
				ctx.arc(half,half,i,0,Math.PI*2,true);
				ctx.arc(half,half,i-1,0,Math.PI*2,false);
				ctx.fill();
				ctx.closePath();
			}

			//draw artwork
			if (soundcloud.getArtworkImg().src != artworkImg.src) {
				artworkImg = soundcloud.getArtworkImg();
			}
			ctx.save();
				ctx.beginPath();
				ctx.arc(half, half, innerSize, 0, Math.PI * 2, true);
				ctx.arc(half, half, innerSize/6, 0, Math.PI * 2, false);
				ctx.closePath();
				ctx.clip();
				ctx.translate(half, half);
				ctx.rotate((percentDone*3600 % 360)*Math.PI/180); //3600 = spin 10 times during song
				ctx.drawImage(artworkImg, -innerSize, -innerSize, innerSize*2, innerSize*2);
				ctx.translate(-half, -half);
		    ctx.restore();
		};

		scVisualizations.push(loop);
	}

	domLoaded(init);

})();