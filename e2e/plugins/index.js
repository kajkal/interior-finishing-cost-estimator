/// <reference types="cypress" />

const { DatabaseManager } = require('./database-manager')


/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    on('task', {
        'clear:db': async () => {
            const db = await DatabaseManager.connect(config.env.mongodbUrl)
            await db.clear()
            return null
        },
        'seed:db': async (data) => {
            const db = await DatabaseManager.connect(config.env.mongodbUrl)
            await db.populateWithUser(data)
            return null
        },
    })
}
