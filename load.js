// import mongo data into redis
const VideoDB = require("./db/VideoDB");
const redisVideoDB = require("./db/redisVideoDB");
const { createClient } = require("redis");

// Populate Videos in Redis with MongoDB
async function populateVideos(){
  let client;

  try {
    client = createClient();
    client.on("error", (err) => console.log("Redis Client Error", err));
    await client.connect();

    const videos = await VideoDB.getVideos({},{},0);

    console.log(`Got ${videos.length} videos`);

    // video related info
    for (let video of videos){
      // create hash key eg. video:123
      const preffix = `video:${video.id}`;
      await client.hSet(preffix, {
        id: `${video.id}`,
        title: video.title,
        length: `${video.length}`,
        created_time: `${video.created_time}`,
        type: `${video.type}`,
        user_id: `${video.user_id}`,
      });

      if (video.metrics.length > 1){
        const mPreffix = `video:${video.id}:metrics`;
        await client.hSet(mPreffix, {
          likes: `${video.metrics[0].likes}`,
          views: video.metrics[0].views,
          comments: `${video.metrics[0].comments}`,
          updated_time: `${video.created_time}`,
        });
      }
    }

  } finally {
    await client.quit();
  }
}

// populateVideos();

async function test(){
  const video = await redisVideoDB.getVideoByID("619d624cf6a0af305d000d3a");
  const metrics = await redisVideoDB.getMetricsByID("619d624cf6a0af305d000d3a");
  console.log("Test getVideoByID", video);
  console.log("Test getMetricsByID", metrics);
}

test();
