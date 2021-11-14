var chokidar = require('chokidar');
var fs = require('fs');
var path = require("path");
var uuid = require('uuid');
const {
	getAudioDurationInSeconds
} = require('get-audio-duration');
const eventA = require('../../models/eventA');
const dirRawA = 'D:/test/wave/cow-mic1'
const dirRawB = 'D:/test/wave/cow-mic3'
const dirRawAll = 'D:/test/wave'
const audioTenPrefix = 'D:/producedAudio/audioTen/'

var watcherA = chokidar.watch(dirRawA, {
	ignoreInitial: true,
	useFsEvents : true
	//usePolling:true,
	//interval:3000
});

var watcherB = chokidar.watch(dirRawB, {
	ignoreInitial: true,
	useFsEvents : true
	//usePolling:true,
	//interval:3000
});

function compare(a, b) {
	if (a.audioname < b.audioname) {
		return -1;
	}
	if (a.audioname > b.audioname) {
		return 1;
	}
	return 0;
}

const getAllFiles = function (dirPath, arrayOfFiles) {
	files = fs.readdirSync(dirPath)

	arrayOfFiles = arrayOfFiles || []

	files.forEach(function (file) {
		if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			if(file !== 'temp')
			{
				arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
			}
		} else {
			if(file.endsWith("wav"))
			{
				arrayOfFiles.push(dirPath + "/" + file)
			}
		}
	})

	return arrayOfFiles
}

function getTenMinAudio(fileNameList, startTime, endTime, timeStamp, eventid, microid) {
    makeCompleteDir().then(()=>{
        var mark = uuid.v4();
        //concate
        var arrLen = fileNameList.length;
        var outputFileName = "D:/producedAudio/audioTen/";
        outputFileName += (eventid + "_" + microid + ".wav");
        var commandArray = ['-y'];
        var filter = "";
        for (var i = 0; i < arrLen; ++i) {
            filter += ("[" + i.toString() + ":0]");
        }
        filter += ("concat=n=" + arrLen.toString() + ":v=0:a=1[out]");
        for (var i = 0; i < arrLen; ++i) {
            commandArray.push('-i');
            commandArray.push(fileNameList[i]);
        }
        commandArray.push('-filter_complex', filter, '-map', '[out]', "D:/producedAudio/tmp/output_" + mark + ".wav");

        var cutCommand = 'ffmpeg.exe -y -i D:/producedAudio/tmp/output_' + mark + '.wav  -ss ' + startTime + ' -to ' + endTime + ' -c copy ' + outputFileName;

        // /*ffmpeg.exe -y -i 20200810_080808_a.wav -i 20200810_081135_a.wav -i 20200810_081450_a.wav -filter_complex '[0:0][1:0][2:0]concat=n=3:v=0:a=1[out]' -map '[out]' output5566.wav */
        var concateExec = require('child_process').execFile,
            child;
        child = concateExec('ffmpeg.exe', commandArray, function (error, stdout, stderr) {
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            if (error !== null) {
                // console.log('concateExec error: ' + error);
            }
            var cutExec = require('child_process').exec,
                cutChild;
            cutChild = cutExec(cutCommand, function (error, stdout, stderr) {
                // console.log('stdout: ' + stdout);
                // console.log('stderr: ' + stderr);
                if (error !== null) {
                    // console.log('cutExec error: ' + error);
                }
                fs.unlink('D:/producedAudio/tmp/output_' + mark + '.wav', ()=>{});
            });
        });
    })
}

function makeAudioTenDir() {
    return new Promise(function (resolve, reject) {
        fs.exists('D:/producedAudio/audioTen', function (exists) {
            if (!exists) {
                fs.mkdir('D:/producedAudio/audioTen', function (err) {
                    if (err) {
                        // console.log(err)
                    }
                    resolve(0);
                });
            } else {
                resolve(0);
            }
        });

    });
}

