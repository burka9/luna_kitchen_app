import { Router } from 'express'
import { query, resolve } from '..'
import { updateMenu } from '../socket'


const router = Router()


router.route('/')
	.get((req, res) => { // get list of categories
		let { id } = req.query
		
		query(`SELECT * FROM menu_item_category ${id ? ` WHERE id=${id}` : ''}`)
			.then(result => res.status(200).json({ success: true, list: result }))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.post((req, res) => { // create new category
		let { name, detail } = req.body

		resolve(`INSERT INTO menu_item_category VALUES (NULL, "${name}", "${detail}");`, res, updateMenu)
	})

	.put((req, res) => { // edit a category
		let { id, name, detail } = req.body

		resolve(`UPDATE menu_item_category SET name="${name}", detail="${detail}" WHERE id=${id}`, res, updateMenu)
	})

	.delete((req, res) => resolve(`DELETE FROM menu_item_category WHERE id=${req.body.id}`, res, updateMenu))



export default router