/* =============== Shushu Chen =============== */
const { createClient } = require("redis");
const { ObjectId } = require("mongodb");

function RedisVideoDB() {
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

  myDB.addVideoAction = async (video, action) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();

      // get current time as number
      const time = new Date().getTime();
      console.group(`time: ${new Date()} ${typeof time}`);

      console.log("Ready to addVideoAction for " + video.title);

      // add action to videoEditSet set
      console.log(time * 100 + video.length);
      await client.zAdd("videoEditSet", {score: time, value: `${video.id}`});
      console.log("Added action to videoEditSet set");

      // add video and action to videoEdit hash
      await client.hSet(`videoEdit:${video.id}`, {
        id: `${video.id}`,
        time: `${time}`,
        action: action,
        title: `${video.title}`,
      });
      console.log("Added video and action to videoEdit hash");

      const exists = await client.exists(`videoEdit:${video.id}`);
      console.groupEnd(exists);
      return exists;
    } finally {
      await client.quit();
    }
  };

  myDB.getVideoActionAll = async () => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();
      console.group("getVideoActionAll");

      // get videoIds in descending order
      const videoIds = await client.ZRANGE("videoEditSet", -10, -1);
      console.log("Got videoIds", videoIds);
      const action_list = [];

      for (let video_id of videoIds){
        let actionObj = await client.hGetAll(`videoEdit:${video_id}`);
        action_list.push(actionObj);
      }
      console.log("Got action_list", action_list);

      console.groupEnd();
      return action_list;
    } finally {
      await client.quit();
    }
  };


  return myDB;
}

module.exports = RedisVideoDB();
