class ApiError {
	constructor(
		httpStatusCode = 500,
		message = "Internal Server Error",
		isOperational = true
	) {
		this.httpStatusCode = httpStatusCode;
		this.message = message;
		this.isOperational = isOperational || this.httpStatusCode === 500;
	}
}

module.exports = ApiError;