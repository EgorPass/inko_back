const ApiError = require("../error/apiError")
const courseService = require("../service/courseService.js")
const fs = require("fs")
const path = require("path")

class CourseController {

	async createSubject(req, res, next) {
		try {
			const { subject, description } = req.body
			const data = await courseService.addSubect( { subject, description } )
			res.json( data )			
		}
		catch (e) {
			next(e)
		}
	}

	async createCourse(req, res, next) {
		try {			
			const  { course, fileName }  = req.body
			const newCourse = await courseService.addCourse( { course, fileName } )
			res.send( newCourse )
		}
		catch (e) {
			next(e)
		}
	}

	async getAllCourses(req, res, next) {
		try {
			let userId = null, courses, subjects, usersCourses 
			
			if (req.method === "POST") {
				( { userId } = req.body )
			}
			
			({ courses, subjects, usersCourses } = await courseService.getCourses(userId))
			
			res.json({
				courses,
				subjects,
				usersCourses
			})
		}
	
		catch (e) {
			next(e)
		}
	}

	async updateCourse(req, res, next) {
		try {
			const { course, fileName }  = req.body;			
			const data = await courseService.updateCourse( { course, fileName } )
				return res.json( data )
		}
		catch (e) {
			next(e)
		}
	}

	async removeCourse(req, res, next) {
		try {
			const { courseId } = req.body
			const data = await courseService.removeCourse( courseId )
				return res.json( {courseId})
		}
		catch (e) {
			next(e)
		}
	}

	async removeSubject(req, res, next) {
		try {
			const { subjectId } = req.body
			const data = await courseService.removeSubject(subjectId)			
				res.json({ subjectId })
		}
		catch (e) {
			next(e)
		}
	}

	async updateSubject(req, res, next) {
		try {
			const { subject} = req.body
			const data = await courseService.updateSubject({ subject })
				res.json(subject)
		}
		catch (e) {
			next(e)
		}
	}

	async getDescription(req, res, next) {
		try {
			const { type, id } = req.query
			const html = await courseService.getDescription( type, id)
			return res.json(  html )
		}
		catch (e) {
			console.log( e.message)	
		}
	}

	async uploadDescription( req, res, next ) {
		try {
			const { type, id } = req.query
			const chunckPath = type === "course" ? `courses/course-${id}`: `subjects/subject-${id}`
			const dirPath = path.resolve( __dirname, `../src/${chunckPath}`)
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

	async uploadCourseFile(req, res, next) {		
		try {
			let filePath = path.resolve( __dirname, "../src/upload", "course.pdf")
			let writableStream = fs.createWriteStream( filePath )
			
			req.on("data", chunck => {
				writableStream.write( chunck )
			})	 
			
			req.on("end", () => {
				writableStream.end()
				res.json({ message: "fuck you"  })
			})	

			}
			catch (e) {
				next( e )
			}
	}

	async deleteFileFromUpload(req, res, next) {
		
		const resuslt = await courseService.deleteFileFromUpload()
		res.json({message: "ok"})
	}

	async deleteCourseFile(req, res, next) {		
		try {
			const { course, isCreateCourse } = req.body 
			const data = await courseService.deleteCourseFile( { course, isCreateCourse} )
			res.json( data )
		}
		catch (e) {
			next(e)
		}
	}
	
	async resetCourseFile(req, res, next) {
		try {
			const { course, isCreateCourse } = req.body 
			const data = await courseService.resetCourseFile( { course, isCreateCourse} )
			res.json( data )
		}
		catch (e) {
			next(e)
		}
	}

	async getPdfFileForViewer( req, res, next ) {
		try {
			const { courseId } = req.query

			if( !courseId ) throw new Error( "not courses")
			const coursePath = await courseService.getPdfPathFileForViewer(courseId)
			const stat = fs.statSync( coursePath )

			res.setHeader( "Content-Length", stat.size)
			
			if (coursePath) {
				const stream = fs.createReadStream( coursePath )
				stream.pipe( res )

			}
			else {
				res.json({status: 404})
			}
		}
		catch (e) {
			next(e)
		}
	}
	
}

module.exports = new CourseController()