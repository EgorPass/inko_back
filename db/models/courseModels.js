const sequelize = require("../db.js")
const { DataTypes } = require("sequelize")

const Courses = sequelize.define('courses',
	{
		subjectId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			// unique: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "constructor",
		},
		fileName: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: "",
		},
		isexist: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		}
	},
	{
		timestamps: false
	}

);

const Subjects = sequelize.define('subjects',
	{
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		}
	},
	{
		timestamps: false
	}
)

const CoursesPath = sequelize.define('courses_paths',
	{
		courseId: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		path: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		}
	},
	{
		timestamps: false,
		freezeTableName: true
	}
)

Subjects.hasMany(Courses)
Courses.belongsTo(Subjects)

Courses.hasOne(CoursesPath)
CoursesPath.belongsTo(Courses)

module.exports = {
	Courses,
	Subjects,
	// CoursesPath
}