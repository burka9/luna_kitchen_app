import { Router } from 'express'
import { query } from '..'


const router = Router()


router.route('/')
	.get((req, res) => { // get list of menu items
		query(`SELECT * FROM menu_item ${req.query.id ? (' WHERE id='+req.query.id) : ''}`)
			.then(result => res.json({
				success: true, list: result
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.post((req, res) => { // create new menu item
		let { name, price } = req.body

		query(`INSERT INTO menu_item VALUES (
			NULL, '${name}', '${price}', true
		)`)
			.then(result => res.json({
				success: result.affectedRows > 0 || result.changedRows > 0
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.put((req, res) => { // edit menu item
		let { id, name, price, available } = req.body

		query(`UPDATE menu_item SET
				name='${name}',
				price='${price}',
				available=${available}
			WHERE id=${id}
		`)
			.then(result => res.json({
				success: result.affectedRows > 0 || result.changedRows > 0
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.delete((req, res) => { // delete table
		query(`DELETE FROM menu_item WHERE id=${req.body.id}`)
			.then(result => res.json({
				success: result.affectedRows > 0 || result.changedRows > 0
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})


export default router