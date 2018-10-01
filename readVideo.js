const ffmpeg = require('ffmpeg');

try {
		var process = new ffmpeg('video.mov');
		process.then(function (video) {
      console.log(video.metadata)
      console.log(video)
      video.fnExtractFrameToJPG('frames', {
        start_time: 0,
        duration_time: 2,
				frame_rate : 30,
				number : 5,
				file_name : 'my_frame_%t_%s'
			}, function (error, files) {
				if (!error)
					console.log('Frames: ' + files);
			});
		}, function (err) {
			console.log('Error: ' + err);
		});
	} catch (e) {
		console.log(e.code);
		console.log(e.msg);
	}
