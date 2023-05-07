const API_VERSION = 'v3'
const fs = require('fs').promises
const path = require('path')
const process = require('process')
const { google } = require('googleapis')
const { authenticate } = require('@google-cloud/local-auth')

module.exports = class AuthUtil {

    static #SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
    static #TOKEN_PATH = path.join(process.cwd(), 'oauth/token.json')
    static #CREDENTIALS_PATH = path.join(process.cwd(), 'oauth/credentials.json')

    /**
* Reads previously authorized credentials from the save file.
*
* @return {Promise<OAuth2Client|null>}
*/
    static async #loadSavedCredentialsIfExist() {
        try {
            const content = await fs.readFile(this.#TOKEN_PATH)
            const credentials = JSON.parse(content)
            return google.auth.fromJSON(credentials)
        } catch (err) {
            console.warn(err)
            return null
        }
    }

    /**
     * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
     *
     * @param {OAuth2Client} client
     * @return {Promise<void>}
     */
    static async #saveCredentials(client) {
        const content = await fs.readFile(this.#CREDENTIALS_PATH)
        const keys = JSON.parse(content)
        const key = keys.installed || keys.web
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        })
        await fs.writeFile(this.#TOKEN_PATH, payload)
    }

    static async authorize() {
        let client = await AuthUtil.#loadSavedCredentialsIfExist()
        if (client) {
            return client
        }
        client = await authenticate({
            scopes: this.#SCOPES,
            keyfilePath: this.#CREDENTIALS_PATH,
        })
        if (client.credentials) {
            await AuthUtil.#saveCredentials(client)
        }
        return client
    }
}