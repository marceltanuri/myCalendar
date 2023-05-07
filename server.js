const express = require('express');
const app = express();
const router = express.Router();
const Calendar = require("./Calendar")

module.exports = async function start(port) {

  const calendar = new Calendar()

  router.get('/getTodaysEvents', async function (req, res) {

    res.send(await calendar.getTodayEvents())

  })

  router.get('/getTodaysEventsWithJiraTickets', async function (req, res) {

    res.send(await calendar.getTodayEventsWithJiraTickets())

  })

  app.use('/', router);

  if (port == undefined || isNaN(port))
    port = 3002

  app.listen(process.env.port || port);

  console.log(`Running at Port ${port}`);

}


