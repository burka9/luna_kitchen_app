import { Router } from 'express'
import { query, resolve } from '..'


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
		let { id, status } = req.query

		let condition = ``

		if (id && !status)
			condition = `WHERE user_id=${id}`
		else if (id && status)
			condition = `WHERE user_id=${id} AND status='${status}'`
		else if (!id && status)
			condition = `WHERE status='${status}'`
			
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

		resolve(`INSERT INTO orders VALUES (NULL, "${JSON.stringify(items)}", ${user_id}, ${table_index}, "${issued}", NULL, NULL, "pending", "${description}")`, res)
	})

router.route('/done')
.post((req, res) => {
	let { id } = req.body

	query(`UPDATE orders SET status='archived' WHERE id=${id}`)
		.then(result => res.json({
			success: result.affectedRows > 0 || result.changedRows > 0
		}))
		.catch(err => {
			console.log(err)
			res.sendStatus(500)
		})
})

router.route('/finish')
.post((req, res) => {
	let { id } = req.body

	query(`UPDATE orders SET status='finished' WHERE id=${id}`)
		.then(result => res.json({
			success: result.affectedRows > 0 || result.changedRows > 0
		}))
		.catch(err => {
			console.log(err)
			res.sendStatus(500)
		})
})

export default router