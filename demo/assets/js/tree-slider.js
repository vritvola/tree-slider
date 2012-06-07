$(document).ready(function(){

	// settings
	var animationSpeed = 500;
	var contentWrapper = ".treeslider";
	var contentDiv = ".treecontent";
	var easing = "easeInOutQuart";

	var previousUrl = "";
			

	
	/**
	 * Use to slide element into or out of view
	 * param element the element name as a string
	 * param amount to move as a string, append units: "300px"
	 * param remove boolean remove the element after animation
	 */
	function slide(element, amount, remove){
		$(element).animate({
			left: amount,
		}, animationSpeed, easing, function(){
			if(remove) $(this).remove();
		});
	}
	
	/**
	 * Prepares the returned data and inserts into the DOM, inside contentWrapper
	 * param data
	 * param offset the offset of the starting position
	 */
	function prepareNewElement(data, offset) {
		// extract necessary content
		data = $(data).find(contentDiv);
		
		// insert new content
		$(contentWrapper).append(data);
		
		// set width to parent width
		data.css('width', $(contentWrapper).css('width'));
		
		// set starting position
		data.css('left', offset);
	}

	/**
	 * Helper function to provide new content and call the sliding function
	 * param direction the direction to move the new content as a String ("left/right")
	 * param data
	 */
	function moveContent(direction, data){
		// width is used here to determine the amount of movement needed
		var width = $(contentWrapper).css('width');

		if(direction == "left"){
			// move out and remove the old element
			slide(contentDiv, "-"+width, true);
			// set new element in place
			prepareNewElement(data, width);
			// animate into view
			slide(contentDiv, "0", false);
		}else{
			slide(contentDiv, width, true);
			prepareNewElement(data, "-"+width);
			slide(contentDiv, "0", false);
		}
	}



	
	// intercept click-event and move to next content
	$(contentWrapper).delegate("a", "click", function(event){
		event.preventDefault();
				
		// catch back-link
		if($(this).hasClass('back')){
			history.back();
			return false;
		}

		// default direction to move content
		var direction = "left";
		if($(this).parents('ul').hasClass('breadcrumb')){
			// breadcrumb links always travel back
			direction = "right";
		}

		var url = this.href;
		// pushes the new url into the History
		history.pushState({ path: url }, "", url);
		
		// make a record of this as the most recent url
		previousUrl = url;

		// get new content and move everything left
		$.get(url, function(data){
			moveContent(direction, data);
		});
		
		// prevent default click behavior
		return false;
	});

	// intercept "popstate" and move to previous content
	$(window).bind("popstate", function(event) {
		var state = event.originalEvent.state;

		if(state) {
			var direction = "left";
			// check the index of the url in the stack, this determines the direction to move the content
			if(previousUrl.toString().length > state.path.toString().length)
				direction = "right";
			previousUrl = state.path;
		
			$.get(state.path, function(data) {
				moveContent(direction, data);
			});
		}
	});

});