const sequelize = require("../db.js")
const { DataTypes } = require("sequelize")

const { Courses } = require('./courseModels')

const Users = sequelize.define('users', 
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
			unique: true,
		},
		email: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: true,
		},
		surName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: false,
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			unique: false,
		},
		secondName: {
			type: DataTypes.STRING(100),
			// allowNull: false,
			unique: false,
			// defaultValue: ""
		}
	},
	{
		timestamps: false
	}
)

const UsersActive = sequelize.define('active_users',
	{
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		activatedLink: {
			type: DataTypes.STRING,
			allowNull: false,
		}
	},
	{
		timestamps: false
	}
)

const Passwords = sequelize.define('passwords',
	{
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.TEXT,
			allowNull: false,
		} 
	},
	{
		timestamps: false
	}
)

const Tokens = sequelize.define('tokens',
	{
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
		},
		access_token: {
			type: DataTypes.TEXT,
			allowNull: false,
			// defaultValue: " ",
		},
		refresh_token: {
			type: DataTypes.TEXT,
			allowNull: false,
			// defaultValue: " ",

		}
	},
	{
		timestamps: false
	}
)

const Roles = sequelize.define('roles',
	{
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: true,
		},
		create_content: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		create_user: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		// change_user: {
		// 	type: DataTypes.BOOLEAN,
		// 	defaultValue: false,
		// },
		// can_upload: {
		// 	type: DataTypes.BOOLEAN,
		// 	defaultValue: false,
		// },
		can_download: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		can_use: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		timestamps: false
	}
)

const UsersCourses = sequelize.define('users_courses',
	{
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: false
		},
		courseId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: false,
		}
	},
	{
		timestamps: false,
		freezeTableName: true,
	}
)

Users.hasOne(Passwords);
Passwords.belongsTo(Users)

Users.hasOne(Tokens);
Tokens.belongsTo(Users)

Users.hasOne(Roles);
Roles.belongsTo(Users)

Users.hasOne(UsersActive);
UsersActive.belongsTo(Users);

Users.belongsToMany(Courses, {through: UsersCourses})
Courses.belongsToMany(Users, {through: UsersCourses})

// Users.hasMany(UsersCourses)
// UsersCourses.belongsTo(Users)

module.exports = {
	Users,
	Passwords,
	Tokens,
	Roles,
	UsersActive,
	UsersCourses
}