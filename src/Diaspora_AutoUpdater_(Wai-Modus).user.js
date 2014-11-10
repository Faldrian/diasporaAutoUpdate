// ==UserScript==
// @name        Diaspora AutoUpdater (Wai-Modus)
// @namespace   my own
// @description Automatically updates the currently shown stream.
// @include     https://*/stream
// @grant		none
// @downloadURL	https://github.com/Faldrian/diasporaAutoUpdate/raw/master/src/Diaspora_AutoUpdater_(Wai-Modus).user.js
// @updateURL	https://github.com/Faldrian/diasporaAutoUpdate/raw/master/src/Diaspora_AutoUpdater_(Wai-Modus).user.js
// @version     1.2.1
// ==/UserScript==


function wrapper() {
window.d_autoupdater = function() {} // create Namespace

// Stores the last shown entry
window.d_autoupdater.latest_entry = null;
window.d_autoupdater.last_marked_entry = null;
window.d_autoupdater.title = document.title;

window.d_autoupdater.setup = function() {
	// Model - Modifications: I have to override some functions to hack into backbone.js
	window.app.stream.autoreload_on = false;
	
	window.app.stream.url = function(){
		// Modify the behaviour with a switch, so it works as usual when initite-scroll calls this function. Returns what we want, when we are in auto-update phase.
		if(this.autoreload_on) {
			return this.basePath();
		} else {
			return _.any(this.items.models) ? this.timeFilteredPath() : this.basePath();
		}
	}

	window.app.stream.autoupdate = function() {
		// Store the current top Element, before fetching new entries from diaspora-server.
		if(window.d_autoupdater.latest_entry == null) {
			window.d_autoupdater.latest_entry = $('#main_stream > div > div:not(.post_preview)').first();
		}
		
		// Fetch new entries and let them be rendered.
		window.app.stream.autoreload_on = true; // switch to "autoupdate-mode". We force usage of the "newest posts" url instead of "load older posts" when scrolling down.
		window.app.stream.fetch();
		window.app.stream.autoreload_on = false; // and switch back - the user may scroll the page to bottom and we need usual functionality.
	
	}
	
	window.app.stream.on('fetched', function() {
		setTimeout(function() {
			if(window.d_autoupdater.latest_entry != null) {
				// Hide all new posts
				var newPostCount = 0;
				var AvatarUrl = $('#user_menu li:nth-child(2) > a').attr('href');
				// Hide all entries, that are new and not: the "show posts"-button or the Post-preview-area
				window.d_autoupdater.latest_entry.prevAll(':not(.post_preview)').not('#main_stream_refresh_button').each(function(index, element) {
					var postAvatarUrl = $(element).children().children().first().attr('href');
					// Check if the post is my own - own posts should be shown immediately, because they may have been just sent via publisher.
					if(AvatarUrl != postAvatarUrl) {
						$(element).css('display','none');
						newPostCount = newPostCount + 1;
					}
				});
				
				// Push the preview to the top of the stream, so newly loaded entries are below publisher & preview-area
				$('#main_stream > div').prepend($('#main_stream > div > div.post_preview'));
				
				if(newPostCount > 0) { // Show the "show posts" button only if there are new posts that are currently hidden
					// Insert "show hidden posts"-Button. Remove old instance, if any.
					$('#main_stream_refresh_button').remove();
					// The Button has to be inserted ON TOP of the entries, but BELOW the preview-area!
					if(newPostCount === 1) {
                        			messageString="new post";
        					} else {
                        			messageString="new posts";
                			}
					window.d_autoupdater.latest_entry.before('<div id="main_stream_refresh_button" style="margin-top:15px; border: 1px solid #3f8fba; background-color: #cae2ef; padding: 6px; text-align:center;">' + newPostCount +' '+messageString+'</div>');
					
					$('#main_stream_refresh_button').click(function() {
						window.d_autoupdater.latest_entry.prevAll().css('display',''); // Show old entries
						window.d_autoupdater.latest_entry.css('border-top', '1px solid #3f8fba'); // Add horizontal bar to mark the position where new entries start
						if(window.d_autoupdater.last_marked_entry != null) {
							window.d_autoupdater.last_marked_entry.css('border-top',''); // Remote horizontal bar from old position
						}
						window.d_autoupdater.last_marked_entry = window.d_autoupdater.latest_entry;
						window.d_autoupdater.latest_entry = null; // clear the entry so we can set it again some time
					
						$('#main_stream_refresh_button').remove(); // Remote "show posts" button - it has been clicked, there will be no posts to show now.
						
						// Use document title without any number in it.
						document.title = window.d_autoupdater.title;
					});
					
					// Update title of the window - show number of new (hidden) posts there
					document.title = "(" + newPostCount + ") " + window.d_autoupdater.title
				}
				
				console.log("AutoUpdater cycle finished.");
			}
			}, 50); // The whole thing is wrapped in a timeout. NOT ELEGANT. But we need to fire AFTER backbone.js has finished updating models and rendering the posts, so we can hide them again.
			
		});
	
	setInterval(window.app.stream.autoupdate, 90*1000); // 1.5 minutes interval
	console.log("AutoUpdater installed, timer started.");
}

setTimeout(window.d_autoupdater.setup, 2000); // Wait for javascript / backbone.js initialization to be over, before we hijack and install our scripts

} // end of wrapper


// Check if the page is a Diaspora-Pod (all Pods have a meta-element with "Diaspora*" as content)
var isValidPod = false;
var meta_elements = window.document.getElementsByTagName('meta');
for(key in meta_elements) {
	if(meta_elements[key].getAttribute("content") == 'diaspora*') {
		isValidPod = true;
		break;
	}
}

if(isValidPod) {
	// inject code into site context
	var script = document.createElement('script');
	script.appendChild(document.createTextNode('('+ wrapper +')();'));
	(document.body || document.head || document.documentElement).appendChild(script);
}
