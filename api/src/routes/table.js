import { Router } from 'express'
import { query } from '..'


const router = Router()


router.route('/')
	.get((req, res) => { // get list of tables
		query(`SELECT * FROM tables ${req.query.sort ? 'ORDER BY table_index' : ''}`)
			.then(result => res.json({
				success: true, list: result
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.post((req, res) => { // create table
		let index = 1

		query(`SELECT * FROM tables`)
			.then(result => {
				while (result.find(item => item.table_index==index))
					index++
				return query(`INSERT INTO tables VALUES (NULL, "Table", ${index})`)
			})
			.then(result => res.json({
				success: result.affectedRows > 0 || result.changedRows > 0
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.delete((req, res) => { // delete table
		query(`DELETE FROM tables WHERE id=${req.body.id}`)
			.then(result => res.json({
				success: result.affectedRows > 0 || result.changedRows > 0
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})


export default router