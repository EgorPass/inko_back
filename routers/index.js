const Router = require("express");
const router = new Router();

const userRouter = require("./userRouter.js")
const courseRouter = require("./courseRouter.js")

router.use("/user", userRouter)
router.use("/course", courseRouter)

module.exports = router