keyboard = function(args) {
	function test() {
		console.log(args);
	}
	//alert($(this).is('input[type="text"]'));
	$(this).on('click touch','input[type="text"]', function() {
		console.log('input');
	});
	test();

	this.sampleVar = args.a;

	init: function() {
		console.log('here');
	}
}