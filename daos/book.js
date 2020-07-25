const mongoose = require('mongoose');

const Book = require('../models/book');
//const Author = require('../models/authors');

module.exports = {};

module.exports.getAll = (page, perPage) => {
  return Book.find().limit(perPage).skip(perPage*page).lean();
}

module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
}

module.exports.getAllByAuthor = (page, perPage, authorId) => {
  // if (!mongoose.Types.authorId.isValid(authorId)) {
  //   return null;
  // }
  const books = Book.find({ authorId: authorId }).limit(perPage).skip(perPage*page).lean();
  //books.index({ key : authorId});
  return books;
}

module.exports.getByQuery = (queryText) => {
  const books = Book.find(
    { $text: { $search: queryText }},
    { score: { $meta: "textScore" }}
  ).sort({ score: {$meta: "textScore"}});
  return  books;
}

module.exports.getAuthorStats = () => {
  const authorStats = Book.aggregate([
    { $group: { _id: "$authorId", 
      averagePageCount: { $avg: "$pageCount" },
      numBooks: { $sum: 1 },
      titles: { $push: "$title" }}},
    { $project: { _id: 0, authorId: "$_id",
      averagePageCount: 1,
      numBooks: 1,
      titles: 1} },
   { $unwind: "$authorId"}
  ]);
  return authorStats;
}

module.exports.getAllAuthorStats = () => {
  const authorStats = Book.aggregate([
    { $group: { _id: "$authorId", 
      averagePageCount: { $avg: "$pageCount" },
      numBooks: { $sum: 1 },
      titles: { $push: "$title" }}
    },
    { $project: { _id: 0, authorId: { $toObjectId: "$_id" },
      averagePageCount: 1,
      numBooks: 1,
      titles: 1} 
    },
    { $lookup: { from: "authors",
      localField: "authorId",    // field in the Books collection
      foreignField: "_id",  // field in the Author collection
      as: "author" }
    },
    { $unwind: "$author" },
    { $unwind: "$authorId" }
  ]);
  return authorStats;
}

module.exports.deleteById = async (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.deleteOne({ _id: bookId });
  return true;
}

module.exports.updateById = async (bookId, newObj) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.updateOne({ _id: bookId }, newObj);
  return true;
}

module.exports.create = async (bookData) => {
  try {
    const created = await Book.create(bookData);
    return created;
  } catch (e) {
    if (e.message.includes('validation failed')) {
      throw new BadDataError(e.message);
    } else if (e.message.includes('E11000 duplicate key')) {
      throw new BadDataError(e.message);
    } else
    throw e;
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;