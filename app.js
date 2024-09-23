const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db");
// init app & middleware
const app = express();
app.use(express.json());

// db connection
let db;
connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log("app listening on port 3000");
    });
    db = getDb();
  } else {
    throw new Error(`Error: ${err}`);
  }
});

//routes
app.get("/books", (req, res) => {
  let page = req.query.p || 0;
  let booksPerPage = 3;
  let books = [];

  db.collection("books")
    .find()
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .sort({ price: 1 })
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch(() => {
      res.status(500).json({ error: "could not fetch documents!" });
    });
});

app.get("/books/:id", (req, res) => {
  let id = req.params.id;

  if (ObjectId.isValid(id)) {
    db.collection("books")
      .findOne({ _id: new ObjectId(id) })
      .then((book) => {
        if (book != null) {
          res.status(200).json(book);
        } else {
          res.status(404).json({ error: "book not found!" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Oooops! Server Error." });
      });
  } else {
    res.status(400).json({ error: "Invalid id!" });
  }
});

app.post("/books", (req, res) => {
  let book = req.body;
  db.collection("books")
    .insertOne(book)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Oooops! Server Error." });
    });
});

app.delete("/books/:id", (req, res) => {
  let id = req.params.id;
  if (ObjectId.isValid(id)) {
    db.collection("books")
      .deleteOne({ _id: new ObjectId(id) })
      .then((result) => {
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Item deleted Successfully!" });
        } else {
          res.status(404).json({ error: "didn't find what u want to delete" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Oooops! Server Error." });
      });
  } else {
    res.status(400).json({ error: "Invalid id!" });
  }
});

app.patch("/books/:id", (req, res) => {
  let id = req.params.id;
  let updates = req.body;
  if (ObjectId.isValid(id)) {
    db.collection("books")
      .updateOne({ _id: new ObjectId(id) }, { $set: updates })
      .then((result) => {
        if (result.matchedCount === 1) {
          res.status(200).json({ message: "Item updated Successfully!" });
        } else {
          res.status(404).json({ error: "didn't find what u want to update" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Oooops! Server Error." });
      });
  } else {
    res.status(400).json({ error: "Invalid id!" });
  }
});
