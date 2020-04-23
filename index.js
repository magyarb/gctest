//running locally
if (!process.env.PORT) {
  require("dotenv").config();
  console.log("loaded dotenv");
}
const Koa = require("koa");
const Router = require("koa-router");
const app = new Koa();
const server = require("http").createServer(app.callback());
const router = new Router();
const api = require("./api");
const cors = require("@koa/cors");
var bodyParser = require("koa-bodyparser");
const dbo = require("./db");

app.use(cors());
app.use(bodyParser());

// logger

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get("X-Response-Time");
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set("X-Response-Time", `${ms}ms`);
});

//error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit("error", err, ctx);
  }
});

//serve api
router.use("/api/", api.routes(), api.allowedMethods());

router.get("*", async (ctx, next) => {
  ctx.body = ctx.path + ": route does not exist.";
});

app.use(router.routes()).use(router.allowedMethods());

async function start() {
  console.log('starting')
  console.log('version', process.env.npm_package_version)
  console.log('deployment', process.env.K_REVISION)
  console.log('rtenv', process.env.RTENV)
  
  //if running in cloud, get secrets
  const name = process.env.RTENV;
  const {
    SecretManagerServiceClient,
  } = require("@google-cloud/secret-manager");
  const client = new SecretManagerServiceClient();
  try {
    const [secret] = await client.accessSecretVersion({
      name: name,
    });
    var genv = JSON.parse(secret.payload.data.toString('utf8'))
    for(envkey of Object.keys(genv)){
      process.env[envkey] = genv[envkey]
    }

  } catch (ex) {
    console.log("cannot access secret", name);
    console.log(ex);
  }

  // init then wait for the db
  dbo.init()
  await dbo.wait();

  //start
  var port = process.env.PORT || 3069;
  server.listen(port);
  console.log("server started", port);
}
start();
