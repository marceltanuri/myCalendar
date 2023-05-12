const API_VERSION = 'v3'
const fs = require('fs')
const path = require('path')
const process = require('process')
const { google } = require('googleapis')
const Fuse = require('fuse.js')
const AuthUtil = require('./AuthUtil')


module.exports = class Calendar {

    #CONFIG_PATH = path.join(process.cwd(), 'config/config.json')
    #config = JSON.parse(fs.readFileSync(this.#CONFIG_PATH))

    async getEvents(params) {

        const defaultParams = {
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0).toISOString(),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59).toISOString(),
            maxResults: 1000,
            calendarId: "primary"
        }

        if (params == undefined)
            params = defaultParams

        return await AuthUtil.authorize().then(async (auth) => {
            const calendar = google.calendar({ version: API_VERSION, auth })

            const res = await calendar.events.list({
                calendarId: params.calendarId != undefined ? params.calendarId : defaultParams.calendarId,
                timeMin: params.startDate != undefined ? params.startDate : defaultParams.startDate,
                timeMax: params.endDate != undefined ? params.endDate : defaultParams.endDate,
                maxResults: !isNaN(params.maxResults) ? params.maxResults : defaultParams.maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            })

            const events = res.data.items
            return events
        }).catch(console.error)
    }


    async getEventsWithJiraTickets(params) {

        const defaultParams = {
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0).toISOString(),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59).toISOString(),
            maxResults: 1000,
            calendarId: "primary"
        }

        if (params == undefined)
            params = defaultParams

        return await AuthUtil.authorize().then(async (auth) => {
            const calendar = google.calendar({ version: API_VERSION, auth })

            const res = await calendar.events.list({
                calendarId: params.calendarId != undefined ? params.calendarId : defaultParams.calendarId,
                timeMin: params.startDate != undefined ? params.startDate : defaultParams.startDate,
                timeMax: params.endDate != undefined ? params.endDate : defaultParams.endDate,
                maxResults: !isNaN(params.maxResults) ? params.maxResults : defaultParams.maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            })

            const events = res.data.items

            for (let event of events) {
                await this.#setJiraTicketAttributeIfExists(event)
            }

            return events
        }).catch(console.error)
    }

    async getTodayEventsWithJiraTickets() {
        let todaysEvents = await this.getEvents({
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0).toISOString(),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59).toISOString(),
            maxResults: 1000,
            calendarId: "primary"
        })

        for (let event of todaysEvents) {
            await this.#setJiraTicketAttributeIfExists(event)
        }

        return todaysEvents

    }

    async #setJiraTicketAttributeIfExists(event) {
        const searchResult = new Fuse(this.#config.mappings, {
            keys: ['regex'],
            ignoreLocation: true,
            threshold: 0.8
        }).search(event.summary)

        if (searchResult.length > 0) {
            event["jiraTicket"] = searchResult[0].item.jiraTicket
        }
        return await event
    }
}