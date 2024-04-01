const bcrypt = require("bcrypt")
const appError = require("../error/apiError")
const usersQuery = require("../db/query/usersQuery")

class HashPassword {

	async createHash(id, pass) {
		// return await bcrypt.hash(pass, 3)
		try {
			
			const hashPassword = await bcrypt.hash(pass, 3)
			
			await usersQuery.createRow("password", {
				userId: id,
				password: hashPassword
			})
			
			return hashPassword
		}
		catch (e) {
			throw appError.internal("где то ошибка при создании пароля")
		}

	}

	async updateHash(id, pass) {
		try {
			const hashPassword = await bcrypt.hash(pass, 3)
			// console.log( "there..............")
			
			await usersQuery.updateRow("password", "userId", id, {
				userId: id,
				password: hashPassword
			})
			
			return hashPassword
		}
		catch (e) {
			throw appError.internal("где то ошибка при создании пароля")
		}

	}

	async compareHash(id, passFromUser ) {

		const hashPassword = await usersQuery.getItem("passwords", "userId", id, "findOne")
		const state =  bcrypt.compareSync(passFromUser, hashPassword.password)

		if (!state) {
			throw appError.badAuth("пароль не правильный.")
		}

		return state;
	}
}

module.exports = new HashPassword();