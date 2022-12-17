require('dotenv').config()
import http from 'http'
import path from 'path'
import express from 'express'
import cors from 'cors'
import mysql from 'mysql'
import socket from 'socket.io'
import routes from './routes'
import database from './database'
import handle_socket from './socket'


const { DB_USER, DB_PASSWORD, DB_HOST } = process.env

const conn = mysql.createConnection({
	user: DB_USER,
	password: DB_PASSWORD,
	host: DB_HOST
})

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/api', routes)

app.use(express.static(path.resolve('assets')))


let server = http.createServer(app)
let io = socket(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
})


conn.connect(err => {
	if (err) return console.log(err)
	console.log('database connected')
	database()
	handle_socket(io)
})

export async function query (sql) {
	return new Promise((resolve, reject) => {
		if (!sql.endsWith(';')) sql = sql + ';'
		conn.query(sql, (err, result) => {
			if (err) reject(err)
			resolve(result)
		})
	})
}

export function resolve (sql, res, callback, args) {
	query(sql)
		.then(async result => {
			res.json({ success: result.affectedRows > 0 || result.changedRows > 0 })

			if ((result.affectedRows > 0 || result.changedRows > 0) && callback)
				callback(await query(`SELECT LAST_INSERT_ID()`), args)
		})
		.catch(err => {
			console.log(err)
			res.sendStatus(500)
		})
}


let host = process.argv[2] || 'localhost'
let port = process.argv[3] || 3000
let backlog = process.argv[4] || 1024


server.listen(port, host, backlog, () => {
	console.log(`server started\nhost: ${host}\nport: ${port}\nbacklog: ${backlog}`)
})