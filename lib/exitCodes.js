module.exports = [
	{
		code: 1,
		name: "Uncaught Fatal Exception",
		message: "There was an uncaught exception, and it was not handled by a domain or an `uncaughtException` event handler"
	},
	{
		code: 3,
		name: "Internal JavaScript Parse Error",
		message:
			"The JavaScript source code internal Node's bootstrapping process caused a parse error. This is extremely rare, and generaly can only happend during development of Node itself"
	},
	{
		code: 4,
		name: "Internal JavaScript Evaluation Error",
		message:
			"The JavaScript source code interal in Node's bootstrapping process failed to return a function value when evaluated. This is extremely rare, and generally can only happen during the development of Node itself"
	},
	{
		code: 5,
		name: "Fatal Error",
		message: "There was a fatal unrecoverable error in V8. Typically a message will be printed to stderr with the prefix `FATAL ERROR`"
	},
	{
		code: 6,
		name: "Non-function Internal Exception Handler",
		message:
			"There was an uncaught exception, but the internal fatal exception handler function was somehow set to a non-function, and could not be called"
	},
	{
		code: 7,
		name: "Internal Exception Handler Run-Time Failure",
		message:
			'There was an uncaught exception, and the internal fatal exception handler function itself threw an error while attempting to handle it. This can happen, for example, if a `process.on("uncaughtException")` or `domain.name("error")` handler throws an error'
	}
]
