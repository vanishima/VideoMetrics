const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

function VideoDB() {
  const myDB = {};
  const DB_NAME = "videometrics";
  const uri = process.env.MONGO_URI;
  const COL_NAME_VIDEO = "Video";

  myDB.getVideos = async (query = {}, orderCol = {}, limit = 20) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    console.log("Connecting to the db");

    try {
      await client.connect();
      console.log("Connected");

      const col = client.db(DB_NAME).collection(COL_NAME_VIDEO);
      console.log(
        `Collection ready, query:${query}, orderCol: ${orderCol}, limit: ${limit}`
      );

      const result = await col
        .find(query)
        .sort(orderCol)
        .limit(limit)
        .toArray();

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
      console.log("ready to query with", videoID);
      const result = await col
        .aggregate([
          {
            $match: {
              id: ObjectId(videoID),
            },
          },
          {
            $lookup: {
              from: "Comment",
              localField: "id",
              foreignField: "video_id",
              as: "comments",
            },
          },
          {
            $unwind: {
              path: "$comments",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "User",
              localField: "comments.user_id",
              foreignField: "id",
              as: "comments.user",
            },
          },
          {
            $unwind: {
              path: "$comments.user",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: "$_id",
              id: {
                $first: "$id",
              },
              title: {
                $first: "$title",
              },
              length: {
                $first: "$length",
              },
              created_time: {
                $first: "$created_time",
              },
              user_id: {
                $first: "$user_id",
              },
              type: {
                $first: "$type",
              },
              metrics: {
                $first: "$metrics",
              },
              comments: {
                $push: "$comments",
              },
            },
          },
        ])
        .toArray();

      console.log("result:", result);

      return result[0];
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.updateVideoByID = async (video) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
      await client.connect();

      const VideosCol = client.db(DB_NAME).collection(COL_NAME_VIDEO);

      const res = await VideosCol.updateOne(
        { _id: ObjectId(video._id) },
        {
          $set: {
            title: video.title,
            type: video.type,
            length: video.length,
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

  myDB.deleteVideoByID = async (videoID) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
      await client.connect();

      const col = client.db(DB_NAME).collection(COL_NAME_VIDEO);

      console.log("ready to delete video", videoID);
      const video = await col.deleteOne({ id: ObjectId(videoID) });

      console.log("Deleted video", video);

      return video;
    } finally {
      console.log("Closing the connection");
      client.close();
    }
  };

  myDB.createOne = async (video) => {
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
      await client.connect();

      const col = client.db(DB_NAME).collection(COL_NAME_VIDEO);
      video.id = new ObjectId();
      video.length = +video.length;
      video.user_id = ObjectId(video.user_id);
      video.created_time = new Date();
      video.metrics = [
        {
          views: 0,
          likes: 0,
          comments: 0,
          created_time: new Date(),
        },
      ];

      console.log("Ready to insert", video);
      const res = await col.insertOne(video);
      console.log("Inserted", res);

      return res;
    } finally {
      // console.log("Closing the connection");
      client.close();
    }
  };

  return myDB;
}

module.exports = VideoDB();
