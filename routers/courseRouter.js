const Router = require("express")
const courseController = require("../controllers/courseController")
const authMiddlware = require("../middlewares/auth-middleware")

const router = new Router()

router.use( authMiddlware )

router.post("/createSubject", 
															// authMiddlware, 
																							courseController.createSubject )

router.post("/updateSubject", 
															// authMiddlware, 
																							courseController.updateSubject )

router.post("/removeSubject", 
															// authMiddlware, 
																							courseController.removeSubject )


router.post("/createCourse", 
															// authMiddlware, 
																							courseController.createCourse )

router.post("/updateCourse", 
															// authMiddlware, 
																							courseController.updateCourse )

router.post("/removeCourse", 
															// authMiddlware, 
																							courseController.removeCourse )


router.post("/getCourses", 
															// authMiddlware, 
																							courseController.getAllCourses )

router.get("/getCourses", 
															// authMiddlware, 
																							courseController.getAllCourses )


router.post("/uploadCourseFile",
															// authMiddlware,
																							courseController.uploadCourseFile)
router.post("/deleteCourseFile",
															// authMiddlware,
																							courseController.deleteCourseFile)
router.post("/resetCourseFile", 
															// authMiddlware, 
																							courseController.resetCourseFile  )


router.get("/getDescription", 
															// authMiddlware, 
																							courseController.getDescription )

router.post("/uploadDescription", 
															// authMiddlware, 
																							courseController.uploadDescription )


router.delete('/deleteFileFromUpload', 
															// authMiddlware, 
																							courseController.deleteFileFromUpload )

router.get("/getPdfFileForViewer",
															// authMiddlware,
																							courseController.getPdfFileForViewer)

module.exports = router 