let express = require("express");
let router = express.Router();
const { formatRelative } = require("date-fns");

// import { formatRelative } from 'date-fns';
const VideoDB = require("../db/videoDB");
const CommentDB = require("../db/commentDB");

/* GET videos list page. */
router.get("/", async function (req, res) {
  console.log("GET /videos");
  const query = req.query.query || {};
  const orderCol = req.query.orderCol || { created_time: -1 };
  const limit = req.query.limit || 20;
  const videos = await VideoDB.getVideos(query, orderCol, limit);
  videos.forEach(addRelativeTime);
  console.log("Got videos", videos);
  console.log("Video metrics", videos[0]);
  res.render("index", { videos });
});

/* GET videos details page. */
router.get("/:videoID", async function (req, res) {
  const videoID = req.params.videoID;
  console.log("GET /videos/videoID", videoID);

  const video = await VideoDB.getVideoByID(videoID);
  video.metrics[0].relative_time = await formatRelative(video.metrics[0].created_time, new Date());
  video.comments = (video.comments || []).filter(c => c.user != undefined);

  console.log("Got video", video);
  res.render("videoDetails", {
    v: video,
  });
});

router.post("/:videoID/comments", async function (req, res) {
  const videoID = req.params.videoID;
  console.log("Getting comment: ", req.body.commentContent);
  CommentDB.createOne(req.body.commentContent, req.body.userID, videoID);
  res.redirect("back");
});

/* POST update video details */
router.post("/update", async function (req, res) {
  const video = req.body;

  console.log("Got update video", video);

  await VideoDB.updateVideoByID(video);

  console.log("Video updated");

  res.render("videoDetails", { v: video });
});

/* GET delete video  */
router.post("/delete/:videoID", async function (req, res) {
  console.log("GET videos/:videoID/delete");
  const videoID = req.params.videoID;
  console.log("GET delete", videoID);

  await VideoDB.deleteVideoByID(videoID);

  console.log("Video deleted");

  res.redirect("/");
});

/* POST create video  */
router.post("/create", async function (req, res) {
  console.log("GET videos/create");

  const video = req.body;
  console.log("Got create video", video);

  await VideoDB.createOne(video);

  console.log("Video created");

  res.redirect("/");
});

function addRelativeTime(video) {
  video.relative_time = formatRelative(video.created_time, new Date());
}

module.exports = router;
