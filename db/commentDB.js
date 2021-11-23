const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

function CommentDB() {
  const myDB = {};
  const DB_NAME = "videometrics";
  const uri = process.env.MONGO_URI;
  const COL_NAME_VIDEO = "Comment";

  myDB.getVideos = async (query={}, orderCol={}, limit="" ) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected");

      const col = client.db(DB_NAME).collection(COL_NAME_VIDEO);
      console.log(
        `Collection ready, query:${query}, orderCol: ${orderCol}, limit: ${limit}`
      );

      const result = await col.find(query).sort(orderCol).limit(limit).toArray();

      return result;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.getVideoByID = async (videoID) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
      await client.connect();
      const col = client.db(DB_NAME).collection(COL_NAME_VIDEO);

      const result = await col.findOne({id:ObjectId(videoID)});
      console.log("result:", result);

      return result;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.createOne = async (post) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    // console.log("Connecting to the db");

    try {
      await client.connect();
      // console.log("Connected");

      const col = client.db(DB_NAME).collection(COL_NAME_VIDEO);
      // console.log("Collection ready, creating result:", result);

      const res = await col.insertOne(post);
      // console.log("Inserted", res);

      return res;
    } finally {
      // console.log("Closing the connection");
      client.close();
    }
  };

  myDB.getPosts = async (query) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected!");

      const col = client.db(DB_NAME).collection(COL_NAME_VIDEO);
      console.log("Collection ready, querying with ", query);

      const posts = await col.find(query).toArray();

      return posts;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.deletePostByID = async (postID) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected!");

      const db = client.db(DB_NAME);
      const col = db.collection(COL_NAME_VIDEO);
      console.log("Collection ready, deleting ", postID);

      const post = await col.deleteOne({ _id: postID });

      console.log("Deleted post", post);

      return post;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.updatePostByID = async (post) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected!");

      const postsCol = client.db(DB_NAME).collection(COL_NAME_VIDEO);
      console.log("Collection ready, update ", post);

      const res = await postsCol.updateOne(
        { _id: ObjectId(post._id) },
        {
          $set: {
            title: post.title,
            date: post.date,
            content: post.content,
          },
        }
      );
      console.log("Updated", res);

      return res;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  return myDB;
}

module.exports = CommentDB();
