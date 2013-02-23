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
	click to scroll. These can be styled by their respective class names or IDs, ie:

				id="touch-carousel-btn-left" class="touch-carousel-btn"

	Touch carousel has dependencies on jQueryUI, jQuery, and TouchSwipe. These awesome
	libraries can be found at the following locations:

				https://github.com/jquery/jquery
				https://github.com/jquery/jquery-ui
				http://labs.skinkers.com/content/touchSwipe/

	Feel free to fork it, use it, make it a million times better, whatever you like, but I would definitely
	like it best if you report issues on GitHub so I can work them out. If you solve an issue, I'd love to
	know how you do it! Thanks much,
	- Keith (@netpoetica)
*/

/*  *
 *  
 *  TODO: - investigate using .last()
 *  
 *  */

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
    opt.pagerImageNormal = '/imgname.jpg'
    opt.pagerImageActive = '/imageactivename.jpg'
    opt.touchPadClass = 'className'
    opt.touchPadVisibility = 0.0 to 1.0
    ****************************************************** */

    // TODO: TouchCarousel.setContent() instead of new to save memory and use the same one over and over. 
    var _this = this,
    autoIntervalRef = null,
    pageIndicator = null,
    containerWidth = opt.width || $(elem).outerWidth(),
    containerHeight = opt.height || $(elem).outerHeight(),
    currentPage = 0,
    arrPages = $(elem).find('.' + opt.pageClass),
    pageWidthNum,      // Used interneally for page widths after init
    pageWidth = opt.width || $(arrPages[0]).outerWidth(),
    //pageHeight = opt.height || $(arrPages[0]).outerHeight(),
    totalPages = arrPages.length - 1,
    bIsAnimating = false,
    animationDuration = opt.animationDuration || 500,
    btns = {},
    direction = opt.autoDirection || 'right';				// 'right' || 'left'
    
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
        overflow: 'hidden',
        height: containerHeight,
        width: containerWidth
    });

    // Initialize the page indicator
    if(!opt.pageIndicatorDisabled ){
        pageIndicator = $('<ul class="touch-carousel-pager" style="z-index: 9997; position: absolute;"></ul>');
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
            position: 'absolute',
            top: 0,
            display: 'inline-block',
            height: '100%',
            width: '100%'
        });

        // Add a page indicator for this page
        if(!opt.pageIndicatorDisabled ){
            $(pageIndicator).append('<li class="touch-carousel-pager-item" id ="item-' + posCounter + '" style="display: inline;"><img src="' + String(posCounter == currentPage ? opt.pagerImageActive : opt.pagerImageNormal) + '" /></li>');
        }
        posCounter++;
        
    });
    //$(elem).height($(arrPages).first().outerHeight());
    if(!opt.pageIndicatorDisabled ){      
        $(elem).append(pageIndicator);      // Add the populated inidicator
    }

    reorient(direction);
	
    /* ******* REORIENT ************* *
     * Make sure blocks are in right position to move in specified direction.
     * reorient relative to current page and direction.
     * **************************** */
    function reorient(dir){
        //console.log("!!!!!!!!!!!!!!!!!!!!!!!");
        //console.log(">> REORIENTING: " + dir);
        
        //
        pageWidthNum = $(arrPages[0]).outerWidth();
        //console.log(">> TouchCarousel.pageWidthNum = " + pageWidthNum);
    
    	bIsAnimating = true;
        var counter = 0;
    	
        // Rearrange the working array to use currentPage
        var pages = $(arrPages).get();
        var temp = pages.splice(currentPage);
        pages = temp.concat(pages);
    	
        if(dir === 'left'){
            $(pages).each(function(){
                $(this).css({
                    left: counter * pageWidthNum
                });
                counter++;
            });
			
            direction = 'left';
        }
        else if(dir === 'right'){
            // Set counter first to make space for the 0 element
            $($(pages).get().reverse()).each(function(){
                counter++;
                $(this).css({
                    left: counter * -pageWidthNum
                });
            });
			
            // Put the 0 element in the first place :)
            $(pages[0]).css('left', 0);
			
            direction = 'right';
        }
        bIsAnimating = false;
    }
    /* ******* LISTEN FOR WINDOW ORIENTATION EVENT, REORIENT ******** */
    $(window).on('orientationchange, resize', function(){
        reorient(direction || 'left');
    }); 
    
    
    /* ******* UPDATE ************* *
     * General update function used 
     * to redraw pager and what-not 
     * **************************** */
    function update(){  
        //console.log("TouchCarousel.update()...");
        // Update the page images depending on current page
        var e = jQuery.Event("TouchCarousel.Update", { 
            currentPage: currentPage,
            direction: direction
        });
        
        $(elem).trigger(e);
        var imgCounter = 0;
        
        if(!opt.pageIndicatorDisabled){
            $('.touch-carousel-pager-item').find('img').each(function(){   
                $(this).attr('src', String(imgCounter == currentPage ? opt.pagerImageActive : opt.pagerImageNormal));
                imgCounter++;
            });
        }

    }
    
    function autoStart(){
        return setInterval(function(){
            if(direction == 'left'){
                _this.moveToIndex(currentPage + 1);
            }
            else if(direction == 'right'){
                _this.moveToIndex(currentPage - 1);
            }
        }, opt.autoDuration || 6600)
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
    
    this.pause = function(){
        if(opt.auto){
            if(autoIntervalRef){
                clearInterval(autoIntervalRef);
                autoIntervalRef = null;
            }
            else {
                autoIntervalRef = autoStart();
            }
        }      
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
        
        $(elem).unbind('TouchCarousel.Update');
        
        return null;
    }
    
    /* ******** MOVETOINDEX ***************** *
     * Move to specified index, left and right, 
     * or anywhere for that matter .
     * The first step is to figure out the direction/delta, based upon the given index vs. current page. 
     * ************************************* */
    this.moveToIndex = function(nextPageNum){
        //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        //console.log(">> TouchCarousel.moveToIndex(" + nextPageNum + ")");
        //console.log(">> direction = " + direction);
        //prevent button mashing
        if(bIsAnimating){
            //console.log(">> TouchCarousel.moveToIndex() already animating.")
            return;
        } else{
            bIsAnimating = true;
        }
        var targetSrcDist;
        //
        pageWidthNum = $(arrPages[0]).outerWidth();
        //console.log(">> TouchCarousel.pageWidthNum = " + pageWidthNum);
        
        // We're gonna go right
        if(nextPageNum < currentPage){
            //console.log('>> MOVE RIGHT: nextPageNum('+nextPageNum+') < currentPage('+ currentPage + '), current direction = ' + direction); 
	
            if(direction !== 'right'){
                reorient('right');
            }
			
            targetSrcDist = parseInt(currentPage - nextPageNum);	// The difference between the current page and the target page
            //console.log(">> targetSrcDist = " + targetSrcDist);
            if((currentPage - targetSrcDist) < 0){  
                // Catch someone trying to go too far and put them back to the front
                //console.info("!! GOTCHA !!");
                //console.log("(currentPage - targetSrcDist) < 0");
                currentPage = (totalPages + 1) - targetSrcDist;    	//Offset dependency on length
                
                //bIsAnimating = false;
                //this.moveToIndex(totalPages);   // Catch it and go the other direction recursively?
                
            }
            else {
                currentPage -= targetSrcDist;               
            }
			
            //console.log('>> new currentPage aka target page = ' + currentPage); 
			
            
            
            $(arrPages).animate(
            {
                "left": "+=" + pageWidthNum * targetSrcDist + "px"
            },
            animationDuration,
            function(){
                //console.log("--------------------");
                //console.log(">> arrPages RIGHT animation callback <<");
                // Leaving out Math.round() causes some wonky bugs depending on the decimals. Usually 
                // causes two pages to be treated with the same Index and rendered at the same left pos.
                var indexRelativeToPosition = Math.round($(this).position().left / pageWidthNum);
                //console.log('>> indexRelativeToPosition = ' + indexRelativeToPosition);
                if(indexRelativeToPosition > 0){
                    //console.log('>> moving $(this)');
                    //console.log($(this));
                    //console.log("to css left = " + ((totalPages - 1) + indexRelativeToPosition) * -pageWidthNum);
                    $(this).css('left', ((totalPages - 1) + indexRelativeToPosition) * -pageWidthNum);
                }
                bIsAnimating = false;
                //$(elem).trigger('TouchCarousel.animationComplete', false);
            });
        }
        
        //We're gonna go Left!
        else if(nextPageNum > currentPage){
            //console.log('>> MOVE LEFT: nextPageNum('+nextPageNum+') > currentPage('+ currentPage + '), current direction = ' + direction); 
            
            if(direction !== 'left'){
                reorient('left');
            }
            
            targetSrcDist = parseInt(nextPageNum - currentPage);	// The difference between the current page and the target page
            //console.log(">> targetSrcDist = " + targetSrcDist);

            if((currentPage + targetSrcDist) > totalPages){  
                //console.log("(currentPage + targetSrcDist) > totalPages == true");
                currentPage = (totalPages - currentPage) * -targetSrcDist;        
            }
            else {
                currentPage += targetSrcDist;               
            }
            //console.log('>> new currentPage aka target page = ' + currentPage); 
            
            $(arrPages).animate(
            {
                "left": "-=" + pageWidthNum * targetSrcDist + "px"
            },
            animationDuration,
            function(){
                /*console.log("--------------------");
                	console.log(">> arrPages LEFT animation callback <<");
                	console.log('>> page ' + $(this).text() +' animation callback');
                	console.log('>> left =  ' + $(this).position().left);*/
                var indexRelativeToPosition = Math.round($(this).position().left / pageWidthNum)
                //console.log('>> indexRelativeToPosition = ' + indexRelativeToPosition);	
                if(indexRelativeToPosition < 0){
                    //console.log('>> moving $(this)');
                    //console.log($(this));
                    //console.log("to css left = " + (1 + (totalPages + indexRelativeToPosition)) * pageWidthNum);
                    $(this).css('left', (1 + (totalPages + indexRelativeToPosition)) * pageWidthNum);
                }
                bIsAnimating = false;
            }
            ); 		
        }
        else{
            //You're tyring to go to the current page stupid. Durp.
            //console.log(">> You're already on that index :/");
            bIsAnimating = false;
        }
        
        //$(elem).trigger(jQuery.Event("TouchCarousel.PageChange", { currentPage: currentPage }));

        // Carousel general update
        update();
        
    }
    
    
        
    /* ***** TOUCHPAD CONFIG **** *
     * 	If user didn't specify 	  *
     *	to have it disabled       *
     * ****************************** */
    if(!opt.touchDisabled){
        var touchPad = $('<div class="touch-carousel-touchpad"></div');

        $(touchPad).css({
            'z-index': 9997,	// Buttons need to be above the 9998 z-index
            'background-color': 'rgba(1,0,0, ' + opt.touchPadVisibility || 0 +  ')',
            position: 'absolute',
            width: typeof containerWidth === 'number' ? containerWidth + 'px' : containerWidth,
            height: typeof containerHeight === 'number' ? containerHeight + 'px' : containerHeight      //$(arrPages).first().outerHeight()
        });
        
        $(touchPad).swipe({
            allowPageScroll: "auto",
            swipeLeft:function(event, direction, distance, duration, fingerCount) {
            	 _this.moveToIndex(currentPage + 1);  
            	 clearInterval(autoIntervalRef);
            },
            swipeRight:function(event, direction, distance, duration, fingerCount) {
            	 _this.moveToIndex(currentPage - 1);
            	 clearInterval(autoIntervalRef);
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
        autoIntervalRef = autoStart();
    }
};