const express = require("express");

const router = express.Router();
const sauceControllers = require("../controllers/sauceControllers");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.get("/", auth, sauceControllers.arraySauce);
router.get("/:id", auth, sauceControllers.sauceSingle);
router.post("/", auth, multer, sauceControllers.sauceCreate);
router.put("/:id", auth, multer, sauceControllers.sauceUpdate);
router.delete("/:id", auth, multer, sauceControllers.sauceDelete);


module.exports = router;