function makeTmpDir() {
    return new Promise(function (resolve, reject) {
        fs.exists('D:/producedAudio/tmp', function (exists) {
            if (!exists) {
                fs.mkdir('D:/producedAudio/tmp', function (err) {
                    if (err) {
                        // console.log(err);
                    }
                    resolve(0);
                });
            } else {
                resolve(0);
            }
        });

    });
}

function makeCompleteDir() {
    return new Promise(function (resolve, reject) {
        fs.exists("D:/producedAudio", function (exists) {
            if (!exists) {
                fs.mkdir('D:/producedAudio', function (err) {
                    if (err) {
                        console.error(err);
                    } else {
                        fs.mkdir('D:/producedAudio/audioTen', function (err) {
                            if (err) {
                                console.error(err);
                            } else {
                                fs.mkdir('D:/producedAudio/tmp', function (err) {
                                    if (err) {
                                        console.error(err);
                                    }
                                    resolve(0);
                                });
                            }
                        });
                    }
                });
            } // end of not exist producedAudio
            else {
                makeAudioTenDir().then(() => {
                    makeTmpDir().then(() => {
                        resolve(0);
                    })
                });
            }
        });
    });
}

function checkifconcat(audioList, key, map1, newaudio, eventStarttime, eventEndtime, eventId, EventA) {
	return new Promise(function (resolve, reject) {

		if (key == newaudio.microid) {
			if (Array.isArray(audioList)) {
				audioList.push({
					audioname: newaudio.audioname,
					starttime: newaudio.starttime,
					endtime: newaudio.endtime,
					duration: newaudio.duration,
					filePath: newaudio.filePath,
				})
				audioList.sort(compare);
			}
		}
		EventA.findByIdAndUpdate(eventId, {
			"audiocut": map1
		}, function (err, doc) {
			if (err) {
				console.error(err);
				res.status(500).json({
					result: -1,
					message: err
				});
				return;
			}
		});

		var flag = true;
		if (audioList[audioList.length - 1].endtime < eventEndtime) {
			flag = false;
		}
		if (audioList[0].starttime > eventStarttime) {
			flag = false;
		}

		for (var i = 0; i < audioList.length - 1; i++) {
			if (audioList[i + 1].starttime - audioList[i].endtime > 2000) {
				flag = false;
			}
		}

		resolve(flag)
	});
}

