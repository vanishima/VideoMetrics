var express = require("express");
var router = express.Router();
const UserDB = require("../db/userDB.js");

/* GET users listing. */
router.get("/", async function (req, res) {
  let users = await UserDB.sampleUsers(10);
  let mostFollowedUsers = await UserDB.mostFollowedUsers(10);
  res.render("user", { users, mostFollowedUsers });
});

router.post("/", async function (req, res) {
 await UserDB.createOne(req.body);
  res.redirect("back");
});

router.post("/delete", async function (req, res) {
  await UserDB.deleteUserByID(req.body.userID);
  res.redirect("back");
});

router.post("/follows", async function (req, res) {
  if ("follows" in req.body) {
    await UserDB.follow(req.body.followerID, req.body.followeeID);
  } else if ("unfollows" in req.body) {
    await UserDB.unfollow(req.body.followerID, req.body.followeeID);
  }
  res.redirect("back");
});

module.exports = router;