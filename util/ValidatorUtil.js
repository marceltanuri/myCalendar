module.exports = class ValidatorUtil {

    static isHost(host) {
        const regex = /^https?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/
        return host.match(regex) != null
    }


}