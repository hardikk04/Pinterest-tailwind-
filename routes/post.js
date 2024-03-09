const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: String,
  description: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  image: String,
});

module.exports = mongoose.model("post", postSchema);
