
const Calendar = require("./Calendar")
const JiraIntegration = require("./JiraIntegration")
const Confirm = require('prompt-confirm')


async function run() {

    const jiraHost = process.argv[2]

    const jiraIntegration = new JiraIntegration(jiraHost, new Calendar())

    let startDate = null
    let endDate = null

    const command = process.argv[3]

    if (command == "today") {
        startDate = getTodayStartTime()
        endDate = getTodayEndTime()
    }

    else if (command == "yesterday") {
        startDate = getYesterdayStartTime()
        endDate = getYesterdayEndTime()
    }

    else {
        const startDateString = process.argv[3]
        startDate = new Date(startDateString)

        const endDateString = process.argv[4]
        endDate = new Date(endDateString)
    }

    const workLogs = await jiraIntegration.getWorkLogsFromUntil(startDate, endDate)
    console.log(workLogs)
    const prompt = new Confirm('Do you want to send them all to JIRA?')
    prompt.run()
        .then(function (answer) {
            if (answer == true) {
                console.log("sending worklogs via JIRA API...")
                workLogs.workLogs.forEach(async workLog => {
                    if (workLog.ticketId != undefined)
                        jiraIntegration.sendWorkLog(workLog)
                })
            }
        })
}

function getTodayStartTime() {
    let startDate = new Date()
    const startTime = process.argv[4]

    if (startTime != undefined) {
        startDate.setHours(startTime.split(":")[0])
        startDate.setMinutes(startTime.split(":")[1])
        startDate.setSeconds(0)
        startDate.setMilliseconds(0)
    }
    else {
        startDate.setHours(0)
        startDate.setMinutes(0)
        startDate.setSeconds(0)
        startDate.setMilliseconds(0)
    }
    return startDate
}

function getYesterdayStartTime() {
    let yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const startTime = process.argv[4]

    if (startTime != undefined) {
        yesterdayDate.setHours(startTime.split(":")[0])
        yesterdayDate.setMinutes(startTime.split(":")[1])
        yesterdayDate.setSeconds(0)
        yesterdayDate.setMilliseconds(0)
    }
    else {
        yesterdayDate.setHours(0)
        yesterdayDate.setMinutes(0)
        yesterdayDate.setSeconds(0)
        yesterdayDate.setMilliseconds(0)
    }
    return yesterdayDate
}

function getYesterdayEndTime() {
    let yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const startTime = process.argv[5]

    if (startTime != undefined) {
        yesterdayDate.setHours(startTime.split(":")[0])
        yesterdayDate.setMinutes(startTime.split(":")[1])
        yesterdayDate.setSeconds(59)
        yesterdayDate.setMilliseconds(999)
    }
    else {
        yesterdayDate.setHours(23)
        yesterdayDate.setMinutes(59)
        yesterdayDate.setSeconds(59)
        yesterdayDate.setMilliseconds(999)
    }
    return yesterdayDate
}

function getTodayEndTime() {
    let startDate = new Date()
    const startTime = process.argv[5]

    if (startTime != undefined) {
        startDate.setHours(startTime.split(":")[0])
        startDate.setMinutes(startTime.split(":")[1])
        startDate.setSeconds(59)
        startDate.setMilliseconds(999)
    }
    else {
        startDate.setHours(23)
        startDate.setMinutes(59)
        startDate.setSeconds(59)
        startDate.setMilliseconds(999)
    }
    return startDate
}

run()