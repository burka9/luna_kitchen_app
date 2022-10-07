import { Router } from 'express'
import { query } from '..'


const router = Router()


router.route('/')
	.get((req, res) => { // list of orders
		let { status } = req.query
		
		query(`SELECT * FROM orders ${status ? 'WHERE status="'+status+'"' : ''}`)
			.then(async result => {
				let list = []

				if (result.length > 0)
					await new Promise((resolve, reject) => {
						result.forEach(async (item, index) => {
							list.push({
								id: item.id,
								items: (await query(`SELECT * FROM menu_item WHERE id IN (${JSON.parse(item.menu_items).join()})`)),
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
		let { description, id, items, issued, table } = req.body

		query(`INSERT INTO orders VALUES (
			NULL, "${JSON.stringify(items)}", ${id}, ${table}, "${issued}", NULL, NULL, "pending", "${description}"
		)`)
			.then(result => res.json({
				success: result.affectedRows > 0 || result.changedRows > 0
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})


export default router