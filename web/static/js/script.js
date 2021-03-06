/**
 * Main UI script
 *  This file is included in every page
 */

$(document).ready(function() {
	// Init toolbar component
	window.toolbar = $('header').toolbar();

	addSettingsActionIcon();
});

/**
 * Adds a refresh action icon in toolbar
 */
function addRefreshActionIcon(autoRefresh) {
	// Add toolbar actions
	window.toolbar.addActionIcon('mdi-refresh', 'Refresh graphs', false, function() {
		autoRefresh.refreshAll();
	});
}

/**
 * Adds a settings action icon in toolbar
 */
function addSettingsActionIcon() {
	// Prepare settings modal
	var settingsModal = null;
	var settingsModalWrap = $('#settingsModalWrap');

	// Set settings values
	var graphExt_input = $('#graph_ext').val(getCookie('graph_ext', 'png'));
	var graphAutoRefresh_input = $('#graph_autoRefresh').prop('checked', getCookie('graph_autoRefresh', 'true') == 'true');

	settingsModalWrap.find('#settings_save').click(function() {
		// Save parameters
		var graphExt = graphExt_input.val();
		setCookie('graph_ext', graphExt);

		var graphAutoRefresh = graphAutoRefresh_input.prop('checked');
		setCookie('graph_autoRefresh', graphAutoRefresh);

		// Update UI
		if (window.graphs !== undefined) {
			$.each(window.graphs, function (index, graph) {
				$(graph).data('graph').setGraphExt(graphExt);
			});
		}

		if (window.autoRefresh !== undefined) {
			if (graphAutoRefresh)
				window.autoRefresh.start();
			else
				window.autoRefresh.stop();
		}

		// Close modal
		settingsModal.hide();
	});

	settingsModal = new Modal('settings', settingsModalWrap, {
		size: 'small',
		title: 'Settings'
	});

	window.toolbar.addActionIcon('mdi-settings', 'Settings', true, function() {
		settingsModal.show();
	});
}

function removeTabIndexOutline() {
	// Enable outline on elements only if browser DOM using <Tab> key
	$('[tabindex]').focus(function() {
		$(this).css('outline', 'none');
	}).on('keyup', function (event) {
		if(event.keyCode == 9)
			$(this).css('outline', '');
	});
}

/**
 * Saves a var in URL
 * @param key
 * @param val
 */
function saveState(key, val) {
	// Check if history.pushState is supported by user's browser
	if (!history.pushState)
		return;

	// Encode key=val in URL
	var qs = new Querystring();
	qs.set(key, val);

	// Replace URL
	var url = $.param(qs.params);
	var pageName = $(document).find('title').text();
	window.history.replaceState('', pageName, '?' + url);
}

/**
 * Returns an array of the parameters sitting in the URL
 * 	Source: http://stackoverflow.com/posts/2880929/revisions
 */
function getURLParams() {
	var match,
		pl     = /\+/g,  // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
		query  = window.location.search.substring(1);

	var urlParams = {};
	while (match = search.exec(query))
		urlParams[decode(match[1])] = decode(match[2]);

	return urlParams;
}

/**
 * Creates a cookie
 * Source: http://www.w3schools.com/js/js_cookies.asp
 */
function setCookie(cname, cvalue, exdays) {
	if (exdays === undefined)
		exdays = 365;

	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}

/**
 * Get a cookie
 * Source: http://www.w3schools.com/js/js_cookies.asp
 */
function getCookie(cname, defaultValue) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
	}

	return defaultValue;
}
