var events = require("events"),
	step = require("step");
module.exports = function StepError() {
	var funcs = [], //the functions to be executed
		finale, //the last function to be executed
		emitter = new events.EventEmitter();
	for(var i = 0; i < arguments.length; i++)
		//If the function's name is "error", add it as the event handler for errors
		if(arguments[i].name == "error")
			emitter.on("error", arguments[i]);
		//If the function's name is "finally", set it to be the finale
		else if(arguments[i].name == "finally")
			finale = arguments[i];
		else
		//Otherwise, push it on funcs along with an error handling function
			funcs.push(arguments[i], function(err) {
				if(err)
				{
					//Call error handlers and the finale
					emitter.emit("error", err);
					finale && finale.apply(this, arguments);
				}
				else
				{
					var args = [];
					for(var j = 1; j < arguments.length; j++)
						args.push(arguments[j]);
					//Call the next callback, without passing the error
					this.apply(this, args);
				}
			});
		if(finale)
			funcs.push(finale);
	step.apply(this, funcs);
};
