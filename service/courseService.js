const fs = require("fs")
const path = require("path")
const ApiError = require("../error/apiError")
const usersQuery = require("../db/query/usersQuery")
 
class CourseService {
	
	async addSubect( { subject} ) {
		
		const buf = await usersQuery.getItem("subjects", "title", subject.title )
		
		if (buf) {
			throw ApiError.badRequest(`Предмет ${subject.title} уже существует!`)
		}
		
		let subj

		try {
			subj = await usersQuery.createRow("subjects", { title: subject.title })
			
			const subjectPath = path.resolve(__dirname, `../src/subjects/subject-${subj.id}`)
			const isExist = fs.existsSync(subjectPath)
				
			if (!isExist) {
				console.log( "mkdir >>>>>>>>>>> ", true)

					fs.mkdirSync( subjectPath )
				}			
				
			const data = await usersQuery.getItem( "subjects", "id", subj.id)
				return data 


		}
		catch (e) {
			await this.removeSubject(subj.id)
			return ApiError.internal("что то пошлло не так на сервере при создании предмета, давай еще раз попробуем!")
		}	
	}

	async addCourse({ course, fileName }) {
			
		const buf = await usersQuery.getItem("courses", "title", course.title)
		if (buf) {
			throw ApiError.badRequest(`курс с названием ${course.title} уже существует!`)
		}
		
		let newCourse

		try {
			newCourse = await usersQuery.createRow("courses", { subjectId: course.subjectId, title: course.title, type: course.type, isexist: course.isexist, fileName })
			

			const coursePath = path.resolve(__dirname, `../src/courses/`, `course-${newCourse.id}`)
			const isExists = fs.existsSync(coursePath)

			if (!isExists) {
				fs.mkdirSync(coursePath)
					
				if (course.type === "file") { 
					this.saveFileAtCourse( newCourse )
				}
					
			}
			newCourse = await usersQuery.getItem("courses", "id", newCourse.id)
			return newCourse  
		}
		catch (e) {
			await this.removeCourse(newCourse.id)
			throw ApiError.internal("что то пошло не так на сервере, давой попробуем еще раз")
		}
	}
	
	async updateCourse({ course, fileName }) {		

		try {

			const coursePath = path.resolve(__dirname, `../src/courses/`, `course-${course.id}`)

			if (course.type === "file") {
					this.saveFileAtCourse( course )
			}

			const delPath = path.resolve( __dirname, "../src/delete/", `course-${course.id}.pdf`)
			const isDeletePathExist = fs.existsSync( delPath )
			if (isDeletePathExist) {
				fs.unlinkSync( delPath )
			}

			await usersQuery.updateRow("course", "id", course.id, { ...course, fileName } )
			const courseFromDB = await usersQuery.getItem( "courses", 'id', course.id )

			return courseFromDB
		}
		catch (e) {
			throw ApiError.internal("не получилось изменить курс")
		}

	}

	async saveFileAtCourse({ id }) {
		const filePath = path.resolve( __dirname, "../src/upload/course.pdf")
		const isFileExist = fs.existsSync( filePath )
	
		if (isFileExist) {
			const dirCoursePath = path.resolve( __dirname, `../src/courses/course-${id}/course-${id}.pdf`)
			fs.renameSync( filePath, dirCoursePath )

		}
	
	}

	async removeCourse(courseId) {
		try {
			const coursePath = path.resolve(__dirname, "../src/courses/", `course-${courseId}`)
			const isExists = fs.existsSync( coursePath )
			
			if (isExists) {				
				fs.rmdirSync(coursePath, {recursive: true})
			}
			
			const data = await usersQuery.delete("course", "id", courseId)
			return data
		}
		catch (e) {
			throw ApiError.internal("не получилось удалить курс")
		}
	}

	async removeSubject(subjectId) {
		try {
	
			let courses = await usersQuery.getAll("courses")
			if (courses.length > 0) {
				courses.forEach( async it => {
					if( it.subjectId === subjectId ) await this.removeCourse( it.id )
				})
			}

			const subjectPath = path.resolve(__dirname, "../src/subjects/", `subject-${subjectId}`)
			const isExists = fs.existsSync( subjectPath )
						
			if (isExists) {				
					fs.rmdirSync(subjectPath, {recursive: true})
				}
				
			const res = await usersQuery.delete("subjects", "id", subjectId)
			return res
		}
		catch (e) {
			console.log (e )
			throw ApiError.internal("не получилось удалить предмет и все его курсы")
		}
	}

	async updateSubject( { subject } ) {		
		try {
			const data = await usersQuery.updateRow( "subjects", "id", subject.id, subject)
			return data
		}
		catch (e) {
			throw ApiError.internal("не получилось обновить предмет")
		}
	}

	async getCourses(userId) {
		// console.log( "continue >>>>>>>>>>>>>>>>>>>>>>>>>>")
		try {
						
			let courses = await usersQuery.getAll("courses")
			let subjects = await usersQuery.getAll("subjects")
			let usersCourses = await usersQuery.getItem("users_courses", "userId", +userId, "findAll")
				
			// console.log( courses )
			return { courses, subjects, usersCourses }

		}
		catch (e) {
			throw ApiError.internal("не получилось забрать все курсы")
		}
	}

	async getPdfPathFileForViewer(courseId) {
		
		const filePath = path.resolve(__dirname, `../src/courses/course-${courseId}`)
		const isExist = fs.existsSync( filePath )
		let fileName 

		if (isExist) {

			const arr =	fs.readdirSync(filePath)
				.filter(file => {
					return file.endsWith(".pdf")
				})
							
			fileName = arr[0] ? arr[0] : null
			
		}
		else {
			return null
		}

		return fileName ? path.resolve(filePath, fileName) : null
	}

	async getDescription(type, id) {
	
		let path_

		switch (type) {
			case "course": path_ = "courses/course"
				break;
			case "subject": path_ = "subjects/subject"
				break;
		}

		const descPath = path.resolve(__dirname, `../src/${path_}-${id}`, "description.txt")
		const html = fs.readFileSync( descPath , 'utf-8')

		return html
	}

	async deleteFileFromUpload() {
		const pathFile = path.resolve( __dirname, "../src/upload/course.pdf")
		const fileIsExist = fs.existsSync( pathFile )
		
		if (fileIsExist) {
			fs.unlinkSync( pathFile )		
		}
		return null
	}

	async deleteCourseFile( { course } ) {
			
		const { id } = course
		const pathFile = path.resolve(__dirname, `../src/courses/course-${ id }/course-${ id }.pdf`)
		const fileIsExist = fs.existsSync( pathFile )
		
		if (fileIsExist) {
			const pathDelete = path.resolve( __dirname, `../src/delete/course-${id}.pdf`)
			fs.renameSync( pathFile, pathDelete )	
		}
	
		return {message: "ok"}	
	}

	async resetCourseFile({ course, isCreateCourse }) {
		
		const { id } = course;
		const uploadPath = path.resolve(__dirname, "../src/upload/course.pdf")
		const deletePath = path.resolve( __dirname, `../src/delete/course-${ id }.pdf`)
		
		const isUploadPathExist = fs.existsSync( uploadPath )
		const isDeletePathExist = fs.existsSync( deletePath )
		
		if (isUploadPathExist) {
			fs.unlinkSync( uploadPath )		
		}
		if (isDeletePathExist) {
			const coursePath = path.resolve(__dirname, `../src/courses/course-${id}/course-${id}.pdf`)
			fs.renameSync(deletePath, coursePath)
		}

		return {message: "ok"}
	}
}

module.exports = new CourseService()