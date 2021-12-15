const { createClient } = require("redis");
const UserDB = require("./userDB");

function RedisCommentDB() {
  const myDB = {};

  myDB.createOne = async (comment) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();

      let user = comment.user;
      if (user == undefined) {
        user = await UserDB.getUser(comment.user_id.toString());
      }
      comment.user = user;
      console.log(`Creating comment in redis: ${JSON.stringify(comment)}`);

      await client.hSet(`comment:${comment.id.toString()}`, {
        id: comment.id.toString(),
        video_id: comment.video_id.toString(),
        user_id: comment.user_id.toString(),
        user: JSON.stringify(user),
        content: comment.content,
        created_time: comment.created_time.toString(),
      });
      await client.rPush(`video:${comment.video_id}:comments`, comment.id.toString());
    } finally {
      // console.log("Closing the connection");
      client.quit();
    }
  };

  myDB.commentsExists = async (videoID) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();

      return (await client.exists(`video:${videoID}:comments`)) == 1;
    } finally {
      // console.log("Closing the connection");
      client.quit();
    }
  };

  const getCommentWithClient = async (client, commentID) => {
    let values = await client.hmGet(`comment:${commentID}`, [
      "video_id",
      "user_id",
      "user",
      "content",
      "created_time",
      "numFollowers",
    ]);
    return {
      video_id: values[0],
      user_id: values[1],
      user: JSON.parse(values[2]),
      content: values[3],
      created_time: new Date(values[4]),
      numFollowers: values[5],
    };
  };

  myDB.findForVideoID = async (videoID) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();

      let commentIds = await client.lRange(`video:${videoID}:comments`, 0, -1);
      let promises = [];
      console.log(`Got commentIds ${commentIds} for video:${videoID}:comments`)
      for (const commentId of commentIds) {
        promises.push(getCommentWithClient(client, commentId));
      }
      return await Promise.all(promises);
    } finally {
      // console.log("Closing the connection");
      client.quit();
    }
  };

  return myDB;
}

module.exports = RedisCommentDB();