function checkFileCopyComplete(path, prev, EventA, AudioRaw, AudioTen) {
	var pieces = (path.replace(/\\/g, '/')).split('/');
	var fileName = pieces[pieces.length - 1]
	var years = parseInt(fileName.slice(0, 4));
	var month = parseInt(fileName.slice(4, 6)) - 1;
	var date = parseInt(fileName.slice(6, 8));
	var hours = parseInt(fileName.slice(9, 11));
	var minutes = parseInt(fileName.slice(11, 13));
	var seconds = parseInt(fileName.slice(13, 15));
	var micID = (pieces[3]).slice(7, 8) == '1' ? 'a' : (pieces[3]).slice(7, 8) == '2'? 'b':'c';
	fs.stat(path, function (err, stat) {

		if (err) {
			throw err;
		}
		if (stat.mtime.getTime() === prev.mtime.getTime()) {
			// console.log('成功複製檔案 => 開始加入資料庫');
			getAudioDurationInSeconds(path).then((duration) => {
				var endSeconds = seconds + duration;
				var audioStartTime = new Date(years, month, date, hours, minutes, seconds);
				var audioEndTime = new Date(years, month, date, hours, minutes, endSeconds);
				var filePath = path.replace(/\\/g, '/');
				var newaudio = new AudioRaw();
				newaudio.audioname = fileName;
				newaudio.starttime = audioStartTime;
				newaudio.endtime = audioEndTime;
				newaudio.duration = duration;
				newaudio.microid = micID;
				newaudio.filePath = filePath;
				newaudio.save(function (err) {
					if (err) {
						// console.log("新增音檔>失敗<：" + path)
						// console.log(err);
						return;
					}
					// console.log("新增音檔>成功<：" + path)
				})

				EventA.find({
					$or: [{
						$and: [{
							starttime: {
								$lte: newaudio.starttime
							}
						}, {
							endtime: {
								$gte: newaudio.starttime
							}
						}]
					}, {
						$and: [{
							starttime: {
								$lte: newaudio.endtime
							}
						}, {
							endtime: {
								$gte: newaudio.endtime
							}
						}]
					}, {
						$and: [{
							starttime: {
								$gte: newaudio.starttime
							}
						}, {
							endtime: {
								$lte: newaudio.endtime
							}
						}]
					}]

				}, {}, {
					sort: {
						"microid": 1,
						"starttime": 1
					}
				}, function (err, eventAs) {
					if (err) {
						console.error(err);
						return;
					}

					eventAs.forEach(eventA => {
						var map = eventA.audiocut;
						// console.log(newaudio.microid);

						if (!(eventA.audiocut).has(newaudio.microid)) {
							map.set(newaudio.microid, []);
						}

						EventA.findByIdAndUpdate(eventA.id, {
								"audiocut": map
							},
							function (err, doc) {
								eventA.audiocut.forEach(function (value, key, map1) {
									var fileNameList = [];
									// console.log("value " + value);
									checkifconcat(value, key, map1, newaudio, eventA.starttime, eventA.endtime, eventA.id, EventA).then((flag) => {
										if (flag == true) {

											EventA.findByIdAndUpdate(eventA.id, {
													"audiocut": map1
												},
												function (err, doc) {
													if (err) {
														console.error(err);
														res.status(500).json({
															result: -1,
															message: err
														});
														return;
													}
													var totalduration = 0;
													for (var i = 0; i < value.length; i++) {
														fileNameList.push(value[i].filePath);
														totalduration += parseInt(value[i].duration);
													}
													var timeStamp = eventA.tagDate;
													// console.log("第一個音檔的開始時間 " + value[0].starttime);
													// console.log("timestamp的前五分鐘" + newevent.starttime);
													var startTime = (eventA.starttime - value[0].starttime) / 1000;
													// console.log("最後一個音檔的結束時間 " + value[value.length-1].endtime);
													// console.log("timestamp的後五分鐘" + newevent.endtime);
													var lastTime = (value[value.length - 1].endtime - eventA.endtime) / 1000;
													var endTime = totalduration - lastTime;
													// console.log(lastTime)
													// console.log(totalduration-startTime-lastTime)


													// console.log("==========>  新增音檔的剪輯  開始  <==========")
													// console.log("fileNameList : " + fileNameList);
													// console.log("eventid : " + eventA.id);
													// console.log("microid : " + key);
													// console.log("startTime : " + startTime);
													// console.log("endTime : " + endTime);
													// console.log("timeStamp : " + timeStamp);
													// console.log("==========>  新增音檔的剪輯  結束  <==========")
													getTenMinAudio(fileNameList, startTime, endTime, timeStamp, eventA.id, key, "uuid")

													// 新增前後10分鐘的音檔至DB
													// console.log("耶! 我在改這邊!")
													var newaudioTen = new AudioTen();
													newaudioTen.audioName = eventA.id + "_" + key + ".wav";
													newaudioTen.eventId = eventA.id;
													newaudioTen.microId = key;
													newaudioTen.filePath = audioTenPrefix + eventA.id + "_" + key + ".wav";


													newaudioTen.save(function (err) {
														if (err) {
															console.error(err);
															res.status(500).json({
																result: -1,
																message: err
															});
															return;
														}

														// console.log("成功新增事件前後五分鐘之音檔至資料庫audioTen")
														// console.log("新增之音檔資訊: --------------------")
														// console.log(newaudioTen)
														// console.log("------------結束音檔資訊------------")
														map1.set(key, audioTenPrefix + newaudioTen.audioName);
														// console.log(eventA.id)
														EventA.findByIdAndUpdate(eventA.id, {
															"audiocut": map1
														}, function (err, doc) {
															if (err) {
																console.error(err);
																res.status(500).json({
																	result: -1,
																	message: err
																});
																return;
															}
														});
													})
												});
										}
									})
								})
							});
					});



				})
			}).catch(err=>{ console.log(path);console.log(" "+err)});

		} else {
			setTimeout(checkFileCopyComplete, fileCopyDelaySeconds * 1000, path, stat, EventA, AudioRaw, AudioTen);
		}
	});
}
var fileCopyDelaySeconds = 1;
module.exports = {

	audio2DB: function (EventA, AudioRaw, AudioTen) {
		watcherA
			.on('add', function (path) {
				//file name formate yyyymmdd_hhmmss_mic.wav
				//console.log("新增原始音檔，原始音檔路徑: " + path);

				 var pieces = (path.replace(/\\/g, '/')).split('/');
				 //console.log(pieces)
				 var dir = pieces[pieces.length-2];

				if((/^[-]?[\.\d]+$/.test(dir)))
				{
				    fs.stat(path, function (err, stat) {
                    	if (err) {
                    		// console.log('Error watching file for copy completion. ERR: ' + err.message);
                    		// console.log('Error file not processed. PATH: ' + path);
                    	} else {
                    		// console.log('開始複製檔案' + path + '...');
                    		setTimeout(checkFileCopyComplete, fileCopyDelaySeconds * 1000, path, stat, EventA, AudioRaw, AudioTen);
                    	}
                    });
				}

			})
			.on('unlink', function (path) {
				var filePath = path.replace(/\\/g, '/');
				AudioRaw.deleteOne({
					filePath: filePath
				}, function (err) {
					if (err) {
						// console.log("刪除音檔>失敗<：" + path)
						// console.log("ERROR");
						return;
					}
					// console.log("刪除音檔>成功<：" + path)
				});
			})
		watcherB
			.on('add', function (path) {
				//file name formate yyyymmdd_hhmmss_mic.wav
				var pieces = (path.replace(/\\/g, '/')).split('/');
                //console.log(pieces)
                var dir = pieces[pieces.length-2];
				if((/^[-]?[\.\d]+$/.test(dir)))
                {
				    fs.stat(path, function (err, stat) {
				    	if (err) {
				    		// console.log('Error watching file for copy completion. ERR: ' + err.message);
				    		// console.log('Error file not processed. PATH: ' + path);
				    	} else {
				    		// console.log('開始複製檔案' + path + '...');
				    		setTimeout(checkFileCopyComplete, fileCopyDelaySeconds * 1000, path, stat, EventA, AudioRaw, AudioTen);
				    	}
				    });
				}
			})
			.on('unlink', function (path) {
				var filePath = path.replace(/\\/g, '/');
				AudioRaw.deleteOne({
					filePath: filePath
				}, function (err) {
					if (err) {
						// console.log("刪除音檔>失敗<：" + path)
						// console.log("ERROR");
						return;
					}
					// console.log("刪除音檔>成功<：" + path)
				});
			})
	},

	timeout: function (EventA, AudioTen) {
		EventA.find({
			finish: false,
			$where: function () {
				return (new Date - this.tagDate > 86400000)
			}
		}, {}, {}, function (err, eventAs) {
			// 判斷是否需要將finish狀態設定成true
			eventAs.forEach(eventA => {
				//console.log(eventA.audiocut.size)
				if (eventA.audiocut.size != 0) {
					eventA.audiocut.forEach(function (value, key, map1) {
						if (Array.isArray(value)) {
							//接音檔
							// console.log(value)
							var fileNameList = [];
							var totalduration = 0;
							for (var i = 0; i < value.length; i++) {
								fileNameList.push(value[i].filePath);
								totalduration += parseInt(value[i].duration);
							}
							// console.log("!!!!fileNameList= " + fileNameList);
							var timeStamp = eventA.tagDate;
							var startTime = ((eventA.starttime - value[0].starttime) / 1000) < 0 ? 0 : ((eventA.starttime - value[0].starttime) / 1000);
							var lastTime = (value[value.length - 1].endtime - eventA.endtime) / 1000;
							var endTime = totalduration - lastTime;
							getTenMinAudio(fileNameList, startTime, endTime, timeStamp, eventA.id, key);


							// 新增前後10分鐘的音檔至DB
							var newaudioTen = new AudioTen();
							newaudioTen.audioName = eventA.id + "_" + key + ".wav";
							newaudioTen.eventId = eventA.id;
							newaudioTen.microId = key;
							newaudioTen.filePath = audioTenPrefix + eventA.id + "_" + key + ".wav";

							newaudioTen.save(function (err) {
								if (err) {
									console.error(err);
									return;
								}

								// console.log("成功新增事件前後五分鐘之音檔至資料庫audioTen");
								// console.log("新增之音檔資訊: --------------------");
								// console.log(newaudioTen);
								// console.log("------------結束音檔資訊------------");
								map1.set(key, audioTenPrefix + newaudioTen.audioName);
								// console.log(newevent.id)
								EventA.findByIdAndUpdate(eventA.id, {
									"audiocut": map1
								}, function (err, doc) {
									if (err) {
										console.error(err);
										res.status(500).json({
											result: -1,
											message: err
										});
										return;
									}
									// console.log(doc);
								});
							})
						}
					})
					EventA.findByIdAndUpdate(eventA.id, {
						"finish": true
					}, function (err, doc) {
						if (err) {
							console.error(err);
							return;
						}
					});

				} else {
					EventA.findByIdAndUpdate(eventA.id, {
						"finish": true
					}, function (err, doc) {
						if (err) {
							console.error(err);
							return;
						}
						// console.log(doc)
					});
				}
			})

			// console.log(eventAs)
		});
		// console.log(new Date)


	},

	scanAudio: function (EventA, AudioRaw, AudioTen) {
		/* Build Audio Raw (DB) list */
		var audioDB = [];
		var audioLocal = [];
		AudioRaw.find({}, {}, {
			sort: {
				filePath: 1
			}
		}, function (err, audios) {
			if(audios){
				audios.forEach(audio => {
					audioDB.push(audio.filePath)
				});
			}else{
				console.log("audios is undefined")
				console.log(audios)
				audios = []
			}
			/* Build Audio Raw (local) list */
			getAllFiles(dirRawAll, audioLocal);
			// console.log("---------------------------------------------------------")
			// console.log(audioLocal)
			/* Compare and add missing audio to DB => Compare*/
			var difference = audioLocal.filter(x => !audioDB.includes(x));
			difference.forEach(audio => {
				// console.log(audio);
				var pieces = audio.split('/')
				var fileName = pieces[pieces.length - 1]
				var years = parseInt(fileName.slice(0, 4));
				var month = parseInt(fileName.slice(4, 6)) - 1;
				var date = parseInt(fileName.slice(6, 8));
				var hours = parseInt(fileName.slice(9, 11));
				var minutes = parseInt(fileName.slice(11, 13));
				var seconds = parseInt(fileName.slice(13, 15));
				var micID = (pieces[3]).slice(7, 8) == '1' ? 'a' : (pieces[3]).slice(7, 8) == '2'? 'b':'c';
                var dir = pieces[pieces.length-2];
				getAudioDurationInSeconds(audio).then((duration) => {
					var endSeconds = seconds + duration;
					var audioStartTime = new Date(years, month, date, hours, minutes, seconds);
					var audioEndTime = new Date(years, month, date, hours, minutes, endSeconds);
					var filePath = audio.replace(/\\/g, '/');
					var newaudio = new AudioRaw();
					newaudio.audioname = fileName;
					newaudio.starttime = audioStartTime;
					newaudio.endtime = audioEndTime;
					newaudio.duration = duration;
					newaudio.microid = micID;
					newaudio.filePath = filePath;
                    //console.log(pieces)

                    if((/^[-]?[\.\d]+$/.test(dir)))
                    {
					    newaudio.save(function (err) {
					    	if (err) {
					    		// console.log("新增音檔>失敗<：" + audio)
					    		// console.log(err);
					    		return;
					    	}
					    	// console.log("新增音檔>成功<：" + audio)
					    })
                    }else{
						return;
					}
					EventA.find({
						$or: [{
							$and: [{
								starttime: {
									$lte: newaudio.starttime
								}
							}, {
								endtime: {
									$gte: newaudio.starttime
								}
							}]
						}, {
							$and: [{
								starttime: {
									$lte: newaudio.endtime
								}
							}, {
								endtime: {
									$gte: newaudio.endtime
								}
							}]
						}, {
							$and: [{
								starttime: {
									$gte: newaudio.starttime
								}
							}, {
								endtime: {
									$lte: newaudio.endtime
								}
							}]
						}]

					}, {}, {
						sort: {
							"microid": 1,
							"starttime": 1
						}
					}, function (err, eventAs) {
						if (err) {
							console.error(err);
							return;
						}

						var maps = new Map();
						var audioarray = [];
						eventAs.forEach(eventA => {
							eventA.audiocut.forEach(function (value, key, map1) {
								var fileNameList = [];
								checkifconcat(value, key, map1, newaudio, eventA.starttime, eventA.endtime, eventA.id, EventA).then((flag) => {
									if (flag == true) {
										EventA.findByIdAndUpdate(eventA.id, {
												"audiocut": map1
											},
											function (err, doc) {
												if (err) {
													console.error(err);
													res.status(500).json({
														result: -1,
														message: err
													});
													return;
												}
												var totalduration = 0;
												for (var i = 0; i < value.length; i++) {
													fileNameList.push(value[i].filePath);
													totalduration += parseInt(value[i].duration);
												}
												var timeStamp = eventA.tagDate;

												// console.log("第一個音檔的開始時間 " + value[0].starttime);
												// console.log("timestamp的前五分鐘" + newevent.starttime);
												var startTime = (eventA.starttime - value[0].starttime) / 1000;
												// console.log("最後一個音檔的結束時間 " + value[value.length-1].endtime);
												// console.log("timestamp的後五分鐘" + newevent.endtime);
												var lastTime = (value[value.length - 1].endtime - eventA.endtime) / 1000;
												var endTime = totalduration - lastTime;
												// console.log(lastTime)
												// console.log(totalduration-startTime-lastTime)


												// console.log("==========>  新增音檔的剪輯  開始  <==========")
												// console.log("fileNameList : " + fileNameList);
												// console.log("eventid : " + eventA.id);
												// console.log("microid : " + key);
												// console.log("startTime : " + startTime);
												// console.log("endTime : " + endTime);
												// console.log("timeStamp : " + timeStamp);
												// console.log("==========>  新增音檔的剪輯  結束  <==========")
												getTenMinAudio(fileNameList, startTime, endTime, timeStamp, eventA.id, key)

												// 新增前後10分鐘的音檔至DB
												// console.log("耶! 我在改這邊!")
												var newaudioTen = new AudioTen();
												newaudioTen.audioName = eventA.id + "_" + key + ".wav";
												newaudioTen.eventId = eventA.id;
												newaudioTen.microId = key;
												newaudioTen.filePath = audioTenPrefix + eventA.id + "_" + key + ".wav";


												newaudioTen.save(function (err) {
													if (err) {
														console.error(err);
														res.status(500).json({
															result: -1,
															message: err
														});
														return;
													}

													// console.log("成功新增事件前後五分鐘之音檔至資料庫audioTen")
													// console.log("新增之音檔資訊: --------------------")
													// console.log(newaudioTen)
													// console.log("------------結束音檔資訊------------")
													map1.set(key, audioTenPrefix + newaudioTen.audioName);
													// console.log(eventA.id)
													EventA.findByIdAndUpdate(eventA.id, {
														"audiocut": map1
													}, function (err, doc) {
														if (err) {
															console.error(err);
															res.status(500).json({
																result: -1,
																message: err
															});
															return;
														}
													});
												})
											});
									}
								})
							})
						});
					})
				}).catch(err=>{ console.log(audio);console.log("scanAudio "+err)});
			});
		});
	}
}