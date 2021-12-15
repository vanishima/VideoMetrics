const { createClient } = require("redis");
const { ObjectId } = require("mongodb");

function RedisUserDB() {
  const myDB = {};

  myDB.deleteUserByID = async (userID) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();

      console.log(`Deleting user:${userID}`);
      let deleted = await client.del(`user:${userID}`);

      if (deleted == 1) {
        console.log(`Deleted user:${userID}`);
      }
      await client.zRem("user_rank", userID);
      return deleted == 1;
    } finally {
      await client.quit();
    }
  };

  const getUniqueIntFromObjectId = function (object_id) {
    var res = null;
    object_id = object_id.toString();
    var firstObjectId = "5661728913124370191fa3f8";
    var delta =
      parseInt(object_id.substring(0, 8), 16) -
      parseInt(firstObjectId.substring(0, 8), 16);
    res =
      delta.toString() + parseInt(object_id.substring(18, 24), 16).toString();
    return parseInt(res, 10);
  };

  const createWithClient = async (client, userData) => {
    console.log(`Creating user in Redis: ${JSON.stringify(userData)}`);
    if (userData.id == undefined) {
      return;
    }
    await client.hSet(`user:${userData.id.toString()}`, {
      name: userData.name,
      id: userData.id.toString(),
    });
    console.log(`Get rank ${getUniqueIntFromObjectId(userData.id)}`);
    await client.zAdd("user_rank", {
      score: getUniqueIntFromObjectId(userData.id),
      value: userData.id.toString(),
    });
    if (userData.numFollowers != null) {
      await client.zAdd("followed_rank", {
        score: userData.numFollowers,
        value: userData.id.toString(),
      });
    }
  };

  myDB.createOne = async (userData) => {
    let client;

    try {
      client = createClient();
      client.zAdd;
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();
      await createWithClient(client, userData);
    } finally {
      await client.quit();
    }
  };

  myDB.populated = false;
  myDB.populateOnce = async (userDB, num) => {
    if (!myDB.populated) {
      let client;
      let users = await userDB.sampleUsers(num);
      let mostFollowedUsers = await userDB.mostFollowedUsers(num);
      let promises = [];
      try {
        client = createClient();
        client.on("error", (err) => console.log("Redis Client Error", err));
        await client.connect();
        for (const user of users) {
          promises.push(createWithClient(client, user));
        }
        for (const user of mostFollowedUsers) {
          console.log(`Adding followed_rank for ${JSON.stringify(user)}`);
          promises.push(createWithClient(client, user));
        }
        await Promise.all(promises);
        myDB.populated = true;
      } finally {
        await client.quit();
      }
    }
  };

  myDB.updateFollowersCount = async (followeeID, desc) => {
    let client;

    try {
      client = createClient();
      client.zAdd;
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();
      console.log(
        `${desc ? "Descreasing" : "Increasing"} followed_rank for ${followeeID}`
      );
      await client.zIncrBy("followed_rank", desc ? -1 : 1, followeeID);
    } finally {
      await client.quit();
    }
  };

  const getUserWithClient = async (client, userID) => {
    return {
      id: ObjectId(await client.hGet(`user:${userID}`, "id")),
      name: await client.hGet(`user:${userID}`, "name"),
      numFollowers: await client.zScore("followed_rank", userID),
    };
  };

  myDB.sampleUsers = async (num) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();
      let userIds = await client.zRange("user_rank", 0, num - 1, {
        REV: true,
      });
      let promises = [];
      for (const userId of userIds) {
        promises.push(getUserWithClient(client, userId));
      }
      return await Promise.all(promises);
    } finally {
      await client.quit();
    }
  };

  myDB.mostFollowedUsers = async (num) => {
    let client;

    try {
      client = createClient();
      client.on("error", (err) => console.log("Redis Client Error", err));
      await client.connect();
      let userIds = await client.zRange("followed_rank", 0, num - 1, {
        REV: true,
      });
      let promises = [];
      for (const userId of userIds) {
        promises.push(getUserWithClient(client, userId));
      }
      return await Promise.all(promises);
    } finally {
      await client.quit();
    }
  };

  return myDB;
}

module.exports = RedisUserDB();
