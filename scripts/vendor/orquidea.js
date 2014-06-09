/*
The MIT License (MIT)

Copyright (c) 2014 Alexander Forselius

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/

(function ($) {
	window.orquidea = {
		reoslvers: [],
		players: [],
		playIndex: 0,
		song: null,
		playPause: function (uri) {
			var self = $('*[data-uri="' + (uri) + '"]')[0];
			if (window.orquidea.players[uri].status == STATUS_IDLE) {
				if (window.orquidea.song != null) {
					window.orquidea.song.stop();
				}
				console.log("F");

				self.play();
			//	alert("Ta");
				return;
			} else if (window.orquidea.players[uri].status == STATUS_PLAYING) {
			
				self.pause();
				console.log("T");
				return;
			} else if (window.orquidea.players[uri].status == STATUS_PAUSE) {
				self.resume();
				console.log("aT");
				return;
			}
		}
	};
	var ACUri = function (uri) {
		this.uri = uri;
		uri = uri.replace(/:\/\//g, ':').replace(/::/g, ':').replace(/\//g, ':');
		this.segments = uri.split(':')
		for (var i = 1; i < this.segments.length; i+= 2) {
			this[this.segments[i]] = decodeURI(this.segments[i + 1]);
		}
		// // console.log(this);
	}

	var STATUS_IDLE = 0;
	var STATUS_PLAYING = 1;
	var STATUS_PAUSE = 2;
	var Resolver = function (uri, node) {
		this.uri = uri;
		this.timer = null;
		this.duration = 3;
		this.position = 0;
		this.node = node;
		this.status = 0;
		
	}

	Resolver.prototype = {
		
		
		stop: function () {
			

		},
		play: function () {
		},
		resume: function () {

		},
		/**
		 * Loads metadata for a song
		 **/
		load: function (cb) {
		},

		/***
		 * Used by the generic resolver to ask if this resolver can resolve a source
		 **/
		lookup: function (query, callback) {
		}
	};

	/**
	 * checks if the resolver matches the uri
	 **/
	Resolver.matchesUri = function (uri) {
		return false;
	};

	Resolver.initialize = function () {
		// TODO Move initiation to here
	};

	var MockResolver = function (uri, node) {
		this.uri = uri;
		this.timer = null;
		this.duration = 3;
		this.position = 0;
		this.node = node;
		this.status = STATUS_IDLE;
	}
	MockResolver.prototype = new Resolver();
	MockResolver.prototype = {
		
		
		stop: function () {
			clearInterval(this.timer);
			this.timer = null;
			this.status = STATUS_IDLE;
		},
		play: function () {
			this.status = STATUS_PLAYING;
			var self = this;
			self.position = 0;
			// // console.log("T");
			this.timer = setInterval(function () {
				self.position += 1;
				if (self.position >= self.duration) {
					
					self.stop();	
					// // console.log("A");
					var stopEvent = new CustomEvent('trackended', {
						'track': this
					});
					// // console.log(stopEvent);
					window.dispatchEvent(stopEvent);
				}
				// // console.log(self.position);
			}, 1000);
		},
		resume: function () {
			this.status = STATUS_PLAYING;
			var self = this;
			// // console.log("T");
			this.timer = setInterval(function () {
				self.position += 1;
				if (self.position >= self.duration) {
					
					self.stop();	
					// // console.log("A");
					var stopEvent = new CustomEvent('trackended', {
						'track': this
					});
					// // console.log(stopEvent);
					window.dispatchEvent(stopEvent);
				}
				// // console.log(self.position);
			}, 1000);
		},
		/**
		 * Loads metadata for a song
		 **/
		load: function (cb, data) {
			// // console.log("Loading");
			// // console.log("Data", data);
			setTimeout(function () {
			
				cb({
					'title': data.track,
					'artists': [
						{
							'name': data.artist,
							'uri': ''
						}
					],
					'album': {
						'name': data.album,
						'uri': ''
					}
				});
			}, 1000);
		},

		
	};
	 /*** Used by the generic resolver to ask if this resolver can resolve a source
	 **/
	MockResolver.lookup = function (query, callback) {
			callback(this, [query]);
	};
	MockResolver.matchesUri = function (uri) {
		return uri.match(/^resolver\:/);
	};

	MockResolver.initialize = function () {
		// TODO Move initiation to here
	};

	/**
	 * Generic resolver
	 **/
	var GenericResolver = function (uri) {
		this.uri = uri;
		this.query = new ACUri(uri);
		this.status = STATUS_IDLE;

	}
	GenericResolver.prototype = new Resolver();
	GenericResolver.prototype = {
		
		
		stop: function () {
			var self = this;
			self.player.stop();
			this.status = STATUS_IDLE;
		},
		play: function () {
			var self = this;
			self.player.play();
			this.status = STATUS_PLAYING;
		},
		pause: function () {
			var self = this;
			this.player.pause();
			this.status = STATUS_PAUSE;
		},
		resume: function () {
			var self = this;
			this.player.resume();
			this.status = STATUS_PLAYING;
		},
		/**
		 * Loads metadata for a song
		 **/
		load: function (cb) {


			var self_resolver = this;
			// // console.log("A");
			// Iterate through all available resolvers and 
			for (var i = 0; i < window.orquidea.resolvers.length; i++) {
				var resolver = window.orquidea.resolvers[i];
				// // console.log(resolver.lookup);
				if ('lookup' in resolver)
				resolver.lookup(this.query, function (resolver, tracks) {
					// // console.log(tracks);
					
					if (tracks && tracks.length > 0) {
						//alert(tracks[0].title);
						// // console.log("Tracks", tracks);
						self_resolver.player = new resolver(self_resolver.uri);
						// // console.log(self_resolver.player.load);

						self_resolver.player.load(cb, tracks[0]);
					}

				});
			}
		}
	};
	/**
	 * checks if the resolver matches the uri
	 **/
	GenericResolver.matchesUri = function (uri) {
		//alert("A");
		var d = uri.match(/^music\:/);
		if (d) {
			//alert(uri);
		}
		return d;
	};

	GenericResolver.initialize = function () {
		// TODO Move initiation to here
	};



