const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const sauceControllers = require("../controllers/sauceControllers");

router.get("/", auth, sauceControllers.arraySauce);
router.get("/:id", auth, sauceControllers.sauceSingle);
router.post("/", auth, multer, sauceControllers.sauceCreate); 
router.put("/:id", auth, multer, sauceControllers.sauceUpdate);
router.delete("/:id", auth, multer, sauceControllers.sauceDelete);
router.post("/:id/like", auth, sauceControllers.likeCreate);


module.exports = router;