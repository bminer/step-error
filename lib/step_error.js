var events = require("events");
module.exports = function StepError(step) {
	if(step == null)
		step = require("step"); //Backwards compatibility
	var funcs = [], //the functions to be executed
		finale, //the last function to be executed
		emitter = new events.EventEmitter(),
		errorRaised = false;
	for(var i = 0; i < arguments.length; i++)
	{
		//If the function's name is "_catch", add it as the event handler for errors
		if(arguments[i].name == "_catch")
			emitter.once("error", arguments[i]);
		//Also support catching more than one error
		else if(arguments[i].name == "_catchAll")
			emitter.on("error", arguments[i]);
		//If the function's name is "_finally", set it to be the finale
		else if(arguments[i].name == "_finally")
			finale = arguments[i];
		//Otherwise, push it on funcs along with an error handling function
		else
			funcs.push(arguments[i], function(err) {
				if(err)
				{
					//Call error handlers and the finale
					emitter.emit("error", err);
					errorRaised = true;
					//Allow the _finally function to call this() by providing a nop.
					if(finale)
						finale.apply(function nop() {}, arguments);
				}
				//Only continue if no errors have been raised
				else if(!errorRaised)
				{
					var args = [];
					for(var j = 1; j < arguments.length; j++)
						args.push(arguments[j]);
					//Call the next callback, without passing the error
					this.apply(this, args);
				}
			});
	}
	//Add _finally function, if provided
	if(finale)
		funcs.push(finale);
	//Call step
	step.apply(this, funcs);
};
