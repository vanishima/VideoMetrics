const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

function PostDB() {
  const myDB = {};
  const DB_NAME = "videometrics";
  const uri = process.env.MONGO_URI;
  const COL_NAME_POST = "Video";

  myDB.findOne = async (query = {}) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected");

      // console.log(await listDatabases(client));

      const col = client.db(DB_NAME).collection("Users");
      console.log("Collection ready, querying:", query);

      const user = await col.findOne(query);

      return user;
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

      const col = client.db(DB_NAME).collection(COL_NAME_POST);
      // console.log("Collection ready, creating user:", user);

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

      const col = client.db(DB_NAME).collection(COL_NAME_POST);
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
      const col = db.collection(COL_NAME_POST);
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

      const postsCol = client.db(DB_NAME).collection(COL_NAME_POST);
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

module.exports = PostDB();
