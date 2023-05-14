
const Calendar = require("./calendar/Calendar")
const DateUtil = require("./util/DateUtil")
const JiraIntegration = require("./JiraIntegration")
const Confirm = require('prompt-confirm')
const ValidatorUtil = require("./util/ValidatorUtil")

async function run() {

    const jiraHost = process.argv[2]
    if (!ValidatorUtil.isHost(jiraHost)) {
        console.error("Host parameter is not a valid host")
        return
    }

    const jiraIntegration = new JiraIntegration(jiraHost, new Calendar())

    const command = await getOperation()

    console.log("Selected operation: " + command)

    let startDate = getStartDate(command)
    let endDate = getEndDate(command)

    console.log("Extracting work logs from Google Calendar...")
    const workLogs = await jiraIntegration.getWorkLogsFromUntil(startDate, endDate)
    if (workLogs == undefined || workLogs.workLogs == undefined || workLogs.workLogs.length== 0){
        console.log("No work log found for the selected period")
        return
    }

    console.log(workLogs)
    const prompt = new Confirm('Do you want to send them all to JIRA?')

    prompt.run()
        .then(function (answer) {
            if (answer == true) {
                console.log("sending work logs via JIRA API...")
                workLogs.workLogs.forEach(async workLog => {
                    if (workLog.ticketId != undefined)
                        jiraIntegration.sendWorkLog(workLog)
                })
            }
        })
}

async function getOperation(){
    return process.argv[3]

}

function getStartDate(command) {

    if (command == "today") {
        return DateUtil.getTodayStartTime()
    }

    else if (command == "yesterday") {
        return DateUtil.getYesterdayStartTime()
    }

    else {
        const startDateString = process.argv[3]
        return new Date(startDateString)

    }


}

function getEndDate(command) {

    if (command == "today") {
        return DateUtil.getTodayEndTime()
    }

    else if (command == "yesterday") {
        return DateUtil.getYesterdayEndTime()
    }

    else {
        const endDateString = process.argv[4]
        return new Date(endDateString)
    }

}


run()