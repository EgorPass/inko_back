const userService = require("../service/userService")
const jwt = require("../service/tokens-service")
const ApiError = require("../error/apiError");
const usersQuery = require("../db/query/usersQuery");
const path = require("path")
const fs = require("fs")

class UserController {

	async registration(req, res, next) {
		const { dataName, dataRoles, dataCourses } = req.body;
		try {
			const user = await userService.createUser({ dataName, dataRoles, dataCourses });
			return res.json(user)
		}
		catch (e) {
			next(e)
		}
	}

	async updateUserData(req, res, next) {
		const {dataName, dataRoles, dataCourses } = req.body	
		const data = await userService.updateUser( {dataName, dataRoles, dataCourses})

		res.json( data.user )
	}

	async removeUser(req, res, next) {
		try {			
			const { userId } = req.body;
			const result = await userService.removeUser({userId})
			res.json({message: result,})
		}
		catch (e) {
			next( e )
		}
	}

	async activate(req, res, next) {
		try {			
			const link = req.params.link
			const user = await userService.activateUser(link)			
			return res.redirect( `${process.env.CLIENT_URL}/auth/setPass?email=${user.email}`)			
		}
		catch (e) {
			next(e)
		}
	}

	async setPassword(req, res, next) {
		const { email, password } = req.body
		try {
			const tokens = await userService.createPassword({ email, password })
		
			res.cookie(
				"refreshToken",
				tokens.refresh_token,
				{
					maxAge: 7 * 24 * 60 * 60 * 1000,
					httpOnly: true,
					domain: process.env.HOST,
					path: "/",
				}
			)
			return res.json({message: "set password for user", accessToken: tokens.access_token} )
		}
		catch (e) {
			next(e)
		}
	}

	async login(req, res, next) {
		
		const { email, password } = req.body
		try {
			const tokens = await userService.loginUser({ email, password })
		
			res.cookie(
				"refreshToken",
				tokens.refresh_token,
				{
					maxAge: 7 * 24 * 60 * 60 * 1000,
					httpOnly: true,
					domain: process.env.HOST,
					path: "/",
				}
			)
			return res.json({ message: 'it is login', accessToken: tokens.access_token })
		}
		catch (e) {
			next(e)
		}
		
	}
	
	async refresh(req, res, next) {
		try {
			const { refreshToken } = req.cookies;			
			const tokens = await userService.refresUser( refreshToken )

			res.cookie(
				"refreshToken",
				tokens.refresh_token,
				{
					maxAge: 7 * 24 * 60 * 60 * 1000,
					httpOnly: true,
					domain: process.env.HOST,
					path: "/",
				}
			)	
			return res.json({ message: 'it is login', accessToken: tokens.access_token})
		}
		catch (e) {
			next(e)
		}
	}

	async logout(req, res, next) {
		try {
			const { refreshToken } = req.cookies;
			const token = await userService.logoutUser(refreshToken)

			res.clearCookie(
				"refreshToken",
				{
					httpOnly: true,
					domain: process.env.HOST,
					path: "/",
				}
			)
			res.status(200).json({ message: "logout" }) //.json(token)
		}
		catch (e) {
			next(e)
		}
	}

	async getUserData(req, res, next) {
		try {
			const { id } = req.body;			
			const data = await userService.getUserData( +id )
			return res.json( data )
		}
		catch (e) {
			next( e )
		}
	}

	async getAllUsers(req, res, next) {

		try {
			const users = await userService.getAllUsers();	
			res.json(  users )
		}
		catch (e) {
			next(e)
		}

	}

	async getAuth(req, res, next) {
		const { userAccessToken } = req
		res.json( { message: "post userInkoData" } )
	}

	async homePage(req, res, next) {
		
		try {
			const { inkoAccessToken } = req.body	
			const userData = await userService.homePage( inkoAccessToken )
			res.json( userData )
		}
		catch (e) {
			next(e)
		}
	}

	async getCoursesForUser(req, res, next) {
		try {
			const { userCourses } = req.body
			const courses = await usersQuery.getAll("courses_for_user" , "id", userCourses   )
			let subjects = await usersQuery.getAll("subjects")
			
			res.json({ courses, subjects } )
		}
		catch (e) {
			next(e)
		}
	}

	async verifyUserToken(req, res, next) {
		try {
			
			const { token } = req.body
			const userData = await userService.verifyUserToken( token )			
			res.json( userData )
		}
		catch (e) {
			next(e)
		}
	
	}

	async getDescription(req, res, next) {
		
		try {
			const { id } = req.query
			const descPath = path.resolve( __dirname, `../src/users/user-${ id }`, "description.txt")
			const html = fs.readFileSync( descPath, "utf-8" )
			res.json( html )
		}
		catch (e) {
			next( e )
		}
	}

	async uploadDescription(req, res, next) {
		try {
			
			const { id } = req.query
			const dirPath = path.resolve( __dirname, `../src/users/user-${id}`)
			const isDirPathExist = fs.existsSync( dirPath )
			
			if (isDirPathExist) {
				const filePath = path.resolve( dirPath, `description.txt`)
				const writableStream = fs.createWriteStream ( filePath )
				
				req.on("data", function (chunck) {
					writableStream.write( chunck )
				})
				
				req.on("end", function () {
					writableStream.end()
					res.json( {	message: "ok" } )
				})
			}
			else res.json({error: "not save description"})
		}
		catch( e) {
			next(e)
		}
	}

}

module.exports = new UserController();