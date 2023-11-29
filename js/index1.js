let initialized = false;

let webcam

let temp = true

function button_callback() {
	if (initialized) {
		return;
	}

	let update_memory = pico.instantiate_detection_memory(5);
	let facefinder_classify_region = function (r, c, s, pixels, ldim) { return -1.0; };
	let cascadeurl = 'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder';
	fetch(cascadeurl).then(function (response) {
		response.arrayBuffer().then(function (buffer) {
			var bytes = new Int8Array(buffer);
			facefinder_classify_region = pico.unpack_cascade(bytes);
			console.log('* cascade loaded');
		})
	})

	let do_puploc = function (r, c, s, nperturbs, pixels, nrows, ncols, ldim) { return [-1.0, -1.0]; };
	// let puplocurl = 'https://drone.nenadmarkus.com/data/blog-stuff/puploc.bin'
	let puplocurl = "./puploc.bin"
	fetch(puplocurl).then(function (response) {
		response.arrayBuffer().then(function (buffer) {
			let bytes = new Int8Array(buffer);
			do_puploc = lploc.unpack_localizer(bytes);
			console.log('* puploc loaded');
		})
	})

	const ctx = document.querySelector('#canvas').getContext('2d');
	function rgba_to_grayscale(rgba, nrows, ncols) {
		gray = new Uint8Array(nrows * ncols);
		for (let r = 0; r < nrows; ++r)
			for (let c = 0; c < ncols; ++c)
				gray[r * ncols + c] = (2 * rgba[r * 4 * ncols + 4 * c + 0] + 7 * rgba[r * 4 * ncols + 4 * c + 1] + 1 * rgba[r * 4 * ncols + 4 * c + 2]) / 10;
		return gray;
	}

	let processfn = function (video, dt) {
		let faceDec = document.querySelector("#face-dec")
		ctx.drawImage(video, 0, 0);
		let rgba = ctx.getImageData(0, 0, 640, 480).data;

		image = {
			"pixels": rgba_to_grayscale(rgba, 480, 640),
			"nrows": 480,
			"ncols": 640,
			"ldim": 640
		}

		params = {
			"shiftfactor": 0.1,
			"minsize": 100,
			"maxsize": 1000,
			"scalefactor": 1.1
		}

		dets = pico.run_cascade(image, facefinder_classify_region, params);
		dets = update_memory(dets);
		dets = pico.cluster_detections(dets, 0.2);

		for (i = 0; i < dets.length; ++i) {
			if (dets[i][3] > 50.0) {
				let r, c, s
				faceDec.innerHTML = "find"
				faceDec.dataset.num = "1"
				ctx.beginPath();
				ctx.arc(dets[i][1], dets[i][0], dets[i][2] / 2, 0, 2 * Math.PI, false);
				ctx.lineWidth = 1;
				ctx.strokeStyle = 'red';
				ctx.stroke();

				r = dets[i][0] - 0.075 * dets[i][2];
				c = dets[i][1] + 0.175 * dets[i][2];
				s = 0.35 * dets[i][2];
				[r, c] = do_puploc(r, c, s, 63, image)
				if (r >= 0 && c >= 0) {
					ctx.beginPath();
					ctx.arc(c, r, 1, 0, 2 * Math.PI, false);
					ctx.lineWidth = 20;
					ctx.strokeStyle = 'blue';
					ctx.stroke();
				}
				
				let ctx1 = document.querySelector('#left-canvas').getContext('2d');
				ctx1.filter = "grayscale()"
				ctx1.drawImage(video, c - 20, r - 20, 40, 40, 0, 0, 240, 194)
				
				r = dets[i][0] - 0.075 * dets[i][2];
				c = dets[i][1] - 0.175 * dets[i][2];
				s = 0.35 * dets[i][2];
				[r, c] = do_puploc(r, c, s, 63, image)
				if (r >= 0 && c >= 0) {
					ctx.beginPath();
					ctx.arc(c, r, 1, 0, 2 * Math.PI, false);
					ctx.lineWidth = 20;
					ctx.strokeStyle = 'blue';
					ctx.stroke();
				}
				let ctx2 = document.querySelector('#right-canvas').getContext('2d');
				ctx2.filter = "grayscale()"
				ctx2.drawImage(video, c - 20, r - 20, 40, 40, 0, 0, 240, 194)
			}
			if(dets[i][3] <= 0.15){
				faceDec.innerHTML = "nofind"
				faceDec.dataset.num = "0"
			}
			
		}

	}

	let mycamvas = new camvas(ctx, processfn);
	initialized = true;

}
setTimeout(button_callback, 1000);