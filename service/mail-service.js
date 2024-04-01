const nodemailer = require("nodemailer");
const uuid = require("uuid")
const usersQuery = require("../db/query/usersQuery")
const apiError = require("../error/apiError")

class MailService {

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			}
		})
	} 

	async sendActivationMail(to, link) {
		
		try {
	
			const test = await this.transporter.sendMail({
					from: process.env.SMTP_USER,
					to,
				subject: `активация аккуанта на ${process.env.API_URL}`,
				text: " ",
				html: `
					<div>
						<h1>Для активации аккунта на портале для преподавателей inko, перейдите по ссылке</h1>
						<a href = "${link}">${link}</a>
					</div>
				`
				})
		}
		catch (e) {
			console.log( e) 
			throw apiError.badRequest(e.message)
		}
	}

	async createMail(to, id) {

		const activatedLink = uuid.v4();
			await usersQuery.createRow("active-users", {userId: id, activatedLink})
			await this.sendActivationMail(to, `${process.env.API_URL}/api/user/activate/${activatedLink}`)
	}

}

module.exports = new MailService()