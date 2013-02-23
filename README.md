Touch Carousel
=============

A jQuery/JavaScript Touch enabled, auto-scrolling and infinite carousel for all devices including mobile

TouchCarousel.js
by Keith Rosenberg (http://www.github.com/netpoetica)

TouchCarousel is an infinitely-looping, indexable carousel which can be configured in many ways. See
options for details. TouchCarousel assumes you want this carousel to work on a mobile
device or tablet - if that's not the case, pass options with touchDisabled = true. If you
don't want it to autoscroll, pass options object with auto = false. You can specify buttons
of your own that are already in the DOM, or you can use the default buttons. If touch is
disabled, the default buttons are invisible objects on the right and left that the user can
click to scroll. These can be styled by their respective class names or ID names, ie:
	
	id="touch-carousel-btn-left" class="touch-carousel-btn"
				
Touch carousel has dependencies on jQueryUI, jQuery, and touchSwipe. These awesome
libraries can be found at the following locations:
	
https://github.com/jquery/jquery
https://github.com/jquery/jquery-ui
https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
	
Feel free to fork it, use it, make it a million times better, whatever you like, but I would definitely
like it best if you report issues on GitHub so I can work them out. If you solve an issue, I'd love to
know how you do it! Thanks much,
- Keith
