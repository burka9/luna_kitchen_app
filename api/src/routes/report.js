import { Router } from 'express'
import { query } from '..'

const router = Router()

const getWaiter = (order, waiters) => {
	let waiter = waiters.filter(w => w.id == order.user_id)[0]
	return !!waiter ? waiter : ''
}

const getItems = (items, list) => {
	let count = {}
	list.forEach(item => {
		count = {...count, [item]: list.filter(l => l == item).length }
	})

	return items.map(item => {
		return list[item.id] ? {
			name: item.name,
			quantity: list[item.id],
			unit_price: item.price,
			total_price: item.price * list[item.id]
		} : 'string'
	}).filter(i => typeof i != 'string')
}

router.get('/', async (req, res) => {
	console.log('sending report...')
	
	try {
		let waiters = await query(`SELECT * FROM user WHERE type='waiter'`)
		let orders = await query(`SELECT * FROM orders`)
		let items = await query(`SELECT * FROM menu_item`)

		if (orders.length==0 || waiters.length==0) res.end()

		let temp = []

		orders.forEach(order => {
			temp.push({
				id: order.id,
				waiter: getWaiter(order, waiters),
				issue_date: order.order_issued_date,
				cancel_date: order.order_cancel_date,
				serve_date: order.order_done_date,
				complete_date: order.order_archive_date,
				status: order.status,
				items: getItems(items, JSON.parse(order.menu_items)),
			})
		})

		res.status(200).json({
			success: true,
			list: temp,
		})
	} catch(err) {
		console.error(err)
		res.status(500).send(err)
	}
})


export default router