const Router = require("koa-router");
const router = new Router();
const dbo = require("./db");

router.get("asd", (ctx, next) => {
  var log = new dbo.models.Log({
    text: 'Hello!'
  });

  log.save();

  console.log(ctx);

  ctx.body = "log saved";
});


module.exports = router