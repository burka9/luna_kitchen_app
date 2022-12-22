import 'dotenv/config'
import { Router } from 'express'
import { query, resolve } from '..'
import generateXml from '../generate-xml'
import { notifyCancel, notifyWaiter, updateOrder } from '../socket'
import { convertToPDF, getReportItems, printFile } from '../util'
import fs from 'fs'
import path from 'path'


const router = Router()

const getItems = async items => {
	let list = []
	await new Promise((resolve, reject) => {
		items.forEach(async (item, i) => {
			list.push((await query(`SELECT * FROM menu_item WHERE id=${item}`))[0])
			if (i==items.length-1) resolve()
		})
	})
	return list
}

const printerList = {
	'bar': process.env.BAR_PRINTER_NAME,
	'kitchen': process.env.KITCHEN_PRINTER_NAME,
}

export const printOrder = async id => {
	let order = (await query(`SELECT * FROM orders WHERE id=${id}`))[0]
	if (!order) return false

	let list = JSON.parse(order.menu_items)
	if (list.length <= 0) return false

	let waiter = (await query(`SELECT * FROM user WHERE id=${order.user_id}`))[0]
	if (!waiter) return false
	
	let items = await query(`SELECT * FROM menu_item`)
	let printerName = await query(`SELECT type FROM menu_item LEFT JOIN menu_item_category ON menu_item.category_id = menu_item_category.id WHERE menu_item.id=${list[0]}`)
	printerName = printerName[0]
	if (!printerName) return false
	
	let date = new Date(parseInt(order.order_issued_date))
	
	let print = {
		orderNo: order.id,
		date: `${date.toDateString()} ${date.toLocaleTimeString()}`,
		clientName: 'Mr/Mrs',
		waiterName: waiter.name,
		table: order.table_index,
		items: getReportItems(items, list),
	}

	let pdf = await convertToPDF(print)
	// filename, success

	if (pdf.success) {
		// do print job here
		await printFile(pdf.filename, printerList[printerName.type] || '')

		// remove the temp file
		fs.unlinkSync(path.resolve(pdf.filename))
		return true
	}

	return false
}


router.route('/')
	.get((req, res) => { // list of orders
		let { id, status, from } = req.query

		let condition = ``


		if (from == 'kitchen')
			condition = `WHERE status='pending' OR status='canceled'`
		else {
			if (id && !status)
				condition = `WHERE user_id=${id}`
			else if (id && status)
				condition = `WHERE user_id=${id} AND status='${status}'`
			else if (!id && status)
				condition = `WHERE status='${status}'`
		}
			
		query(`SELECT * FROM orders ${condition} ORDER BY order_issued_date`)
			.then(async result => {
				let list = []

				if (result.length > 0)
					await new Promise((resolve, reject) => {
						result.forEach(async (item, index) => {
							list.push({
								id: item.id,
								user: (await query(`SELECT * FROM user WHERE id=${item.user_id}`))[0],
								items: (await getItems(JSON.parse(item.menu_items))),
								table: item.table_index,
								issued: item.order_issued_date,
								done: item.order_done_date,
								status: item.status,
								description: item.description,
							})
							if (index == result.length-1) resolve()
						})
					})
				res.json({ success: true, list })
			})
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.post((req, res) => { // create new order
		let { description, user_id, items, issued, table_index, print } = req.body

		description = description ? description : ''

		resolve(`INSERT INTO orders VALUES (NULL, "${JSON.stringify(items)}", ${user_id}, ${table_index}, "${issued}", NULL, NULL, NULL, "pending", "${description}")`, res, result => {
			updateOrder(result, table_index)
			if (!!print) printOrder(result.insertId)
		})
	})

router.route('/done')
	.post((req, res) => { // archive order - from waiter
		let { id } = req.body

		resolve(`UPDATE orders SET status='archived', order_archive_date="${new Date().getTime()}" WHERE id=${id}`, res)
	})

router.route('/finish')
	.post((req, res) => { // finish order - from kitchen
		let { id } = req.body

		resolve(`UPDATE orders SET status='finished', order_done_date="${new Date().getTime()}" WHERE id=${id}`, res, () => {
			generateXml(id)
			notifyWaiter(id)
		})
	})

router.route('/cancel')
	.post(async (req, res) => { // cancel order
		let { id, username, password } = req.body

		let user = await query(`SELECT * FROM user WHERE username='${username}' AND password=MD5('${password}')`)
		user = user[0]
		if (user) {
			if (user.type == 'admin') {
				return resolve(`UPDATE orders SET status='canceled', order_cancel_date="${new Date().getTime()}" WHERE id=${id}`, res, () => notifyCancel(id))
			}
		}

		res.status(200).json({
			success: false
		})
	})

router.route('/archive-canceled')
	.post(async (req, res) => { // archive canceled order
		let { id } = req.body

		resolve(`UPDATE orders SET status='archived', order_archive_date="${new Date().getTime()}" WHERE id=${id}`, res, )
	})

export default router


function lol(callback) {
	callback()
}