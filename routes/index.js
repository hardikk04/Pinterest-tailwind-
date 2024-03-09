var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const upload = require("./multer");
const LocalStrategy = require("passport-local");

passport.use(new LocalStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { nav: false });
});

router.get("/login", (req, res) => {
  res.render("login", { nav: false, error: req.flash("error") });
});

router.get("/profile", isLoggedIn, async (req, res) => {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");
  res.render("profile", { nav: true, user: user });
});

router.get("/feed", isLoggedIn, async (req, res) => {
  const user = await userModel.find();
  const posts = await postModel.find().populate("user");
  res.render("feed", { nav: true, user: user, posts });
});

router.get("/alluploads", isLoggedIn, async (req, res) => {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts");
  res.render("alluploads", { nav: true, user: user });
});

router.get("/create", isLoggedIn, (req, res) => {
  res.render("create", { nav: true });
});

router.post(
  "/createpost",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(404).send("No files were uploaded.");
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.create({
      title: req.body.title,
      description: req.body.description,
      user: user,
      image: req.file.filename,
    });
    user.posts.push(post._id);
    await user.save();

    res.redirect("/alluploads");
  }
);

router.post("/dpupload", isLoggedIn, upload.single("dp"), async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });

  user.dp = req.file.filename;
  await user.save();

  res.redirect("/profile");
});

router.post("/register", (req, res) => {
  const userdata = new userModel({
    username: req.body.username,
    fullname: req.body.fullname,
    posts: [],
  });

  userModel.register(userdata, req.body.password).then((registereduser) => {
    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile");
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {}
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
