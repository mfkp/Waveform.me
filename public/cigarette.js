(function() {
	function init() {
		var canvas = document.getElementById('cigarette'),
			width = canvas.width,
			height = canvas.height,
			offset = 15,
			ctx = canvas.getContext('2d'),
			smoker = new Smoker(ctx),
			fillWidth, buttWidth, buttHeight, cherryWidth, cherryHeight, tubeHeight, halfCigHeight;

		var butt = new Image();
		butt.src = '/images/butt.gif';

		var cherry = new Image();
		cherry.src = '/images/cherry.png';

		var tube = new Image();
		tube.onload = function() {
			//cache a bunch of these sizes for speeeeeed
			fillWidth = width - butt.width - cherry.width;
			buttWidth = butt.width;
			buttHeight = butt.height;
			cherryWidth = cherry.width;
			cherryHeight = cherry.height;
			tubeHeight = tube.height;
			halfCigHeight = height - buttHeight;
		}
		tube.src = '/images/tube.gif';

		var loop = function(artwork) {
			var volume = soundcloud.getCurrentVolume();
			var fillPercent = (1 - soundcloud.getPercentDone());
			var tubeWidth = fillWidth * fillPercent;

			ctx.clearRect(0, 0, width, height);
			//draw tube
			ctx.drawImage(tube, buttWidth, halfCigHeight, tubeWidth + offset, tubeHeight);
			//draw butt
			ctx.drawImage(butt, 0, halfCigHeight);
			//draw texts
			ctx.fillStyle = "rgba(0,0,0,1)";
			var timeStr = soundcloud.getCurrentTimeStr() + " / " + soundcloud.getDurationStr();
			ctx.font = "normal 10px Verdana";
			ctx.fillText(timeStr, 10, halfCigHeight);
			//var timeWidth = ctx.measureText(timeStr).width;
			ctx.font = "normal 14px Verdana";
			var titleText = soundcloud.getCurrentTrack().title + " - " + soundcloud.getCurrentTrack().user.name;
			ctx.fillText(titleText, buttWidth, (height-(buttHeight/2))+5, tubeWidth);
			//clear part behind cherry
			var cigWidth = buttWidth + tubeWidth + offset;
			ctx.clearRect(cigWidth, 0, width-cigWidth, height);
			//draw color behind cherry
			var red = Math.floor(volume * 255);
			var green = Math.floor(volume * red / 4);
			ctx.fillStyle = "rgba(" + red + ", " + green + ", 0, 1)";
			ctx.fillRect(buttWidth + tubeWidth + 6, height-(cherryHeight*2/3), cherryWidth - 10, cherryHeight/2);
			//draw cherry
			ctx.drawImage(cherry, buttWidth + tubeWidth, halfCigHeight);
			//make smoke
			ctx.save();
				smoker.step(buttWidth + tubeWidth + offset, (height-(cherryHeight)+10), volume);
			ctx.restore();
		}

		/*
			Smoke code borrowed (and modified) from Ned Jackson Lovely, read all about it here:
			http://www.njl.us/blog/animated-smoke-in-html-canvas-with-javascript/ 
		*/
		function Smoker(cntx) {
			var self = this; // "this" can get ambiguous during callbacks.
			self.consts = {MAX_PUFFS: 200, MAX_NEW_PUFFS: 10,
				START_JITTER_X: 3, START_JITTER_Y: 3,
				TTL_MAX: 50, TTL_VARIATION: 10,
				WIND_X: 1, WIND_Y: 10, RANGE_ALPHA: 0.3,
				MIN_ALPHA: 0.02, DIAMETER: 4};
			self.puffs = []; // An array of the rising puffs.
			self.puffImg = new Image();
			self.puffImg.src = '/images/puff.png';
			self.advance_puffs = function(x, y, volume){
				//While we have less than the maximum number of puffs in the
				//animation, and less than the maximum number of new puffs per
				//step, keep adding new puffs.
				var added = 0;
				while(self.puffs.length < self.consts.MAX_PUFFS && added < self.consts.MAX_NEW_PUFFS*volume){
					self.puffs.push({
						x: jitter(x, self.consts.START_JITTER_X),
						y: jitter(y, self.consts.START_JITTER_Y),
						ttl: self.consts.TTL_MAX - randint(self.consts.TTL_VARIATION),
						diameter: Math.max(0, self.consts.DIAMETER * (volume) - (self.consts.DIAMETER/2)),
						vol: volume
					});
					++added;
				}
				//For each puff, decrement the ttl, and call the apply_vector 
				//function.
				var max_x = cntx.canvas.width;
				var max_y = cntx.canvas.height;
				for(var i = 0; i < self.puffs.length; ++i){
					var puff = self.puffs[i];
					--puff.ttl;
					self.apply_vector(puff);
					if(puff.x < 0 || puff.x > max_x || puff.y < 0 || puff.y > max_y){
						puff.ttl = 0;
					}
				}

				//Sort the puffs by ttl, and remove the dead puffs
				self.puffs.sort(function(a, b){return b.ttl - a.ttl;});
				while(self.puffs.length && self.puffs[self.puffs.length -1].ttl <= 0){
					self.puffs.pop();
				}
			}
			self.apply_vector = function(puff){
				// For now, just do a simple movement. 
				// Note we're subtracting in the y direction.
				puff.x += randint(self.consts.WIND_X);
				puff.y -= randint(self.consts.WIND_Y);
				puff.diameter += 3*puff.vol;
			}
			self.render_all = function(){
				for(var i = 0; i < self.puffs.length; ++i){
					var puff = self.puffs[i];
					if(puff.ttl <= 0){continue;}
					var alpha = (1/(self.consts.TTL_MAX - puff.ttl))
							*self.consts.RANGE_ALPHA
							+self.consts.MIN_ALPHA;
					cntx.globalAlpha = alpha;
					cntx.drawImage(self.puffImg, puff.x, puff.y, puff.diameter, puff.diameter);
				}
			}
			self.step = function(x, y, volume){
				self.advance_puffs(x, y, volume);
				self.render_all();
			}
		}

		function randint(max, min) {
			if(!min){return Math.floor(Math.random()*(max+1));}
			return Math.floor(Math.random()*(max+1 - min))+min;
		}

		/* Provides some wiggle to either side of a starting number. */
		function jitter(base, jitter) {
			return randint(base-jitter, base+jitter);
		}

		scVisualizations.push(loop);
	}

	domLoaded(init);
	
})();