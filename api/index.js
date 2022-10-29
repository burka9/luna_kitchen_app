require('dotenv').config()
import http from 'http'
import express from 'express'
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
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(routes)


let server = http.createServer(app)



conn.connect(err => {
	if (err) return console.log(err)
	console.log('database connected')
	database()
})

export function broadcast(message, data) {
	io.emit(message, data)
}

export async function query (sql) {
	return new Promise((resolve, reject) => {
		if (!sql.endsWith(';')) sql = sql + ';'
		conn.query(sql, (err, result) => {
			if (err) reject(err)
			resolve(result)
		})
	})
}

export function resolve (sql, res, callback) {
	query(sql)
		.then(result => {
			res.json({ success: result.affectedRows > 0 || result.changedRows > 0 })

			if ((result.affectedRows > 0 || result.changedRows > 0) && callback)
				callback()
		})
		.catch(err => {
			console.log(err)
			res.sendStatus(500)
		})
}

export default {
	path: '/api',
	handler: server
}
