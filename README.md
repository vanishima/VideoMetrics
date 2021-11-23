# VideoMetrics

A video KPI management based on Node + Express + MongodDB + EJS

## Screenshots

![Video List](https://github.com/christinaxu128/CS5200-Project-Video-Metrics/blob/main/diagrams/Videos.png?raw=true)
![Video Details](https://github.com/christinaxu128/CS5200-Project-Video-Metrics/blob/main/diagrams/VideoDetails.png?raw=true)
![Users & Followers](https://github.com/christinaxu128/CS5200-Project-Video-Metrics/blob/main/diagrams/Users.png?raw=true)

## Installation

1. Clone the repository
2. `npm install`
3. `npm start`

## Business Requirements & Rules

A real-time and user-friendly application for tracking the performance of online videos is the key to success for content creators. In this project, we will use UML Diagrams and Entity-Relationship Diagrams to model a database and implement it with SQLite, Node, and Express.

This application will keep track of metadata of videos, for example, number of views, comments and followers on a daily basis, to visualize the progression of changes over a period of time. With this application, a content creator would be able to track the performance of her videos on a video platform. For the purpose of this project, we limit the platform to only Bilibili, a Chinese video sharing website. For videos on Bilibili, the metadata the application will collect views, comments, and likes for each video, and aggregate them every day. The visualization the application provides will show the growth of these key metrics for each video over time, which would be extremely helpful data points for content creators. In order to know what kind of videos are more popular, she would need to record the length, title, and type of each video. There are many comparisons that she wants to make, and one of them is the average views of different types of videos.

In addition to the number of comments under a video, she would also take time to examine the content of those comments and users who leave those comments. She would like to fetch all the comments for a specific video to know what the audience likes or dislikes about it. She also thinks it is a good idea to search for all the comments from particular users to find core followers and distinguish content that interests core followers and the general audience respectively.

A content creator also cares about videos that are clicked or commented most each day to learn about the watching styles of her followers or the current trend.

A list of possible nouns are:

- Videos
- VideoMetrics
- Creator
- Comments
- Users
- Followers
- VideoType
- Views
- Likes
- Favorites
- Day

A list of possible verbs are:

- Create
- View
- Click on
- Comment on
- Follow
- Like

The business rules for this database are:

- Metrics cannot be created without the corresponding video instance
- Comments cannot be created without the corresponding video and user instance
- A video can only be of one video type
- A video can have no metrics (assuming it has just been uploaded)
- A follower can leave no comments
- A video must have a creator, but may not have any viewers or commenters.

## Conceptual Data Model - UML Diagram

![UML](https://github.com/vanishima/VideoMetrics/blob/main/data-model/Video%20Metrics%20UML%20new.png?raw=true)

## Logical Data Model - ERD

![ERD](https://github.com/vanishima/VideoMetrics/blob/main/data-model/Video%20Metrics%20ERD%20Mongo%20new.png?raw=true)

## Definitions of Documents as JSON objects

![JSON](https://github.com/vanishima/VideoMetrics/blob/main/data-model/Document%20Definitions.png?raw=true)


