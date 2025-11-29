const pino = require("pino");
const fs = require("fs");

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

module.exports = pino(
  {
    level: "info",
  },
  pino.multistream(streams)
);

