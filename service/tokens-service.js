const jwt = require('jsonwebtoken')
const usersQuery = require("../db/query/usersQuery")
const ApiError = require('../error/apiError')

class Jwt {

	async createToken( payload ) {
		try {
			
			const access_token = jwt.sign(
				payload, 
				process.env.TOKEN_KEY_ACCESS,
				// { expiresIn: "20m" },
				{ expiresIn: "10m" }
			)
							
			const refresh_token = jwt.sign(
				payload, 
				process.env.TOKEN_KEY_REFRESH, 
				// { expiresIn: "30d" }
				{ expiresIn: "16h" }
			)

				await usersQuery.createRow("tokens", {
					userId: payload.id,
					access_token: access_token,
					refresh_token: refresh_token
				})
							
			return {
				access_token,
				refresh_token,
			}
		}
		catch (e) {
			throw ApiError.internal("не поладки при создании токенов")
		}
	}

	async updateToken(payload) {
		
		try {
			
			const access_token = jwt.sign(
				payload, 
				process.env.TOKEN_KEY_ACCESS, 
				// { expiresIn: "20m" }
				{ expiresIn: "10m" }

			)
				
			const refresh_token = jwt.sign(
				payload, 
				process.env.TOKEN_KEY_REFRESH, 
				// { expiresIn: "30d" }
				{ expiresIn: "16h" }

			)
					
				await usersQuery.updateRow("tokens", "userId", payload.id, {
					userId: payload.id,
					access_token: access_token,
					refresh_token: refresh_token
				})
								
			return {
				access_token,
				refresh_token,
			}
		}
		catch (e) {
			throw ApiError.internal("не поладки при обновлении токенов")
		}
	}

	async checkAccessToken(access_token) {
		try{
			const data = jwt.verify(access_token, process.env.TOKEN_KEY_ACCESS)
			return data
		}
		catch(e) {
			return null
		}
	}

	async checkRefreshToken( refresh_token) {
		try{

			const data = jwt.verify(refresh_token, process.env.TOKEN_KEY_REFRESH)	
			return data
		}
		catch(e) {
			return null
		}
	}

	async findToken(refreshToken) {
		const tokenData = await usersQuery.getItem("tokens", "refresh_token", refreshToken)
		return tokenData
	} 

	async removeToken(token) {
		try {
			
			const tokenData = await usersQuery.delete("tokens", 'refresh_token', token )		
			return true
		}
		catch (e) {
			throw ApiError.internal("не поладки на сервере, попробуйте позже разлогиниться")
		}
	}

	async decodeToken(token) {
		try {	
			const user =  jwt.decode(token )
			return user
		}
		catch (e) {
			throw ApiError.internal(e.message)
		}
	}

}


module.exports = new Jwt()