import { Router } from 'express'
import { query, resolve } from '..'
import { updateMenu } from '../socket'


const router = Router()



router.route('/')
	.get((req, res) => { // get list of menu items
		let { id, category_id, subcategory_id } = req.query

		let condition = `${ (id || category_id || subcategory_id) ? 'WHERE ' : '' }` + Object.keys(req.query).map(key => `${key}=${req.query[key]}`).join(' AND ')
		
		query(`SELECT * FROM menu_item ${condition}`)
			.then(result => res.json({
				success: true, list: result
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.post((req, res) => { // create new menu item
		let { maraki_id, name, detail, price, available, category_id, subcategory_id } = req.body

		resolve(`INSERT INTO menu_item VALUES (NULL, ${maraki_id}, "${name}", "${detail}", "${price}", ${available}, ${category_id}, ${subcategory_id})`, res, updateMenu)
	})

	.put((req, res) => { // edit menu item
		let { id, maraki_id, name, detail, price, available } = req.body

		resolve(`UPDATE menu_item SET maraki_id=${maraki_id}, name="${name}", detail="${detail}", price="${price}", available=${available} WHERE id=${id}`, res, updateMenu)
	})

	.delete((req, res) => resolve(`DELETE FROM menu_item WHERE id=${req.body.id}`, res, updateMenu))


export default router