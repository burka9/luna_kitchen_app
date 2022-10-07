require('dotenv').config()
import express from 'express'
import mysql from 'mysql'
import socket from 'socket.io'
import routes from './routes'
import database from './database'
import handle_socket from './socket'

let server = null
let io = null

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


app.all('/init', (req, res) => {
  if (!server) {
    server = res.socket.server
    io = socket(server)

    io.on('connection', socket => handle_socket(socket))
  }
  res.json({ msg: 'server is set' })
})


conn.connect(err => {
	if (err) return console.log(err)
	console.log('database connected')
	database()
})


export async function query(sql) {
	return new Promise((resolve, reject) => {
		if (!sql.endsWith(';')) sql = sql + ';'
		conn.query(sql, (err, result) => {
			if (err) reject(err)
			resolve(result)
		})
	})
}

export default {
	path: '/api',
	handler: app
}
