const {
	Users,
	Tokens, Roles, Passwords, UsersActive,
	UsersCourses
} = require("../models/usersModels")

const { Op } = require("sequelize")

const { Courses, Subjects, CoursesPath } = require("../models/courseModels")

class UsersQuery {

	async getItem(from, prop, val, method = "findOne") {
		switch (from) {
			
			case "users": return await Users[method]({
				where: {
					[prop]: val,
				}
			})
				break;
			case "passwords": return await Passwords[method]({
				where: {
					[prop]: val,
				}
			})
				break;
			case "tokens": return await Tokens[method]({
				where: {
					[prop]: val,
				}
			})
				break;
			case "roles": return await Roles[method]({
				where: {
					[prop]: val,
				}
			})
				break;
			case "active-users": return await UsersActive[method]({
				where: {
					[prop]: val
				}
			})
				break;
			
			case "courses": return await Courses[method]({
				where: {
					[prop]: val
				}
			})
				break;
			
			case "subjects": return await Subjects[method]({
				where: {
					[prop]: val
				}
			})
				break;
			
		}

	}

	async createRow(to, opt) {

		// console.log (opt )

		switch (to) {
			case "users": return await Users.create(opt)
				break;
			
			case "tokens": return await Tokens.create(opt)
				break;
			
			case "password": return await Passwords.create(opt)
				break;
			
			case "roles": return await Roles.create(opt)
				break;
			
			case "active-users": return await UsersActive.create(opt)
				break;
			
			case "subjects": return await Subjects.create(opt)
				break;
			
			case "courses": return await Courses.create(opt)
				break;
			
			case "users_courses": return await UsersCourses.bulkCreate(opt)
				break;
			
			case "coursesPath": return await CoursesPath.create(opt)
				break;
		}
	}

	async updateRow(to, prop, val, opt) {
		
		switch (to) {
			case "users": return await Users.update(
				opt,
				{
					where: {
						[prop]: val
					}
				})
				break;
			
			case 'subjects': return await Subjects.update(
				opt,
				{
					where: {
						[prop]: val
					}
				}
			)
			
			case "course": return await Courses.update(
				opt,
				{
					where: {
						[prop]: val
					}
				}
			)
			
			case "passwords": return await Passwords.update(
				opt,
				{
					where: {
						[prop]: val
					}
				})
				break;
			
			case "tokens": return await Tokens.update(
				opt,
				{
					where: {
						[prop]: val
					}
				})
				break;
		}

	}

	async delete(from, prop, val, method = "destroy") {
		switch (from) {
			case "tokens": return await Tokens[method]({
				where: {
					[prop]: val
				}
			})
				break;
			case "users": return await Users[method]({
				where: {
					[prop]: val
				}
			})
				break;
		
			case "course": return await Courses[method]({
				where: {
					[prop]: val
				}
			})
				break;
			
			case "roles": return await Roles[method]({
				where: {
					[prop]: val
				}
			})
				break;
			
			case "users_courses": return await UsersCourses[method]({
				where: {
					[prop]: val
				}
			})
				break;

			case "subjects": return await Subjects[method]({
				where: {
					[prop]: val
				}
			})
				break;

		}
	}

	async getAll(from, prop = null, val = null) {
		switch (from) {

			case "users": return await Users.findAll();
				break;

			case "courses": return await Courses.findAll();
				break;
			
			case "subjects": return await Subjects.findAll();
				break;
			
			case "users_courses": return UsersCourses.findAll({
				where: {
					[prop]: val
				}
			}) 
				break;
			
			case "courses_for_user": return Courses.findAll({
				where: {
					[prop]: {
						[Op.in]: val
					}
				}
			})

		}
	}
}


module.exports = new UsersQuery()