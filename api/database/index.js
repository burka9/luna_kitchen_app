require('dotenv').config()
import { query } from ".."

export default async () => {
	console.log('init db')

	// await query(`DROP DATABASE IF EXISTS db_order`)

	// create and use database
	try {
		await query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`)
		await query(`USE ${process.env.DB_NAME}`)
		console.log('database initialized')
	} catch (e) {
		return console.log('error initializing database')
	}

	// create tables
	try {
		await query(`CREATE TABLE IF NOT EXISTS user (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			gender VARCHAR(255),
			email VARCHAR(255),
			phone VARCHAR(255),
			username VARCHAR(255) NOT NULL UNIQUE,
			password VARCHAR(255) NOT NULL,
			type VARCHAR(255),
			status VARCHAR(255)
		)`)
		await query(`CREATE TABLE IF NOT EXISTS menu_item (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			price VARCHAR(255) NOT NULL,
			available BOOLEAN
		)`)
		await query(`CREATE TABLE IF NOT EXISTS tables (
			id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(16)
		)`)
		console.log('tables initialized')
	} catch(e) {
		console.log(e.sqlError)
		console.log('error creating tables')
	}

	// create admin user account
	try {
		await query(`INSERT INTO user VALUES (
			NULL, 'Administrator', 'Male', 'admin@admin.com', '0912345678', 'admin', MD5('admin'), 'admin', NULL
		)`)
		console.log('admin created')
	} catch(e) {
		console.log('error creating admin')
	}
	
}