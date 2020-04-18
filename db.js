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

async function init() {
  try {
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

init();

async function initSchemas() {
  var userSchema = new mongoose.Schema(
    {
      username: { type: String, required: true },
      email: { type: String },
      FamilyName: { type: String },
      GivenName: { type: String },
      picture: { type: String },
      gid: { type: Number },
      locale: { type: String },
      password: { type: String },
      pin: Number,
      createdBy: { type: String, default: dbo.location },
      modifiedBy: { type: String, default: dbo.location },

      createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      pub: { type: mongoose.Schema.Types.ObjectId, ref: "Pub" },
    },
    { timestamps: true }
  );

  dbo.models.User = mongoose.model("User", userSchema);
}

dbo.uuid = function () {
  return uuidv4();
};

module.exports = dbo;
