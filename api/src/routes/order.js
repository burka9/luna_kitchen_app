import { Router } from 'express'
import { query, resolve } from '..'
import generateXml from '../generate-xml'
import { notifyCancel, notifyWaiter, updateOrder } from '../socket'


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
		let { description, user_id, items, issued, table_index } = req.body

		description = description ? description : ''

		resolve(`INSERT INTO orders VALUES (NULL, "${JSON.stringify(items)}", ${user_id}, ${table_index}, "${issued}", NULL, NULL, NULL, "pending", "${description}")`, res, updateOrder, { table_index })
	})

router.route('/done')
	.post((req, res) => { // archive order - from waiter
		let { id } = req.body

		resolve(`UPDATE orders SET status='archived', order_archive_date="${new Date().getTime()}" WHERE id=${id}`, res, () => generateXml(id))
	})

router.route('/finish')
	.post((req, res) => { // finish order - from kitchen
		let { id } = req.body

		resolve(`UPDATE orders SET status='finished', order_done_date="${new Date().getTime()}" WHERE id=${id}`, res, () => notifyWaiter(id))
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