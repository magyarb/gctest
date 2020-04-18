const Router = require("koa-router");
const router = new Router();
const dbo = require("./db");

router.get("asd", (ctx, next) => {
  ctx.body = "asd!";
});


module.exports = router