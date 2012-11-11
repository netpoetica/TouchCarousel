$(document).ready(function(){

    // Build a carousel and store a reference to it for manipulation by manual control.
    var carousel_container = new TouchCarousel('#wrapper .carousel_container', {
        pageClass: 'page',
        auto: true,
        autoDirection: 'right',
        height: 200,
        width: 400,
        pageIndicatorDisabled: true
    });

    // Build a dynamic menu :-)
    $('.page').each(function(){
       $('<li />')
       .text($(this).index() - 1)   // Offset index returning 1 - total instead of 0 to total...
       .appendTo('#nav'); 
    }); 

    //  Manual controller click handler
    $('#nav').on('click', 'li', function(){
        var target = parseInt($(this).text());      
        console.log("Pushing carousel to index " + target)
        carousel_container.moveToIndex(target);
    });

    //TouchCarousel.Update event listener
    $('#wrapper').on('TouchCarousel.Update',function(e){
        console.log("Current Page: " + e.currentPage);
        console.log("Current Direction: " + e.direction);
    })

});