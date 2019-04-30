const { MongoClient } = require("mongodb")

// const connect = require('connect-mongo')

// module.exports = function (session) {
//     const MongoStore = connect(session)

//     return new MongoStore({
//         url: process.env.DB_URL
//     })
// }

module.exports = async function() {
	const client = await MongoClient.connect(process.env.DB_URL, {
		useNewUrlParser: true
	})

	return client.db(process.env.DB_NAME)
}
