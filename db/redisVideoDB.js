/* =============== Shushu Chen =============== */
const { createClient } = require("redis");
// const { ObjectId } = require("mongodb");

function RedisVideoDB() {
  const myDB = {};

  // myDB.getVideoByID= async (video_id) => {
  //   let client;

  //   try {
  //     client = createClient();
  //     client.on("error", (err) => console.log("Redis Client Error", err));
  //     await client.connect();

  //     // get the video by ID
  //     const video = await client.hGetAll(`video:${video_id}`);

  //     return video;
  //   } finally {
  //     await client.quit();
  //   }
  // };

  // myDB.getMetricsByID= async (video_id) => {
  //   let client;

  //   try {
  //     client = createClient();
  //     client.on("error", (err) => console.log("Redis Client Error", err));
  //     await client.connect();

  //     // get the video by ID
  //     const video = await client.hGetAll(`video:${video_id}:metrics`);

  //     return video;
  //   } finally {
  //     await client.quit();
  //   }
  // };

  // myDB.updateVideoByID= async (video) => {
  //   let client;

  //   try {
  //     client = createClient();
  //     client.on("error", (err) => console.log("Redis Client Error", err));
  //     await client.connect();

  //     // get the video by ID
  //     await client.hSet(`video:${video.id}`, {
  //       id: `${video.id}`,
  //       title: video.title,
  //       length: `${video.length}`,
  //       created_time: `${video.created_time}`,
  //       type: `${video.type}`,
  //       user_id: `${video.user_id}`,
  //     });

  //     const newVideo = client.hGetAll(`video:${video.id}`);

  //     return newVideo;
  //   } finally {
  //     await client.quit();
  //   }
  // };

  // myDB.createVideo= async (video) => {
  //   let client;

  //   try {
  //     client = createClient();
  //     client.on("error", (err) => console.log("Redis Client Error", err));
  //     await client.connect();

  //     video.id = new ObjectId();

  //     // get the video by ID
  //     await client.hSet(`video:${video.id}`, {
  //       id: `${video.id}`,
  //       title: video.title,
  //       length: `${video.length}`,
  //       created_time: `${video.created_time}`,
  //       type: `${video.type}`,
  //       user_id: `${video.user_id}`,
  //     });

  //     const newVideo = client.hGetAll(`video:${video.id}`);

  //     return newVideo;
  //   } finally {
  //     await client.quit();
  //   }
  // };

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

      // if (!client.exists("videoEditSet")){
      //   return [];
      // }

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

  myDB.clearActions = async () => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();
      console.group("getVideoActionAll");

      // get videoIds in descending order
      await client.del("videoEditSet");
      console.log("Deleted clearActions");

    } finally {
      await client.quit();
    }
  };

  // populated video actions
  myDB.populateVideoActions = async () => {
    await myDB.addVideoAction(videos[0], "created");
    await myDB.addVideoAction(videos[1], "updated");
    await myDB.addVideoAction(videos[2], "created");
    await myDB.addVideoAction(videos[3], "updated");
    await myDB.addVideoAction(videos_full[0], "deleted");
    await myDB.addVideoAction(videos_full[1], "created");
    await myDB.addVideoAction(videos[4], "created");
    await myDB.addVideoAction(videos[5], "updated");
    await myDB.addVideoAction(videos[6], "updated");
    await myDB.addVideoAction(videos_full[2], "updated");
    await myDB.addVideoAction(videos_full[0], "created");
  };


  return myDB;
}

