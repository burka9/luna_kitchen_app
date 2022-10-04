import { Router } from 'express'
import { query } from '..'


const router = Router()


router.route('/')
	.get((req, res) => { // get list of tables
		query(`SELECT * FROM tables`)
			.then(result => res.json({
				success: true, list: result
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.post((req, res) => { // create table
		query(`INSERT INTO tables VALUES (NULL, "Table")`)
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