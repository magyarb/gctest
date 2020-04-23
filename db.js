const mongoose = require("mongoose");

const dbo = {
  connected: false,
  db: null,
  models: {},
};

dbo.wait = async function (num = 0) {
  return new Promise(function (resolve, reject) {
    if (dbo.connected) {
      resolve();
    } else {
      setTimeout(function () {
        console.log("waiting for db, " + num);
        if (dbo.connected) {
          resolve();
        } else {
          //db timeout
          if (num > 30) process.exit(1);
          resolve(dbo.wait(num + 1));
        }
      }, 1000);
    }
  });
};

dbo.init = async function () {
  try {
    //console.log("connecting to", process.env.dbUrl + "/" + process.env.dbName);
    mongoose.connect(process.env.dbUrl + "/" + process.env.dbName, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    //mongoose.set('debug', true);
    dbo.db = mongoose.connection;
    dbo.db.on("error", console.error.bind(console, "connection error:"));
    dbo.db.once("open", async function () {
      mongoose.set("useFindAndModify", false);
      console.log("db conn ok.");
      await initSchemas();
      dbo.connected = true;
    });
  } catch (ex) {
    console.log(ex);
  }
}

async function initSchemas() {
  var logSchema = new mongoose.Schema(
    {
      text: String
    },
    { timestamps: true }
  );

  dbo.models.Log = mongoose.model("Log", logSchema);
}

dbo.uuid = function () {
  return uuidv4();
};

module.exports = dbo;
