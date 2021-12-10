/* =============== Shushu Chen =============== */
const { createClient } = require("redis");
const { ObjectId } = require("mongodb");

function VideoDB() {
  const myDB = {};

  myDB.getVideoByID= async (video_id) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();

      // get the video by ID
      const video = await client.hGetAll(`video:${video_id}`);

      return video;
    } finally {
      await client.quit();
    }
  };

  myDB.getMetricsByID= async (video_id) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();

      // get the video by ID
      const video = await client.hGetAll(`video:${video_id}:metrics`);

      return video;
    } finally {
      await client.quit();
    }
  };

  myDB.updateVideoByID= async (video) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();

      // get the video by ID
      await client.hSet(`video:${video.id}`, {
        id: `${video.id}`,
        title: video.title,
        length: `${video.length}`,
        created_time: `${video.created_time}`,
        type: `${video.type}`,
        user_id: `${video.user_id}`,
      });

      const newVideo = client.hGetAll(`video:${video.id}`);

      return newVideo;
    } finally {
      await client.quit();
    }
  };

  myDB.createVideo= async (video) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();

      video.id = new ObjectId();

      // get the video by ID
      await client.hSet(`video:${video.id}`, {
        id: `${video.id}`,
        title: video.title,
        length: `${video.length}`,
        created_time: `${video.created_time}`,
        type: `${video.type}`,
        user_id: `${video.user_id}`,
      });

      const newVideo = client.hGetAll(`video:${video.id}`);

      return newVideo;
    } finally {
      await client.quit();
    }
  };

  myDB.deleteVideoByID= async (video_id) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();

      // get the video by ID
      await client.hDel(`video:${video_id}`);

      const exists = await client.exists(`video:${video_id}`);

      return exists;
    } finally {
      await client.quit();
    }
  };

  return myDB;
}

module.exports = VideoDB();
