const { Router } = require("express");
const router = Router();

router.use("/books", require('./books'));
//router.use("/books/search", require('./books'));
router.use("/authors", require('./authors'));

module.exports = router;