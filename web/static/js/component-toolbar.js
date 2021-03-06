/**
 * Toolbar & navigation panel jQuery component
 */
(function($) {
	var Toolbar = function(elem, options) {
		this.elem = $(elem);
		this.options = options;
		this.metadata = this.elem.data('toolbar-options');
	};

	Toolbar.prototype = {
		defaults: {
			mobileTriggerWidth: 768
		},

		init: function() {
			var that = this;
			this.settings = $.extend({}, this.defaults, this.options, this.metadata);

			// Init component
			this.filterWrap = this.elem.find('.filter');
			this.actions = this.elem.find('.right').find('.actions');
			this.navigation = $('nav');
			this.navigationMask = $('.navigation-mask').click(function() {
				that.toggleNavigation(false);

				setCookie('nav_panel_reduced', true); // Save state
			});

			// Navigation toggle
			this.elem.find('#navigation-toggle').click(function() {
				var makeVisible = that.navigation.width() <= 0;
				that.toggleNavigation(makeVisible);

				setCookie('nav_panel_reduced', !makeVisible); // Save state
			});

			// Fixed toolbar
			this.pushBackContent();
			$(window).resize(function() {
				that.pushBackContent();
			});

			if ($(document).width() < 1260) {
				// Fixed when scrolling down
				var lastScrollPosition;
				$(document).scroll(function () {
					var scrollPosition = $(this).scrollTop();

					// Scrolling down
					if (scrollPosition > lastScrollPosition && scrollPosition > $('header').height()) {
						// If the header is currently showing
						if (!that.elem.is('.toolbar-hide'))
							that.elem.addClass('toolbar-hide');
					}

					// Scrolling up
					else {
						// If the header is currently hidden
						if (that.elem.is('.toolbar-hide'))
							that.elem.removeClass('toolbar-hide');
					}

					lastScrollPosition = scrollPosition;
				});
			}

			return this;
		},

		/**
		 * Updates content's margin-top property to exactly fit toolbar height
		 */
		pushBackContent: function() {
			$('#main').css('margin-top', this.elem.height() + 'px');
		},

		/**
		 * Called by each page to setup header filter
		 * @param placeholder Input placeholder
		 * @param onFilterChange Called each time the input text changes
		 */
		prepareFilter: function(placeholder, onFilterChange) {
			// Toggle filter container visibility
			this.filterWrap.show();

			var input = this.filterWrap.find('#filter'),
				cancel = this.filterWrap.find('#cancelFilter');

			// Set placeholder
			input.attr('placeholder', placeholder);

			// Create a delay function to avoid triggering filter on each keypress
			var delay = (function(){
				var timer = 0;
				return function(callback, ms){
					clearTimeout(timer);
					timer = setTimeout(callback, ms);
				};
			})();

			var updateFilterInURL = function() {
				// Put the filter query in the URL (to keep it when refreshing the page)
				var query = input.val();

				saveState('filter', query);
			};

			input.on('keyup', function() {
				var val = $(this).val();

				delay(function() {
					if (val != '')
						cancel.show();
					else
						cancel.hide();

					// Call onFilterChange
					onFilterChange(val);
					updateFilterInURL();
				}, 200);
			});

			cancel.click(function() {
				input.val('');
				$(this).hide();
				onFilterChange('');
				updateFilterInURL();
			});

			// Register ESC key: same action as cancel filter
			$(document).keyup(function(e) {
				if (e.keyCode == 27 && input.is(':focus') && input.val().length > 0)
					cancel.click();
			});

			// There may be a 'filter' GET parameter in URL: let's apply it
			var qs = new Querystring();
			if (qs.contains('filter')) {
				input.val(qs.get('filter'));
				// Manually trigger the keyUp event on filter input
				input.keyup();
			}
		},

		/**
		 * Transforms a string to weaken filter
		 * 	(= get more filter results)
		 * @param filterExpr
		 */
		sanitizeFilter: function(filterExpr) {
			return $.trim(filterExpr.toLowerCase());
		},

		/**
		 * Returns true whenever a result matches the filter expression
		 * @param filterExpr User-typed expression
		 * @param result Candidate
		 */
		filterMatches: function(filterExpr, result) {
			return this.sanitizeFilter(result).indexOf(this.sanitizeFilter(filterExpr)) != -1;
		},

		/**
		 * Adds an action icon to the toolbar
		 * @param icon Icon class (mdi-refresh)
		 * @param text Action name
		 * @param overflow boolean: if true, will be added to the overflow
		 * @param callback
		 */
		addActionIcon: function(icon, text, overflow, callback) {
			var body = $('body');

			// Force overflow on mobiles
			if (body.width() < 768)
				overflow = true;

			if (overflow) {
				// Add overflow button if it doesn't exist yet
				if (!this.elem.find('.overflow').length) {
					// Create overflow button
					var overflowButton = $('<div />')
						.addClass('action-icon overflow')
						.click(null)
						.append(
							$('<i />').addClass('mdi mdi-dots-vertical')
						)
						.appendTo(this.actions);

					// Create list
					this.overflowList = overflowButton.list('overflow');
				}

				// Add item to list
				var item = this.overflowList.addItem(icon, text, callback);

				this.pushBackContent();

				return item;
			} else {
				var button = $('<div />')
					.addClass('action-icon')
					.click(callback)
					.append(
						$('<i />').addClass('mdi ' + icon)
					)
					.prependTo(this.actions);

				// Tooltip for text
				button.tooltip(text, {
					singleLine: true
				});

				this.pushBackContent();

				return button;
			}
		},

		toggleNavigation: function(visible) {
			var targetWidth = visible ? 200 : 0;
			this.navigation.css('width', targetWidth + 'px');

			// Toggle navigation mask if necessary
			if ($(document).width() < this.settings.mobileTriggerWidth) {
				if (visible)
					this.navigationMask.fadeIn(150);
				else
					this.navigationMask.fadeOut(150);
			}
		}
	};

	Toolbar.defaults = Toolbar.prototype.defaults;

	$.fn.toolbar = function(options) {
		return new Toolbar(this.first(), options).init();
	};

	window.Toolbar = Toolbar;
}(jQuery));
