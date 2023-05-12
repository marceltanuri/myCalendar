const Calendar = require("./Calendar")
const fetch = require('node-fetch');


module.exports = class JiraIntegration {

    constructor(jiraHost, calendar) {
        this.jiraHost = jiraHost

        if (calendar instanceof Calendar)
            this.calendar = calendar
    }

    async #convertFromCalendarEventToWorkLogObject(events) {

        let workLogs = {
            workLogs: [],
            totalSpentTimeInHours: 0
        }

        events.forEach(event => {

            let workLogTitle = event.summary
            if (event.description != undefined && event.description.length > 2 && event.description.length <= 100) {
                workLogTitle += (" - " + event.description)
            }


            const timeSpentInHour = this.#calculateSpentTimeInHour(event.start.dateTime, event.end.dateTime)
            workLogs.totalSpentTimeInHours += parseFloat(timeSpentInHour)

            const startDate = event.start.dateTime != undefined ? new Date(event.start.dateTime) : new Date(event.start.date)

            const workLogObject = {
                ticketId: event.jiraTicket,
                comment: workLogTitle,
                started: startDate.toISOString().replace("Z", "+0000"),
                timeSpent: timeSpentInHour + "h"
            }

            workLogs.workLogs.push(workLogObject)
        })

        return workLogs

    }

    async getTodaysWorkLogs() {
        const todayEventsWithJiraTickets = await this.calendar.getTodayEventsWithJiraTickets()

        let todaysWorkLogs = this.#convertFromCalendarEventToWorkLogObject(todayEventsWithJiraTickets)

        return todaysWorkLogs
    }

    async getWorkLogsFromUntil(startDate, endDate) {
        const eventsWithJiraTickets = await this.calendar.getEventsWithJiraTickets({ "startDate": new Date(startDate).toISOString(), "endDate": new Date(endDate).toISOString() })
        let workLogs = this.#convertFromCalendarEventToWorkLogObject(eventsWithJiraTickets)
        return workLogs
    }

    sendWorkLog(workLog) {


        console.log(`${this.jiraHost}/rest/api/2/issue/${workLog.ticketId}/worklog`)
        fetch(`${this.jiraHost}/rest/api/2/issue/${workLog.ticketId}/worklog`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workLog)
        })
            .then(response => {
                console.log(
                    `Response: ${response.status} ${response.statusText}`
                );
                return response.text();
            })
            .then(text => console.log(text))
            .catch(err => console.error(err));
    }

    #calculateSpentTimeInHour(startTime, endTime) {
        if (startTime == undefined ?? endTime == undefined) {
            return "0"
        }

        const spentTimeInHours = (new Date(endTime) - (new Date(startTime))) / 1000 / 60 / 60

        return spentTimeInHours
    }


}