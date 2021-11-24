const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

function UserDB() {
  const myDB = {};
  const DB_NAME = "videometrics";
  const uri = process.env.MONGO_URI;
  const COL_NAME_USER = "User";

  myDB.findOne = async (query = {}) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected");

      // console.log(await listDatabases(client));

      const col = client.db(DB_NAME).collection(COL_NAME_USER);
      console.log("Collection ready, querying:", query);

      const user = await col.findOne(query);

      return user;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.createOne = async (user) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    // console.log("Connecting to the db");

    try {
      await client.connect();
      // console.log("Connected");

      const col = client.db(DB_NAME).collection(COL_NAME_USER);
      // console.log("Collection ready, creating user:", user);

      const res = await col.insertOne({
        name: user.username,
        id: ObjectId(),
        numFollowers: 0,
      });
      console.log("Inserted", res);

      return res;
    } finally {
      // console.log("Closing the connection");
      client.close();
    }
  };

  myDB.getUsers = async (query) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected!");

      const col = client.db(DB_NAME).collection(COL_NAME_USER);
      console.log("Collection ready, querying with ", query);

      const posts = await col.find(query).toArray();

      return posts;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.sampleUsers = async (num) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected!");

      const col = client.db(DB_NAME).collection(COL_NAME_USER);

      const posts = await col
        .aggregate([{ $sort: { _id: -1 } }, { $limit: num }])
        .toArray();

      return posts;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.mostFollowedUsers = async (num) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected!");

      const follows = client.db(DB_NAME).collection("Follows");

      const posts = await follows
        .aggregate([
          { 
            $unwind: "$follows"
          },
          {
            $group: {
              _id: "$follows.id",
              followerCount: {
                $sum: 1
              }
            }
          },
          {
            $lookup: {
              from: "User",
              localField: "_id",
              foreignField: "id",
              as: "users",
            }
          },
          {
            $unwind: "$users"
          },
          {
            $sort: {
              "followerCount": -1,
            }
          },
          { $limit: num }
        ])
        .toArray();
      console.log("Got ", posts);
      return posts;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.deleteUserByID = async (userID) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected!");

      const db = client.db(DB_NAME);
      const col = db.collection(COL_NAME_USER);
      console.log("Collection ready, deleting ", userID);

      const user = await col.findOne({ id: ObjectId(userID) });
      const res = await col.deleteOne({ id: ObjectId(userID) });
      await col.updateMany(
        { id: { $in: user.follows } },
        { $inc: { numFollowers: -1 } }
      );

      console.log("Deleted post", res);
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.updateUserByID = async (id, query) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected!");

      const userCol = client.db(DB_NAME).collection(COL_NAME_USER);
      console.log("Collection ready, update ", query);

      const res = await userCol.updateOne({ id: ObjectId(id) }, query);
      console.log("Updated", res);

      return res;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.follow = async (followerID, followeeID) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected!");

      const userCol = client.db(DB_NAME).collection(COL_NAME_USER);

      const res1 = await userCol.updateOne(
        { id: ObjectId(followerID) },
        { $push: { follows: ObjectId(followeeID) } }
      );
      console.log("Updated", res1);
      const res2 = await userCol.updateOne(
        { id: ObjectId(followeeID) },
        { $inc: { numFollowers: 1 } }
      );
      console.log("Updated", res2);
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.unfollow = async (followerID, followeeID) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected!");

      const userCol = client.db(DB_NAME).collection(COL_NAME_USER);

      const res1 = await userCol.updateOne(
        { id: ObjectId(followerID) },
        { $pull: { follows: ObjectId(followeeID) } }
      );
      console.log("Updated", res1);
      const res2 = await userCol.updateOne(
        { id: ObjectId(followeeID) },
        { $inc: { numFollowers: -1 } }
      );
      console.log("Updated", res2);
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  return myDB;
}

module.exports = UserDB();
