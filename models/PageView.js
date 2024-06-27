const mongoose = require("mongoose");

const PageViewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  page: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const PageView = mongoose.model("PageView", PageViewSchema);

module.exports = PageView;