const videos_full = [
  {
    id: "619d624df6a0af3047000d66",
    title: "X-Men: Days of Future Past",
    length: 89,
    created_time: { $date: "2019-09-06T23:34:07.000Z" },
    type: "MV",
    user_id: { $oid: "619c00c3f6a0af30640006ca" },
    metrics: [
      {
        likes: 134,
        views: 77701,
        comments: 3,
        created_time: { $date: "2021-06-18T03:49:35.000Z" },
      },
      {
        likes: 370,
        views: 44518,
        comments: 4,
        created_time: { $date: "2021-09-27T11:15:24.000Z" },
      },
    ],
  },
  {
    id: "619d624cf6a0af3064000d02",
    title: "Mimic 2",
    length: 196,
    created_time: { $date: "2019-06-04T19:55:51.000Z" },
    type: "YouTube",
    user_id: { $oid: "619c00c3f6a0af305d0006b2" },
    metrics: [
      {
        likes: 154,
        views: 52533,
        comments: 1,
        created_time: { $date: "2021-07-21T06:27:47.000Z" },
      },
      {
        likes: 209,
        views: 87338,
        comments: 1,
        created_time: { $date: "2020-11-26T01:01:55.000Z" },
      },
      {
        likes: 222,
        views: 69283,
        comments: 5,
        created_time: { $date: "2021-07-14T22:08:36.000Z" },
      },
    ],
    _row_: 269,
  },
  {
    id: "619d624cf6a0af3047000d12",
    title: "Funhouse, The",
    length: 123,
    created_time: { $date: "2018-10-12T14:34:57.000Z" },
    type: "Interview",
    user_id: { $oid: "619c00c3f6a0af305d0006cf" },
    metrics: [
      {
        likes: 193,
        views: 68756,
        comments: 1,
        created_time: { $date: "2021-01-10T16:55:44.000Z" },
      },
      {
        likes: 182,
        views: 65029,
        comments: 2,
        created_time: { $date: "2021-06-28T23:35:19.000Z" },
      },
      {
        likes: 406,
        views: 9,
        comments: 4,
        created_time: { $date: "2021-04-17T05:37:32.000Z" },
      },
      {
        likes: 335,
        views: 41251,
        comments: 0,
        created_time: { $date: "2021-11-12T14:21:08.000Z" },
      },
      {
        likes: 16,
        views: 34569,
        comments: 4,
        created_time: { $date: "2021-07-26T20:24:13.000Z" },
      },
    ],
    _row_: 161,
  },
];

const videos = [
  {
    id: "619d624df6a0af30a0000d4c",
    title: "Dolls",
    length: 139,
    created_time: { $date: "2020-09-14T20:33:28.000Z" },
    type: "MV",
    user_id: { $oid: "619c00c3f6a0af306400068b" },
  },
  {
    id: "619d624df6a0af30a0000d5b",
    title: "Fulltime Killer (Chuen jik sat sau)",
    length: 138,
    created_time: { $date: "2018-01-26T00:23:17.000Z" },
    type: "Documentary",
    user_id: { $oid: "619c00c3f6a0af30640006b0" },
  },

  {
    id: "619d624cf6a0af3064000cfc",
    title: "Dave Chappelle: For What it's Worth",
    length: 198,
    created_time: { $date: "2018-01-24T01:56:19.000Z" },
    type: "YouTube",
  },

  {
    id: "619d624df6a0af30a0000d61",
    title: "Parked",
    length: 93,
    created_time: { $date: "2019-12-15T07:22:29.000Z" },
    type: "Interview",
    user_id: { $oid: "619c00c3f6a0af30640006c1" },
  },
  {
    _id: "619d635b577922b836f8f103",
    id: { $oid: "619d624cf6a0af305d000d00" },
    title: "Cradle of Fear",
    length: 114,
    created_time: { $date: "2019-08-01T08:55:01.000Z" },
    type: "Documentary",
    user_id: { $oid: "619c00c3f6a0af305d0006a4" },
  },
  {
    id: "619d624cf6a0af305d000d03",
    title: "Carried Away",
    length: 177,
    created_time: { $date: "2020-08-22T20:36:32.000Z" },
    type: "TV Shows",
    user_id: { $oid: "619c00c3f6a0af305d0006ab" },
  },
  {
    id: "619d624cf6a0af305d000d30",
    title: "Yes, But... (Oui, mais...)",
    length: 160,
    created_time: { $date: "2020-10-24T13:10:11.000Z" },
    type: "YouTube",
    user_id: { $oid: "619c00c3f6a0af30470006a0" },
  },
];

module.exports = RedisVideoDB();
