const ApiError = require("../error/apiError")
const jwt = require("../service/tokens-service")

module.exports = async function (req, res, next) {
	if (req.method === "OPTIONS") {
		next()
	}

	try {
		const authorization = req.headers.authorization
		if( !authorization ) {
			return next(ApiError.unauthorizedError() )
		}
		
		const access_token = authorization.split(" ")[1]
		if (!access_token) {
			return next(ApiError.unauthorizedError() )
		}
		
		const user = await jwt.checkAccessToken(access_token)
		if (!user) {
			return next(ApiError.unauthorizedError())
		}

		req.userAccessToken = access_token;
		next()
	}
	catch (e) {
		return next(ApiError.unauthorizedError())
	}

}