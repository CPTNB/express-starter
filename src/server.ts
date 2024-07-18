import cors from "cors";
import express from "express";
import { register } from "./api/generated";
import hello from "./services/hello";
import imdb from "./services/imdb";

const PORT = process.env.PORT ?? 8080;

const app = express();

//enable cors
app.use(cors());

register(app, {
  imdb,
  hello
});

app.listen(PORT);
console.log(`🎉 Listening on port ${PORT}...`);
