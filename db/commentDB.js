const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

function CommentDB() {
  const myDB = {};
  const DB_NAME = "videometrics";
  const uri = process.env.MONGO_URI;
  const COL_NAME_COMMENT = "Comment";

  myDB.findForVideoID = async (videoID) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected");

      // console.log(await listDatabases(client));

      const col = client.db(DB_NAME).collection(COL_NAME_COMMENT);

      const comments = await col.find({ video_id: ObjectId(videoID) }).toArray();

      return comments;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.createOne = async (content, userID, videoID) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    // console.log("Connecting to the db");

    try {
      await client.connect();
      // console.log("Connected");

      const col = client.db(DB_NAME).collection(COL_NAME_COMMENT);
      // console.log("Collection ready, creating user:", user);
      const comment = {
        id: ObjectId(),
        video_id: ObjectId(videoID),
        user_id: ObjectId(userID),
        content: content,
        created_time: new Date(),
      } ;

      const res = await col.insertOne(comment);
      console.log("Inserted", res);

      return comment;
    } finally {
      // console.log("Closing the connection");
      client.close();
    }
  };

  return myDB;
}

module.exports = CommentDB();
