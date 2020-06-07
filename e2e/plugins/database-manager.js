const { MongoClient } = require('mongodb')


/**
 * e2e test database manager class
 */
class DatabaseManager {

    /**
     * @private
     */
    constructor(db) {
        this.db = db
    }

    /**
     * @param {string} mongodbUrl
     * @returns {Promise<DatabaseManager>}
     */
    static async connect(mongodbUrl) {
        const client = await MongoClient.connect(mongodbUrl)
        return new this(client.db())
    }

    /**
     * @returns {Promise<void>}
     */
    async clear() {
        const collections = await this.db.collections()
        await Promise.all(
            collections.map(async (collection) => {
                await collection.deleteMany({})
            }),
        )
    }

    /**
     * @typedef {Object} UserData
     * @property {string} name
     * @property {string} email
     * @property {string} password
     * @property {boolean} isEmailAddressConfirmed
     * @property {string} createdAt
     *
     * @param {UserData} userData
     * @returns {Promise<void>}
     */
    async populateWithUser(userData) {
        await this.db.collection('users').insertOne(userData)
    }

}

module.exports = {
    DatabaseManager,
}
