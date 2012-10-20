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

/*  *
 *  
 *  TODO: - investigate using .last()
 *  
 *  */
console.log("Loading TouchCarousel.js...")
var TouchCarousel = function(elem, options){
    console.log("Instantiating TouchCarousel.js...");
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
    opt.pagerImageNormal = '/imgname.jpg'
    opt.pagerImageActive = '/imageactivename.jpg'
    opt.touchPadClass = 'className'
    opt.touchPadVisibility = 0.0 to 1.0
    ****************************************************** */

    var _this = this;
    var autoIntervalRef = null;
    var pageIndicator = null;
    var containerWidth = opt.width || $(elem).outerWidth();
    var containerHeight = opt.height || $(elem).outerHeight();
    var currentPage = 0;
    var arrPages = $(elem).find('.' + opt.pageClass);
    var pageWidth = opt.width || $(arrPages[0]).outerWidth();
    var pageHeight = opt.height || $(arrPages[0]).outerHeight();
    var totalPages = arrPages.length - 1;
    var bIsAnimating = false;
    var animationDuration = opt.animationDuration || 500;
    var btns = {};
    
    // Debug
    //console.log("TouchCarousel.js Debug");
    //console.log("elem = " + elem);
    //console.log($(elem));
    //console.log("containerWidth = " + containerWidth);
    //console.log("containerHeight = " + containerHeight);
    //console.log("currentPage = " + currentPage);
    //console.log("arrPages = ");
    //console.log($(arrPages));
    //console.log("arrPages[0] = ");
    //console.log($(arrPages[0]));
    //console.log("pageWidth = " + pageWidth);
    
    // Init...
    // Setup style configurations, make sure all pages are in place
    $(elem).css({
        position: 'absolute',
        overflow: 'hidden',
        height: containerHeight,
        width: containerWidth
    });

    // Initialize the page indicator
    if(!opt.pageIndicatorDisabled ){
        pageIndicator = $('<ul id="touch-carousel-pager" style="z-index: 9997; position: inherit;"></ul>');
    }

    // Position each page based on width
    var posCounter = 0;
    $(arrPages).each(function(){
        //Debug
        //console.log("$(arrPages).each()...")
        //console.log($(this));
        //console.log("pageWidth = " + pageWidth);
        //console.log("posCounter = " + posCounter);
        //console.log("css.left = " + String(pageWidth * posCounter) + 'px');
        $(this).css({
            position: 'inherit',
            top: 0,
            left: String(pageWidth * posCounter) + 'px',
            display: 'inline-block',
            height: pageHeight
        });

        // Add a page indicator for this page
        if(!opt.pageIndicatorDisabled ){
            $(pageIndicator).append('<li class="touch-carousel-pager-item" id ="item-' + posCounter + '" style="display: inline;"><img src="' + String(posCounter == currentPage ? opt.pagerImageActive : opt.pagerImageNormal) + '"</li>');
        }
        posCounter++;

    });

    if(!opt.pageIndicatorDisabled ){      
        $(elem).append(pageIndicator);      // Add the populated inidicator
    }
    
    /* ******* UPDATE ************* *
     * General update function used 
     * to redraw pager and what-not 
     * **************************** */
    function update(){  
        //console.log("TouchCarousel.update()...");
        // Update the page images depending on current page
        
        var e = jQuery.Event("TouchCarousel.Update", { currentPage: currentPage });
        
        $(elem).trigger(e);
        var imgCounter = 0;
        
        //console.log("imgCounter = " + imgCounter);
        //console.log("currentPage = " + currentPage);
        //console.log("pagerImageActive = " + opt.pagerImageActive);
        //console.log("pageImageNormal = " + opt.pagerImageNormal);
        
        $('.touch-carousel-pager-item').find('img').each(function(){   
            $(this).attr('src', String(imgCounter == currentPage ? opt.pagerImageActive : opt.pagerImageNormal));
            imgCounter++;
        });

       
    }
    
    /* *** GET DIMENSIONS ***
     * Public api function for
     * another object to get the
     * width, height, x, and y of
     * the current carousel * */
    this.getDimensions = function(){
        var offset = $(elem).offset();
        
        return {
            x: offset.top,
            y: offset.left,
            h: $(elem).outerHeight(),
            w: $(elem).outerWidth()
        }
    }
    
    /* ******** CURRENT PAGE ********
     * getter
     * ****************************** */
    this.getCurrentPage = function(){
        return currentPage;
    }
    /* ***** DESTROY ******* *
     * Destroy the current carousel (events, etc)
     * ********************* */
    this.destroy = function(){
        if((btns.left !== null) && (btns.right !== null)){
            $(btns.left).remove();
            $(btns.right).remove();
        }
        clearInterval(autoIntervalRef);
        $(touchPad).remove();
        
        if(pageIndicator !== null){
            $(pageIndicator).remove();
        }
        
        return null;
    }
    /* ******** MOVETOINDEX ***************** *
     * Move to specified index, left and right, 
     * or anywhere for that matter .
     * The first step is to figure out the direction/delta, based upon the given index vs. current page. 
     * ************************************* */
    this.moveToIndex = function(nextPageNum){
    	console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log(">> TouchCarousel.moveToIndex(" + nextPageNum + ")");
        console.log('>> currentPage = ' + currentPage);
        console.log('>> totalPages = ' + totalPages);
        
        /*console.log(">> PAGE DETAILS <<");
        var counter = totalPages;
        while(counter >= 0){
        	
        	var current = $(arrPages)[counter];
        	console.log("Page " + counter + ":");
        	console.log("Left Pos: " + $(current).position().left);
        	console.log("Index in parent: " + $(arrPages).index($(current)));
        	console.log("Index relative to position: " + ($(current).position().left / pageWidth));
        	counter--;
        }*/
        
        var targetSrcDist;
        
        //prevent button mashing
        if(bIsAnimating){
            console.log(">> TouchCarousel.moveToIndex() already animating.")
            return;
        } else{
            bIsAnimating = true;
        }
        
        if(nextPageNum < currentPage){
        	//Dragged Right
			console.log('>> RIGHT: nextPageNum < currentPage'); 	
			
			targetSrcDist = parseInt(currentPage - nextPageNum);	// The difference between the current page and the target page
			console.log(">> targetSrcDist = " + targetSrcDist);
			
			// Move the movers first to make scrolling appear smooth
			$($(arrPages).get().reverse()).each(function(){
					var indexRelativeToPosition = ($(this).position().left / pageWidth);
					console.log('>> indexRelativeToPosition = ' + indexRelativeToPosition);	
					if(indexRelativeToPosition > 0){
						console.log('>> moving $(this)');
						console.log($(this).text());
						console.log("to css left = " + (totalPages - indexRelativeToPosition + 1) * -pageWidth);
						$(this).css('left', (totalPages - indexRelativeToPosition + 1) * -pageWidth);
					}
					else {
						console.log(">> keeping $(this) at ");
						console.log($(this).position().left);
					}
			});
			
			if((currentPage - targetSrcDist) < 0){  
				console.log("(currentPage + targetSrcDist) < 0 == true");
				currentPage = (totalPages + 1) - targetSrcDist;    	//Offset dependency on length    
			}
			else {
				currentPage -= targetSrcDist;               
			}
			
			console.log('>> new currentPage aka target page = ' + currentPage); 
			
			$(arrPages).animate(
			{
				"left": "+=" + pageWidth * targetSrcDist + "px"
				},
				animationDuration,
				function(){
					bIsAnimating = false;
				}
			);
        }
        
        else if(nextPageNum > currentPage){
            //Dragged Left
            console.log('>> LEFT: nextPageNum > currentPage');		
            
            targetSrcDist = parseInt(nextPageNum - currentPage);	// The difference between the current page and the target page
			console.log(">> targetSrcDist = " + targetSrcDist);

            if((currentPage + targetSrcDist) > totalPages){  
                console.log("(currentPage + targetSrcDist) > totalPages == true");
                currentPage = (totalPages - currentPage) * -targetSrcDist;        
            }
            else {
                currentPage += targetSrcDist;               
            }
            
            console.log('>> new currentPage aka target page = ' + currentPage); 
            
            $(arrPages).animate(
            {
                "left": "-=" + pageWidth * targetSrcDist + "px"
                },
                animationDuration,
                function(){
                	//console.log(">> arrPages animation callback <<");
                	var indexRelativeToPosition = ($(this).position().left / pageWidth)
                	//console.log('>> indexRelativeToPosition = ' + indexRelativeToPosition);	
                	if(indexRelativeToPosition < 0){
                		//console.log('>> moving $(this)');
                		//console.log($(this));
                		//console.log("to css left = " + (1 + (totalPages + indexRelativeToPosition)) * pageWidth);
                		$(this).css('left', (1 + (totalPages + indexRelativeToPosition)) * pageWidth);
                	}
                    bIsAnimating = false;
                }
            );
        }
        else{
        	//TODO: investigate 'already animating bug' - happens after u hit this else statement
        	/*
        	carousel_container.moveToIndex(8)
			>> TouchCarousel.moveToIndex(8) TouchCarousel.js:194
			>> currentPage = 2 TouchCarousel.js:195
			>> -pageWidth = -400 TouchCarousel.js:196
			>> totalPages = 5 TouchCarousel.js:197
			>> modulo nextPageNum%totalPages = 3 TouchCarousel.js:202
			>> TouchCarousel.moveToIndex() already animating.
        	*/
            //You're tyring to go to the current page stupid. Durp.
            console.log(">> You're already on that index :/");
        }
        
        console.log('>> currentPage = ' + currentPage);
        $(elem).trigger(jQuery.Event("TouchCarousel.PageChange", { currentPage: currentPage }));
        
        // Carousel general update
        update();
        
    }
    
    
        
    /* ***** TOUCHPAD CONFIG **** *
     * 	If user didn't specify 	  *
     *	to have it disabled       *
     * ****************************** */
    if(!opt.touchDisabled){
        var touchPad, touchpadLeft, touchpadWidth;
        touchPad = $('<div id="touch-carousel-touchpad"></div');
        
        // Draggable triggered by click event

        
        $(touchPad).css({
            'z-index': 9997,	// Buttons need to be above the 9998 z-index
            'background-color': 'rgba(1,0,0, ' + opt.touchPadVisibility || 0 +  ')',
            position: 'inherit',
            width: containerWidth + 'px',
            height: containerHeight + 'px'
        });
        
        $(touchPad).draggable({
        	//revert: true,
            delay: 100,
            scroll: true,
            axis: 'x',
            start: function() {
                // touchpad dimensions
                touchpadLeft = $(this).position().left;
                touchpadWidth = $(this).width();
                
                //clear autoscroll interval
                clearInterval(autoIntervalRef);
            },
            drag: function(event, ui) {

            },
            stop: function() {
                var touchpadDeltaLeft =  $(this).position().left;

                //console.log('touchpadDeltaLeft = ' + touchpadDeltaLeft);
                //console.log('touchpadLeft = ' + touchpadLeft);
                //console.log('touchpadWidth = ' + touchpadWidth);

                if (touchpadDeltaLeft > (containerWidth / 4)) {
                    console.log('If dragged to the right further than halfway...');
                    _this.moveToIndex(currentPage - 1);
                }
                else if (touchpadDeltaLeft < (containerWidth * -0.25)) {
                    console.log('If dragged to the left further than halfway...');
                    _this.moveToIndex(currentPage + 1);
                }

                // bounce back to start position
                $(this).css('left', 0);
            }
        })
        .prependTo(elem);	// Add the touchpad to the container
    }//End If touchDisabled
    else {
        // Touch has been disabled - add clickable buttons to right and left
        /* ***** BUTTONS CONFIG ***** */
        btns = {
            // By default, put invisible clickable areas on the very right and very left of the container
            left: opt.leftButton || $('<div id="touch-carousel-btn-left" class="touch-carousel-btn" style="z-index: 9999; background-color: rgba(1,1,1,.1); position: inherit; top:0; left: 0; height: inherit; width:' + 0.1 * pageWidth + 'px;">&nbsp;</div>'),
            right: opt.rightButton || $('<div id="touch-carousel-btn-right" class="touch-carousel-btn" style="z-index: 9999; background-color: rgba(1,1,1,.1); position: inherit; top:0; right: 0; height: inherit; width:' + 0.1 * pageWidth + 'px;">&nbsp;</div>')
        };
        
        $(btns.left).prependTo(elem);
        $(btns.right).prependTo(elem);
        
        $(btns.right).on('click', function(){
            _this.moveToIndex(currentPage - 1);    
        });
        $(btns.left).on('click', function(){
            _this.moveToIndex(currentPage + 1);
        });
    }
    /* END TOUCHPAD CONFIG */

    /* ****** AUTOPAGE MECHANISM ******* */
    if(opt.auto){
        autoIntervalRef = setInterval(function(){
            if(opt.autoDirection == 'left'){
                _this.moveToIndex(currentPage - 1);
            }
            else if(opt.autoDirection == 'right'){
                _this.moveToIndex(currentPage + 1);
            }
        }, opt.autoDuration || 4000);	// Default 4000
    }
};
