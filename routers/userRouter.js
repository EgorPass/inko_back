const Router = require("express")
const userController = require( "../controllers/userController" )
const authMiddlware = require("../middlewares/auth-middleware")

const router = new Router();

router.post( '/registration',  userController.registration )
router.get( "/activate/:link",  userController.activate )
router.post( '/setPassword', userController.setPassword )
router.post( '/login', userController.login )
router.get( "/refresh", userController.refresh )
router.post( '/logout', userController.logout )

router.post("/removeUser", 
														authMiddlware, 
																						userController.removeUser)

router.post ("/updateUserData", 
														authMiddlware, 
																						userController.updateUserData)


router.get("/getAllUsers", 
														authMiddlware, 
																						userController.getAllUsers)

router.post( "/getUserData", 
														authMiddlware, 
																						userController.getUserData )


router.get("/getDescription", 
														authMiddlware, 
																						userController.getDescription)

router.post("/uploadDescription", 
														authMiddlware, 
																						userController.uploadDescription)



router.get("/getAuth", 
														authMiddlware, 
																						userController.getAuth)

router.post("/homePage", 
														authMiddlware, 
																						userController.homePage)

router.post("/getCoursesForUser", 
														authMiddlware, 
																						userController.getCoursesForUser )


router.post("/verifyUserToken", 
														authMiddlware, 
																						userController.verifyUserToken)


module.exports = router