const express = require('express')
const app = express()
const router = express.Router()
const bodyParser = require('body-parser')
const Calendar = require("./Calendar")

module.exports = async function start(port) {

  const jsonParser = bodyParser.json()
  const calendar = new Calendar()


  router.get('/getEvents', jsonParser, async function (req, res) {
    res.send(await calendar.getEvents(req.body))
  })

  router.get('/getTodaysEvents', async function (req, res) {

    res.send(await calendar.getEvents({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59),
      maxResults: 1000,
      calendarId: "primary"
    }))

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


