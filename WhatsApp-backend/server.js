//imports
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher"; // to make our mongodb realtime.

//app configs
const app = express(); //creating app and writing api routes
const port = process.env.PORT || 9000; //port

const pusher = new Pusher({
  appId: "1182332",
  key: "b9fea509874c79644820",
  secret: "2c005d3e40a81b6cd181",
  cluster: "ap2",
  useTLS: true,
});

//middleware
app.use(express.json());

//DB config
const connectionURL =
  "mongodb+srv://admin:7HLc5MyoDog6HE7b@cluster0.4jlw3.mongodb.net/whatsappdb?retryWrites=true&w=majority";
mongoose.connect(connectionURL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("dB is connected!");

  const messageCollection = db.collection("messagecontents");
  const changeStream = messageCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.user,
        message: messageDetails.message,
      });
    } else {
      console.log("An error in pusher occured occured");
    }
  });
});

//Api routes
app.get("/", (req, res) => res.status(200).send("Hello World")); //downloading data from the base url. response status is 200's(ok)
//creating api routes to post messages to the db

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", async (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send("Some error");
    } else {
      res.status(201).send(data);
    }
  });
});

//listener
app.listen(port, () => console.log(`Listening on localhost:${port}`));
