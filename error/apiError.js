class ApiError extends Error{

	constructor(status, message, errors = []) {
		super(message);
		this.status = status;
		this.message = message;
		this.errors = errors;
	}

	static unauthorizedError() {
		return new ApiError( 401, "Пользователь не авторизован")
	}

	static badRequest(message) {
		return new ApiError( 404, message)//, errors)
	}

	static internal(message) {
		return new ApiError( 500, message)
	}

	static forbidden(message) {
		return new ApiError( 403, message)
	}

	static badAuth(message) {
		return new ApiError(400, message)
	}
}

module.exports = ApiError