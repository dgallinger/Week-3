const { Router } = require("express");
const router = Router();

const bookDAO = require('../daos/book');

// Create
router.post("/", async (req, res, next) => {
  const book = req.body;
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required');
  } else {
    try {
      const savedBook = await bookDAO.create(book);
      res.json(savedBook); 
    } catch(e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

//Read - author stats
router.get("/authors/stats", async (req, res, next) => {
  if (req.query.authorInfo) {
    const authorStats = await bookDAO.getAllAuthorStats();
    res.json(authorStats);
  } else {
    const authorStats = await bookDAO.getAuthorStats();
    res.json(authorStats);
  }
 });

// Read - books based on search term
router.get("/search", async (req, res, next) => {
  //console.log("search terms" + req.query.query);
  const books = await bookDAO.getByQuery(req.query.query);
  res.json(books);
  // if (book) {
  //   res.json(book);
  // } else {
  //   res.sendStatus(404);
  // }
});

// Read - single book
router.get("/:id", async (req, res, next) => {
  const book = await bookDAO.getById(req.params.id);
  if (book) {
    res.json(book);
  } else {
    res.sendStatus(404);
  }
});



// Read - all books - all books by certain author
router.get("/", async (req, res, next) => {
  let { page, perPage } = req.query;
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;
  if (req.query.authorId) {
    //console.log(req.query.authorId);
    const books = await bookDAO.getAllByAuthor(page, perPage, req.query.authorId);
    res.json(books);
  } else {
    const books = await bookDAO.getAll(page, perPage);
    res.json(books);
    //console.log("no id");
  }
  
});

// Update
router.put("/:id", async (req, res, next) => {
  const bookId = req.params.id;
  const book = req.body;
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required"');
  } else {
    try {
      const success = await bookDAO.updateById(bookId, book);
      res.sendStatus(success ? 200 : 400); 
    } catch(e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

// Delete
router.delete("/:id", async (req, res, next) => {
  const bookId = req.params.id;
  try {
    const success = await bookDAO.deleteById(bookId);
    res.sendStatus(success ? 200 : 400);
  } catch(e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;