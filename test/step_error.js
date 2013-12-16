var step = require("../");

//nodeunit tests
exports.callsCallbacks = function(test) {
	test.expect(6);
	var x = 1;
	step(
		function() {
			test.equal(x, 1);
			x = 2;
			this();
			test.equal(x, 4);
			test.done();
		},
		function() {
			test.equal(x, 2);
			x = 3;
			this();
			test.equal(x, 4);
		},
		function() {
			test.equal(x, 3);
			x = 4;
			this();
			test.equal(x, 4);
		}
	);
}

exports.catchesErrors = function(test) {
	test.expect(6);
	var x = 1;
	step(
		function() {
			test.equal(x, 1);
			x = 2;
			this();
			test.equal(x, "err");
		},
		function() {
			test.equal(x, 2);
			x = 3;
			throw new Error("This is an error.");
		},
		function() {
			test.equal(x, 3);
			x = 4;
			this();
			test.equal(x, 4);
		}
	).once("error", function(err) {
		test.equal(x, 3);
		x = "err";
		test.equal(err.toString(), "Error: This is an error.")
	}).once("done", function(err) {
		test.equal(x, "err");
		test.done();
	});
}