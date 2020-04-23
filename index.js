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
  //if running in cloud, get secrets
  //const name = 'projects/229996663812/secrets' + process.env.BRANCH;
  process.env.lofasz = 'ittlofasz';
  console.log('logging ENV')
  console.log(process.env)
  console.log('end ENV')

  const name = "projects/229996663812/secrets/master/versions/1";
  const {
    SecretManagerServiceClient,
  } = require("@google-cloud/secret-manager");
  const client = new SecretManagerServiceClient();
  try {
    const [secret] = await client.accessSecretVersion({
      name: name,
    });
    console.log(secret.payload.data.toString('utf8'));
  } catch (ex) {
    console.log("cannot access secret", name);
    console.log(ex);
  }

  // wait for the db
  //await dbo.wait();

  //start
  var port = process.env.PORT || 3069;
  server.listen(port);
  console.log("server started", port);
}
start();
