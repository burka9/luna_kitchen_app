import { Router } from 'express'
import { query, resolve } from '..'
import { updateMenu } from '../socket'


const router = Router()


router.route('/')
	.get((req, res) => { // get list of sub-categories
		let { id, category_id } = req.query

		let condition = `${ (id || category_id) ? 'WHERE ' : '' }` + Object.keys(req.query).map(key => `${key}=${req.query[key]}`).join(' AND ')
		
		query(`SELECT * FROM menu_item_subcategory ${condition}`)
			.then(result => res.status(200).json({ success: true, list: result }))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.post((req, res) => { // create new sub-category
		let { name, detail, category } = req.body
		
		resolve(`INSERT INTO menu_item_subcategory VALUES (NULL, "${name}", "${detail}", ${category});`, res, updateMenu)
	})

	.put((req, res) => { // edit a sub-category
		let { id, name, detail } = req.body

		resolve(`UPDATE menu_item_subcategory SET name="${name}", detail="${detail}" WHERE id=${id}`, res, updateMenu)
	})

	.delete((req, res) => resolve(`DELETE FROM menu_item_subcategory WHERE id=${req.body.id}`, res, updateMenu))



export default router