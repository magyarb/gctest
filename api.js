const Router = require("koa-router");
const router = new Router();
const dbo = require("./db");

router.get("asd", (ctx, next) => {
  var log = new dbo.models.Log({
    text: "Hello!",
  });

  log.save();

  console.log(ctx);

  ctx.body = "log saved";
});

router.get("task", async (ctx, next) => {
  const { CloudTasksClient } = require("@google-cloud/tasks");

  // Instantiates a client.
  const client = new CloudTasksClient();

  // TODO(developer): Uncomment these lines and replace with your values.
  const project = "crtst-273418";
  const queue = "my-queue";
  const location = "europe-west4";
  const url = "https://gctst-nzk3w4wvsa-ez.a.run.app/api/asd";
  const serviceAccountEmail =
    "229996663812-compute@developer.gserviceaccount.com";
  const payload = null;
  const insec = null

  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue);

  const task = {
    httpRequest: {
      httpMethod: "GET",
      url,
      oidcToken: {
        serviceAccountEmail,
      },
    },
  };

  if (payload) {
    task.httpRequest.body = Buffer.from(payload).toString("base64");
  }

  if (inSeconds) {
    // The time when the task is scheduled to be attempted.
    task.scheduleTime = {
      seconds: inSeconds + Date.now() / 1000,
    };
  }

  console.log("Sending task:");
  console.log(task);
  // Send create task request.
  const request = { parent, task };
  const [response] = await client.createTask(request);
  const name = response.name;

  console.log(`Created task ${name}`);

  ctx.body = "task queued";
});

module.exports = router;
