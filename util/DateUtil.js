module.exports = class DateUtil {

    static getTodayEndTime() {
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

    static getYesterdayEndTime() {
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

    static getYesterdayStartTime() {
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

    static getTodayStartTime() {
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

}