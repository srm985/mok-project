/*function keyboard() {
    $.init = function(options) {
        console.log(options);
    }
    $.fn.attach = function() {

    }
}*/

$.fn.keyboard = function(options) {
	$(this).on('click touch', function() {
		console.log('clicked');
	});
}