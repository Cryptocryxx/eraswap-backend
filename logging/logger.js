import pino from "pino";
//import fs from "fs";

const streams = [
  {
    level: "debug", // log everything
    prettyPrint: true,
    // stream: fs.createWriteStream("./logging/app.log", { flags: "a" }),
    stream: process.stdout,
  },
  {
    level: "error", // log error and above
    //stream: fs.createWriteStream("./logging/error.log", { flags: "a" }),
    stream: process.stderr,
  },
];

const logger = pino(
  {
    level: "info",
  },
  pino.multistream(streams)
);

export default logger;
