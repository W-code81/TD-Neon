const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
const _ = require("lodash");
const date = require(__dirname + "/date.js"); //local module

let day = date.getDate();

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_LOCAL_URI)
  .then(() => console.log("successfully connected to MongoDB Atlas"))
  .catch((err) => console.log("MongoDB connection error: ", err));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const Schema = mongoose.Schema;

const itemsSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please check your data entry, no name specified."],
    },
    listName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemsSchema);

app.get("/", async (req, res) => {
  const items = await Item.find({ listName: day }).sort({ createdAt: -1 }); //sort items by creation date in descending order

  res.render("list", { listTitle: day, listItems: items });
});

app.post("/", async (req, res) => {
  const newItem = req.body.newItem;
  const listName = req.body.list;

  if (!newItem || newItem.trim() === "") {
    return res.redirect(listName === day ? "/" : `/${listName}`);
  }

  //console.log(req.body);

  const item = await Item.create({ name: newItem, listName: listName });

  res.redirect(listName === day ? "/" : `/${listName}`);
});

app.post("/delete", async (req, res) => {
  const itemId = req.body.itemId;
  const listName = req.body.listName;

  try {
    await Item.findByIdAndDelete(itemId);
    console.log("Successfully deleted the item.");
  } catch (err) {
    console.log("Error deleting the item: ", err);
  }

  res.redirect(listName === day ? "/" : `/${listName}`);
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  const items = await Item.find({ listName: customListName }).sort({ createdAt: -1 }); //sort items by creation date in descending order

  res.render("list", { listTitle: customListName, listItems: items });
});

app.listen(port, (req, res) => {
  console.log(`TD Neon is live on port ${port}`);
});
