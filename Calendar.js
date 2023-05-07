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

    async getTodayEvents() {
        return await AuthUtil.authorize().then(async (auth) => {
            const calendar = google.calendar({ version: API_VERSION, auth })
            const todayBeginOfTheDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0).toISOString()
            const todayEndOfTheDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59).toISOString()

            const res = await calendar.events.list({
                calendarId: 'primary',
                timeMin: todayBeginOfTheDay,
                timeMax: todayEndOfTheDay,
                maxResults: 1000,
                singleEvents: true,
                orderBy: 'startTime',
            })

            const events = res.data.items
            return events
        }).catch(console.error)
    }

    async getTodayEventsWithJiraTickets() {
        let todaysEvents = await this.getTodayEvents()

        todaysEvents.forEach(event => {
            const searchResult = new Fuse(this.#config.mappings, {
                keys: ['regex'],
                ignoreLocation: true,
                threshold: 0.6
            }).search(event.summary)
    
            if (searchResult.length > 0) {
                event["jiraTicket"] = searchResult[0].item.jiraTicket
            }
        })

        return todaysEvents

    }
}

async function findTodaysEventsWithJiraTickets(auth) {
    const calendar = google.calendar({ version: API_VERSION, auth })
    const todayBeginOfTheDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0).toISOString()
    const todayEndOfTheDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59).toISOString()

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: todayBeginOfTheDay,
        timeMax: todayEndOfTheDay,
        maxResults: 1000,
        singleEvents: true,
        orderBy: 'startTime',
    })

    const events = res.data.items

    if (!events || events.length === 0) {
        console.log('No events found for today.')
        return
    }

    events.forEach(event => {
        const searchResult = new Fuse(config.mappings, {
            keys: ['regex'],
            ignoreLocation: true,
            threshold: 0.6
        }).search(event.summary)

        if (searchResult.length > 0) {
            event["jiraTicket"] = searchResult[0].item.jiraTicket
            //let eventWithJiraTicket = searchResult[0].item
            //events.find(event => event.id == eventWithJiraTicket.id)["jiraTicket"] = mapping.jiraTicket
        }
    })

    // config.mappings.forEach(mapping => {
    //     mapping.regex.forEach(reg => {
    //         const searchResult = new Fuse(events, {
    //             keys: ['summary'],
    //             ignoreLocation: true,
    //             threshold: 0.6
    //         }).search(reg)

    //         if (searchResult.length > 0) {
    //             let eventWithJiraTicket = searchResult[0].item
    //             events.find(event => event.id == eventWithJiraTicket.id)["jiraTicket"] = mapping.jiraTicket
    //         }


    //     })
    // })

    return events
}