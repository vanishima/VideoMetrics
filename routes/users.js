var express = require("express");
var router = express.Router();
const UserDB = require("../db/userDB.js");
const RedisUserDB = require("../db/redisUserDB.js");

/* GET users listing. */
router.get("/", async function (req, res) {
  await RedisUserDB.populateOnce(UserDB, 20);
  let users = await RedisUserDB.sampleUsers(20);
  let mostFollowedUsers = await UserDB.mostFollowedUsers(20);
  res.render("user", { users, mostFollowedUsers });
});

router.post("/", async function (req, res) {
  let insertedUserData = await UserDB.createOne(req.body);
  await RedisUserDB.createOne(insertedUserData);
  res.redirect("back");
});

router.post("/delete", async function (req, res) {
  await UserDB.deleteUserByID(req.body.userID);
  await RedisUserDB.deleteUserByID(req.body.userID);
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
