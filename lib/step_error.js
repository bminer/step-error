var events = require("events"); // http://nodejs.org/api/events.html
var step = require("step"); // https://github.com/creationix/step
module.exports = function StepError() {
	var funcs = [], //the functions to be executed
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
		//If the function's name is "_finally", add it as the event handler for "done"
		else if(arguments[i].name == "_finally")
			emitter.once("done", arguments[i]);
		//Otherwise, push it on funcs along with an error handling function
		else
		{
			(function(func, lastFunc) {
				//Create a closure for `i`
				funcs.push(function stepFuncWrapper() {
					//Ensure that the `func` is only called if `!errorRaised`
					if(!errorRaised)
						func.apply(this, arguments);
				}, function stepErrorHandler(err) {
					var args;
					/* Note: This relies on the first argument of each callback to
						be the Error Object, which is a Node.js convention. */
					if(err)
					{
						args = arguments;
						//Emit "error" events
						if(events.EventEmitter.listenerCount(emitter, "error") > 0)
							emitter.emit("error", err);
						else if(events.EventEmitter.listenerCount(emitter, "done") == 0)
							process.nextTick(function() {
								//Throw uncaught exception
								throw err;
							});
						if(!errorRaised)
							emitDone.apply(null, args);
						errorRaised = true;
					}
					//Only continue if no errors have been raised
					else if(!errorRaised)
					{
						if(lastFunc)
							//If this is the last function, just pass along all args to `emitDone`
							args = arguments;
						else if(arguments.length > 0)
						{
							//If arguments.length > 0, we assume the first argument is the Error
							args = new Array(arguments.length - 1);
							for(var j = 0; j < args.length; j++)
								args[j] = arguments[j + 1];
						}
						else
							//Otherwise, we just assume there was no error
							args = [];
						//Call the next callback, without passing the error
						this.apply(this, args);
					}
				});
			})(arguments[i], i == arguments.length - 1);
		}
	}
	//Add function to the end to emit "done" event
	function emitDone(err) {
		if(events.EventEmitter.listenerCount(emitter, "done") > 0) {
			var args = new Array(arguments.length + 1);
			args[0] = "done";
			for(var i = 0; i < arguments.length; i++)
				args[i + 1] = arguments[i];
			emitter.emit.apply(emitter, args);
		}
	}
	funcs.push(emitDone);
	//Call step
	process.nextTick(function() {
		step.apply(null, funcs);
	});
	return emitter;
};