const hashPasswords = require("./password-service")
const jwt = require("./tokens-service")
const usersQuery = require("../db/query/usersQuery")
const mailService = require("./mail-service")
const ApiError = require("../error/apiError")
const fs = require("fs")
const path = require("path")

class UserService {

	async createUser({ dataName, dataRoles, dataCourses } ) {
		let user
		const { email } = dataName
		const candidat = await usersQuery.getItem("users", "email", email, "findOne" )

		if (candidat) { 
			throw ApiError.badRequest(`Пользователь с email: ${ candidat.email } уже зарегистрирован`)
		}

		try {	
			user = await usersQuery.createRow('users', dataName ) 			
		}
		catch (e) {			
			throw ApiError.internal("Что то пошло не так при создании пользователя. Давайте попробуем позже")
		}

		try {	
			const courses = dataCourses.map(it => { 
				return {
					userId: user.id,
					courseId: +it
				}
			})
			
			await usersQuery.createRow("users_courses", courses)
			await usersQuery.createRow("roles", { userId: user.id, ...dataRoles })
			await mailService.createMail(email, user.id)				
						
			const userPath = path.resolve( __dirname, "../src/users/", `user-${user.id}`)
			const isExist = fs.existsSync( userPath )
			
			if (!isExist) {
				fs.mkdirSync( userPath )
			}
		}
		catch (e) {
			const user = await usersQuery.getItem("users", "email", email)
			
			if (user) {
				await usersQuery.delete("users", "email", email )
			}
			throw ApiError.internal("Что то пошло не так при создании ролей для пользователя или отправкой ссылки для регистрации. Давайте попробуем позже")
		}

		return user		
	}

	async updateUser({ dataName, dataRoles, dataCourses }) {
		
		const { id } = dataName
		const user = await usersQuery.getItem("users", "id", id )

		try {

			const courses = dataCourses.map(it => { 				
				return {
					userId: user.id,
					courseId: +it
				}
			})

			await usersQuery.updateRow("users", "id", id, dataName)
			let updataeUser = await usersQuery.getItem("users", "id", id )
			 
			await usersQuery.delete("users_courses", "userId", id)
			await usersQuery.createRow("users_courses", courses)

			await usersQuery.delete( "roles", "userId", id )
			await usersQuery.createRow( 'roles', { userId: user.id, ...dataRoles } )

			return { user: updataeUser }
		}
		catch (e) {
			throw ApiError.internal("Что то пошло не так при обовлении")
		}
			
	}

	async removeUser({ userId }) {
		try { 
			
			const res = await usersQuery.delete("users", "id", userId)
			
			const userPath = path.resolve( __dirname, "../src/users/", `user-${ userId }`)
			const isExist = fs.existsSync(userPath);
			if (isExist) {
				fs.rmdirSync( userPath, { recursive: true } )
			}
			
			return `remove user ${ userId }`
		}
		catch (e) {
			return e.message
		}

	}

	async activateUser(activatedLink) {
		try {
			const link = await usersQuery.getItem("active-users", "activatedLink", activatedLink)

			link.isActive = true;
			await link.save();
	
			const user  = await usersQuery.getItem("users", "id", link.userId)
	
			return user
		}
		catch (e) {
			throw ApiError.internal("Что то пошло не так во время активации акаунта, скорее всего ссылка для актвивации акуанта устарела, или является не дейсвительной")
		}
	}

	async createPassword({ email, password }) {
		const	user = await usersQuery.getItem('users', 'email', email);
		if (!user) {
			throw ApiError.badRequest("Вы не по адресу, Вас нет в списке приглашённых")
		}

		
		try {
			const check = await usersQuery.getItem("passwords", "userId", user.id)
			
			if (check) {
				await hashPasswords.updateHash(user.id, password)
			}
			else {
				await hashPasswords.createHash(user.id, password)
			}

			const roles = await usersQuery.getItem("roles", "userId", user.id);			
			const token = await usersQuery.getItem("tokens", "userId", user.id)
			
			let tokens;
			if (token) {
				tokens = await jwt.updateToken({id: user.id, roles, email} )
			}
			else {
				tokens = await jwt.createToken({ id: user.id, roles, email })
			}	
			
			return tokens
		}
		catch (e) {

			throw ApiError.internal("не предвиденные не поладки при создании пароля")
		}
	}

	async loginUser({ email, password }) {

		const user = await usersQuery.getItem("users", "email", email, "findOne" )
			
			if (!user) {
				throw ApiError.badRequest(`пользователя с email ${email} не существует`)
			} 

		await hashPasswords.compareHash(user.id, password )

		const roles = await usersQuery.getItem('roles', 'userId', user.id)
		const tokens = await jwt.updateToken({ email, id: user.id, roles })

		return tokens
	}

	async logoutUser(refreshToken) {

		const token = await jwt.removeToken(refreshToken)
		return token
	}

	async refresUser(refreshToken) {
		if (!refreshToken) {
			throw ApiError.unauthorizedError();
		}

		const userData = await jwt.checkRefreshToken(refreshToken)
		const token_db = jwt.findToken(refreshToken)
		if (!userData || !token_db) {
			throw ApiError.unauthorizedError();
		}
		
		const tokens = await jwt.updateToken({ email: userData.email, id: userData.id, roles: userData.roles})

		return tokens		
	}

	async verifyUserToken(token) {
		const data = await jwt.decodeToken( token )
		return data
	}

	async homePage(token) {
		
		try {
			const tokenData = await this.verifyUserToken( token )
			const user = await usersQuery.getItem("users", "email", tokenData.email, "findOne" )
			const userRoles = await usersQuery.getItem("roles", "userId", tokenData.id)
			const userCourses = await usersQuery.getAll( "users_courses", "userId", tokenData.id )
						
			return {
				user,
				userRoles,
				userCourses
			}
		}
		catch (e) {
			throw ApiError.internal("не получилось взять данные для пользователя")
		}
		
	}



	async getAllUsers() {
		try {
			const users = await usersQuery.getAll('users')
			return users
		}
		catch (e) {
			throw ApiError.internal("Что то пошло не так")
		}
	}

	async getUserData(id) {
		try {
			const userRoles = await usersQuery.getItem("roles", "userId", id)
			const userCourses = await usersQuery.getAll( "users_courses", "userId", id )
			
			return {
				userRoles,
				userCourses
			}
		}
		catch (e) {
			throw ApiError.internal("Что то не то с нашим пользователем")
		}
	}

}


module.exports = new UserService()