window.onYouTubeIframeAPIReady = function ()
{
	
}

	//GenericResolver.prototype = new Resolver();

	/**
	 * Youtube resolver
	 **/
	var YouTubeResolver = function (uri) {
		this.uri = uri;
		this.status = STATUS_IDLE;
	};
	YouTubeResolver.prototype = new Resolver;
	YouTubeResolver.prototype = {
		onPlayerReady: function (event) {
			event.target.playVideo();
			// // console.log("A");
			this.status = STATUS_PLAYING;
		},
		onPlayerStateChange: function (event) {
	        if (event.data == YT.PlayerState.ENDED) {
	          var evt = new CustomEvent('trackended', {

	          });
	          this.status = STATUS_IDLE;
	          window.dispatchEvent(evt);
	        }
     	},
     	stop: function () {
     		if (this.player && this.player.stopVideo)
     		this.player.stopVideo();
     		this.status = STATUS_IDLE;
     	},
     	pause: function () {
     		if (this.player && this.player.pauseVideo) {
     			this.player.pauseVideo();
     		}
     		this.status = STATUS_PAUSE;
     	},
     	resume: function () {
     		if (this.player && this.player.playVideo) {
     			this.player.playVideo();
     		}
     		this.status = STATUS_PLAYING;
     	},
     	play: function () {
     		var data = this.data;
     		// console.log(data.id);
     		// // console.log(data);
     		var player = document.querySelector( '#ytplayer_' + data.id);
     		// console.log("Player", player);
     		if (player != null) {
     			// console.log("Remove player");
     			player.parentNode.removeChild(player);
     		}
			var divPlayer = document.createElement('div');
			divPlayer.setAttribute('id', 'ytplayer_' + data.id);
			//divPlayer.style.display = 'none';
			document.body.appendChild(divPlayer);
			// // console.log("T");
			var yself = this;
			window.onYouTubeIframeAPIReady = function () {
				yself.status = STATUS_PLAYING;
				// console.log(data);
	      		// // console.log(data);
	      		yself.player = new YT.Player('ytplayer_' + data.id, {
					'height': 0,
					'width': 0,
					'videoId': data.id,
					'events': {
			            'onReady': yself.onPlayerReady,
			            'onStateChange': yself.onPlayerStateChange
			      	}
				});	
			}
			if (document.querySelector('#ytInclude' + data.id) == null) {
				try {
					var tag = document.createElement('script');
					tag.src = "https://www.youtube.com/iframe_api";
				
					tag.setAttribute('id', 'ytInclude');
		      		document.head.appendChild(tag);
		      		// // console.log(tag);

	      			// console.log("Invoking YouTube");
	      			window.onYouTubeIframeAPIReady();

		      	} catch (e) {
		      		try {
		      			// console.log("Invoking YouTube");
	      				window.onYouTubeIframeAPIReady();
		      		} catch (e) {

		      		}
		      	}


	      	} else {

		      			// console.log("Invoking YouTube");
	      		window.onYouTubeIframeAPIReady();
	      	}
     	},
		/**
		 * Loads a youtube resource
		 **/
		load: function (callback, data) {
			// Direct load from URI
			//alert(this.uri);
			if (this.uri.indexOf('https://www.youtube.com/watch?') == 0) {
				
				var id = this.uri.split(/=/g)[1];
				// // console.log(id);
				var data = {
					'title': '',
					'id': id,
					'artists': [{
						'title': '',
						'uri': ''
					}],
					'album': {
						'title': ''
					},
					'source': {
						'name': 'YouTube',
						'uri': 'http://www.youtube.com'
					}
				};
				this.data = data;
				callback(data);
				return;
			}
			this.data = data;
			callback(data);
		 
			
		}
	};
	YouTubeResolver.lookup = function (q, callback) {
		// // console.log(q);
		var self = this;
		q.track = q.track.replace('+', ' ');
		q.artist = q.artist.replace('+', ' ');
		q.album = q.album.replace('+', ' ');
		
		// TODO Change into Ajax
		$.getJSON('https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&q=' + encodeURI('"' +q.artist + '"' + ' ' + '"' +q.album + '"') +'&key=' + YOUTUBE_API_KEY, function (data) {
			// // console.log(data.items);
			for (var i = 0; i < data.items.length; i++) {
				var item = data.items[i];
				// // console.log(item.snippet.title);

				if (item.snippet.title.indexOf(q.track) > -1 || item.snippet.title.indexOf(q.artist) > -1) {
					
					
					// // console.log(callback);
					//alert(callback);
					var tracks = [{
						'id': item.id.videoId,
						'title': item.snippet.title,
						'artists': [{
							'name': q.artist,
							'uri': ''
						}],
						'album': {
							'name': ''
						},
						'source': {
							'name': 'YouTube',
							'uri': 'http://www.youtube.com'
						}

					}];
					// // console.log(tracks);
					callback(self, tracks);
				}  else {
				}
			}
			callback(false);
		})
	};

	var SOUNDCLOUD_CLIENT_ID = '73d7395c678c204d84722d4f66477a70';
	var SOUNDCLOUD_REDIRECT_URI = 'http://orquidea.bungalowplatform.com';
	YouTubeResolver.matchesUri = function (uri) {
		//alert(uri);
		return uri.indexOf('https://www.youtube.com/watch') == 0;
	}

	YouTubeResolver.initialize = function () {
		// TODO Move initiation to here
	};

	/***
	 * Soundcloud resolver
	 **/
	var SoundcloudResolver = function (uri) {
		this.uri = uri;
	}

	SoundcloudResolver.prototype = {
		load: function (data, cb) {
			var data = {
				'title': '',
				'id': id,
				'artists': [{
					'title': '',
					'uri': ''
				}],
				'album': {
					'title': ''
				},
				'source': {
					'name': 'Soundcloud',
					'uri': 'http://www.soundcloud.com'
				}
			};
			this.data = data;
			callback(data);
		},
		play: function () {
			var data = this.data;
     		// console.log(data.id);
     		// // console.log(data);
     		var player = document.querySelector( '#scplayer_' + data.id);
     		// console.log("Player", player);
     		if (player != null) {
     			// console.log("Remove player");
     			player.parentNode.removeChild(player);
     		}
			var divPlayer = document.createElement('div');
			divPlayer.setAttribute('id', 'ytplayer_' + data.id);
			//divPlayer.style.display = 'none';
			document.body.appendChild(divPlayer);
			// // console.log("T");
			var yself = this;

			if (document.querySelector('#scInclude' + data.id) == null) {
				try {
					

		      	} catch (e) {
		      		try {
		      			// console.log("Invoking YouTube");
	      				window.onYouTubeIframeAPIReady();
		      		} catch (e) {

		      		}
		      	}


	      	} else {

		      			// console.log("Invoking YouTube");
	      		window.onYouTubeIframeAPIReady();
	      	}
		},

	};
	/*** 
	 * Initialize soundcloud
	 **/
	SoundcloudResolver.initialize = function () {
		var tag = document.createElement('script');
		tag.src = "h//connect.soundcloud.com/sdk.js";
	
		tag.setAttribute('id', 'scInclude');
  		document.head.appendChild(tag);
  		// // console.log(tag);

		// console.log("Including Soundcloud");
		SC.initialize({
		    client_id: SOUNDCLOUD_CLIENT_ID,
		    redirect_uri: SOUNDCLOUD_REDIRECT_URI,
	  	});
		
	}

	/**
	 * Resolvers for song playback
	 **/
	window.orquidea.resolvers = [YouTubeResolver, GenericResolver, Resolver];

	for (var i = 0; i < window.orquidea.resolvers.length; i++) {
		var resolver = window.orquidea.resolvers[i];
		resolver.initialize(); // Initialize resolver
	}

	window.addEventListener('trackended', function (e) {
		window.orquidea.playIndex += 1;
		// // console.log("play index", window.orquidea.playIndex);
		window.orquidea.song.classList.remove('orquidea-song-play');
		var songs = $('.orquidea-song');
		// // console.log(playIndex, songs.length);
		if (window.orquidea.playIndex < songs.length) {
			var song = songs[window.orquidea.playIndex];
			// // console.log("Next song", song);
			// // console.log(song.getAttribute('data-uri'));
			// // console.log("Start playing song");
			// // console.log(song);
			song.play();
		}
	}, false);

	document.addEventListener('mousedown', function (event) {
		var songs = $('.orquidea-song');
		// // console.log(songs);
		for (var i = 0; i < songs.length; i++) {
			var song = songs[i];

			var bounds = song.getBoundingClientRect();
			// // console.log(bounds);
			if (!(event.pageX >= bounds.left && event.pageX <= bounds.left + bounds.width && event.pageY >= bounds.top && event.pageY <= bounds.top + bounds.height)) {

			song.classList.remove('orquidea-song-selected');
			}
			else {
				
			}
		}
	})
	/***
	 * Neutralizes id from spatial tokens
	 **/
	var _orqId = function (uri) {
		return uri.replace(/\:/g, '__').replace(/\//g, '__').replace(/\+/g, '__').replace(/\-/g, '__¨').replace(/\%/g, '__').replace(/\?/g, '__').replace(/\=/g, '__').replace(/\./g, '__');
	};
	$.fn.orquidea = function (options) {
		if (this.hasClass('orquidea-tracklist')) {
			$('.orquidea-song', this).each(function (i) {
				$(this).orquidea();
			})
			return;
		}
		if (this.hasClass('orquidea-song')) {
			var self = this;	
			this.setUri = function (uri) {
				// // console.log(arguments);
				this.attr('data-id', _orqId(uri));
				// Set the music resolver based on the uri

				// Query for a matching resolver
				
				for (var i = 0; i < window.orquidea.resolvers.length; i++) {
					// // console.log("Resolver", window.orquidea.resolvers[i]);
					if (window.orquidea.resolvers[i].matchesUri(uri)) {
						this.resolver = window.orquidea.resolvers[i];

						break;
					}

				}
				if (!this.resolver) {
					this.innerHTML = 'Error';
					this.addClass('ac-error');
					return;
				}
				this.player = new this.resolver(uri);
				// // console.log(this.player);
				window.orquidea.players[uri] = this.player;
				var self = this;

				this.player.load(function (song) {
					// // console.log("A", song);
					// // console.log(arguments);;
					$(' #throbber').hide();
					var sel = '.orquidea-song[data-id="' + _orqId(uri) + '"]';
					var elm = $(sel)[0];
					
					
					if (song.title)
					$(sel + ' #title').first().html(song.title);
					if (song.artists)
					$(sel + ' #artist').first().html(song.artists[0].name);
					if (song.album)
					$(sel + ' #album').first().html(song.album.name);
					$(sel + ' #source').first().html(song.source.name);
				});

			}

			var html = ('<table width="100%"><tr><td width="16"><a id="btn-play" onclick="orquidea.playPause(\'' + this.attr('data-uri') + '\')"></a></td><td><a id="title"></a> <a id="artist"/> </td></tr></table>');
			if (this[0].tagName == 'TR') {
				html = '<td width="32"><a id="btn-play" href="#" onclick="	orquidea.playPause(\'' + this.attr('data-uri') + '\')"></a></td><td width="32"><span id="throbber">Loading</span><a id="title"/><a id="version"></a></td><td><a id="artist"/></td><td><a id="duration"></a></td><td><a id="album" /></td><td><a id="source"></a></td><td><td></td>';
			}
			
			this.html(html);
			this.setUri(this.attr('data-uri'));

			$('#title', this[0]).first().html(this.attr('data-title'));
			$('#artist', this[0]).html(this.attr('data-artist'));
			$('#album', this[0]).html(this.attr('data-album'));
			this.setUri(this.attr('data-uri'));
			var self = this;
			this.mousedown(function (e) {

				var songs = $('.orquidea-song');
				// // console.log(songs);
				for (var i = 0; i < songs.length; i++) {

					var song = songs[i];
					song.classList.remove('orquidea-song-selected');
				
				}
				this.classList.add('orquidea-song-selected');

			});

			this.on('dblclick', function (event) {
				if (window.orquidea.song != null)
				window.orquidea.song.stop(); // Stop current song
				self[0].play();
			});
			this[0].stop = function () {
				this.classList.remove('orquidea-song-play');
				window.orquidea.players[this.getAttribute('data-uri')].stop();
			}
			this[0].pause = function () {
				this.classList.add('orquidea-song-play-pause');
				window.orquidea.players[this.getAttribute('data-uri')].pause();
			}
			this[0].resume = function () {
				this.classList.remove('orquidea-song-play-pause');
				window.orquidea.players[this.getAttribute('data-uri')].resume();
			}
			this[0].play = function () {
				var songs = $('.orquidea-song');
				// // console.log(songs);
				if (window.orquidea.song)
				window.orquidea.players[this.getAttribute('data-uri')].stop();
				this.classList.add('orquidea-song-play');
				var i = 0;
				var self = this;
				songs.each(function (i) {
					var song = $(this);
					if ($(self).attr('data-uri') == $(song).attr('data-uri')) {
						// // console.log("THIS");
						window.orquidea.song = song;
						window.orquidea.playIndex = i;
					// // console.log("A");
				// // console.log("play index", window.orquidea.playIndex);
						// // console.log(song.player);
						window.orquidea.players[$(self).attr('data-uri')].status = STATUS_PLAYING;
						window.orquidea.players[$(self).attr('data-uri')].play();
					}
				});
				window.orquidea.song = this;
			}
		}
	};
	
}(jQuery));
				