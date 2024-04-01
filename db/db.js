const Sequelize = require("sequelize")

module.exports = new Sequelize(
	"inko", "inko", "12345",
	// process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS,
	
	{
		dialect: "postgres",
		host: process.env.HOST,
		port: process.env.DB_PORT,
	}
)