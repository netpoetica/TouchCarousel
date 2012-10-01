/* 	
	Name: TouchCarousel.js
	Author: Keith Rosenberg (http://www.github.com/netpoetica)
	Description: 
	TouchCarousel is an infinitely-looping carousel which can be configured in many ways. See
	options for details. TouchCarousel assumes you want this carousel to work on a mobile
	device or tablet - if that's not the case, pass options with touchDisabled = true. If you
	don't want it to autoscroll, pass options object with auto = false. You can specify buttons
	of your own that are already in the DOM, or you can use the default buttons. If touch is
	disabled, the default buttons are invisible objects on the right and left that the user can
	click to scroll. These can be styled by their respective class names or ID names, ie:
	
				id="touch-carousel-btn-left" class="touch-carousel-btn"
				
	Touch carousel has dependencies on jQueryUI, jQuery, and jQuery Touch Punch. These awesome
	libraries can be found at the following locations:
	
				https://github.com/jquery/jquery
				https://github.com/jquery/jquery-ui
				https://github.com/furf/jquery-ui-touch-punch
	
	Feel free to fork it, use it, make it a million times better, whatever you like, but I would definitely
	like it best if you report issues on GitHub so I can work them out. If you solve an issue, I'd love to
	know how you do it! Thanks much,
	- Keith
*/
var TouchCarousel = function(elem, options){
	var opt = options || {};
	
	/* **************** OPTION DETAILS ******************* *
		Options (args opt) can handle many, many things:
		opt.pageClass = 'className // NO DOT
		opt.animationDuration = 500 || 'slow'
		opt.auto = true || false
		opt.touchDisabled = true || false
		opt.autoDirection = 'right' || 'left'
		opt.autoDuration = 1000
		opt.leftButton = '#element_id' || '.element_class' || 'tag_name' || '<div>Full Html</div>'
		opt.rightButton = '#element_id' || '.element_class' || 'tag_name' || '<div>Full Html</div>'
	****************************************************** */
	
	var autoIntervalRef = null;
	var containerWidth = $(elem).width();
	var containerHeight = $(elem).height();
	var currentPage = 0;
	var arrPages = $(elem).find('.' + opt.pageClass);
	var pageWidth = $(arrPages[0]).width();
	var pageHeight = $(arrPages[0]).height();
	var totalPages = arrPages.length - 1;
	var bIsAnimating = false; 
	var animationDuration = opt.animationDuration || 500;
	
	(function init(){
		// Setup style configurations, make sure all pages are in place
		$(elem).css({
			position: 'absolute',
			overflow: 'hidden'
		});
		
		// Position each page based on width
		var posCounter = 0;
		$(arrPages).each(function(){
			$(this).css({
				position: 'inherit',
				top: 0,
				left: String(pageWidth * posCounter) + 'px',
				display: 'inline-block'
			});
			posCounter++;	
		});
	
	}());
	
	/* ***** BUTTONS CONFIG ***** */
	var btns = {
		// By default, put invisible clickable areas on the very right and very left of the container
		left: opt.leftButton || $('<div id="touch-carousel-btn-left" class="touch-carousel-btn" style="z-index: 9999; background-color: #000000; position: inherit; top:0; left: 0; height: inherit; width:' + 0.1 * pageWidth + 'px;">&nbsp;</div>'),
		right: opt.rightButton || $('<div id="touch-carousel-btn-right" class="touch-carousel-btn" style="z-index: 9999; background-color: #000000; position: inherit; top:0; right: 0; height: inherit; width:' + 0.1 * pageWidth + 'px;">&nbsp;</div>')
	};
	
	/* *** TOUCHPAD CONFIG **** *
	 * 	If user didn't specify 	*
	 *	to have it disabled		*
	 * ************************ */
	if(!opt.touchDisabled){
		var touchPad, touchpadLeft, touchpadWidth;
		touchPad = $('<div class="touchpad"></div');
		$(touchPad).css({
			'z-index': 9998,	// Buttons need to be above the 9998 z-index
			'background-color': 'rgba(1,0,0,.1)',
			position: 'inherit',
			width: containerWidth + 'px',
			height: containerHeight + 'px'
		});
		$(touchPad).draggable({
			//scroll: false,
			axis: 'x',
			start: function() {
				alert('start');
				// touchpad dimensions
				touchpadLeft = $(this).position().left;
				touchpadWidth = $(this).width();
				
				//clear autoscroll interval
				clearInterval(autoIntervalRef);

			},
			drag: function(event, ui) {
			
            },
			stop: function() {
				alert('stop');
				var touchpadDeltaLeft =  $(this).position().left;	
				
				console.log('touchpadDeltaLeft = ' + touchpadDeltaLeft);
				console.log('touchpadLeft = ' + touchpadLeft);
				console.log('touchpadWidth = ' + touchpadWidth);
				
				if (touchpadDeltaLeft > (containerWidth / 2)) {				
					console.log('If dragged to the right further than halfway...');
					$(btns.right).trigger('click');
				} 
				else if (touchpadDeltaLeft < (containerWidth * -0.5)) {
					console.log('If dragged to the left further than halfway...');
					$(btns.left).trigger('click');
				} 
				
				// bounce back to start position
				$(this).css('left', 0);
			}
		})
		.prependTo(elem);	// Add the touchpad to the container
	}//End If touchDisabled
	else {
		// Touch has been disabled - add clickable buttons to right and left
		$(btns.left).prependTo(elem);
		$(btns.right).prependTo(elem);
	}
	/* END TOUCHPAD CONFIG */
	
	/* ****** EVENT MECHANISM ****** */
	$(btns.right).on('click', function(){
		if(bIsAnimating){ 
			// It's very important to make sure the pages are 
			// not currently animating to prevent button mashing
			return; 
		}
		else{
			bIsAnimating = true;
		}
		currentPage > 0 ? currentPage-- : currentPage = totalPages;
		var lastPage = $(arrPages)[currentPage];

		$(lastPage).css('left', - pageWidth);

		$(arrPages).animate(
			{"left": "+=" + pageWidth + "px"}, 
			animationDuration,
			function(){
				bIsAnimating = false;
			}
		);
	});
	$(btns.left).on('click', function(){
		if(bIsAnimating){ 
			return; 
		}
		else{
			bIsAnimating = true;
		}
		var mover = $(arrPages)[currentPage];
		currentPage < totalPages ? currentPage++ : currentPage = 0;
		$(arrPages).animate(
			{"left": "-=" + pageWidth + "px"}, 
			animationDuration,
			function(){
				if(mover){
					$(mover).css('left', totalPages * pageWidth);
				}    
				bIsAnimating = false;
			}
		);
	});
	/* END EVENTS */
	
	/* ****** AUTOPAGE MECHANISM ******* */
	if(opt.auto){
		autoIntervalRef = setInterval(function(){
			btns[opt.autoDirection || 'left'].trigger('click');
		}, opt.autoDuration || 3000);	// Default 3000
	}
};