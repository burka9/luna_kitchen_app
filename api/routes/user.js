import { Router } from 'express'
import { query } from '..'


const router = Router()



router.route('/')
	.get((req, res) => { // show users
		let { type, username } = req.query

		let sql = `SELECT * FROM user`

		if (type && username) sql += ` WHERE type='${type}' AND username='${username}'`
		else if (type && !username) sql += ` WHERE type='${type}'`
		else if (!type && username) sql += ` WHERE username='${username}'`
		
		query(sql)
			.then(result => res.json({
				success: (type || username) ? result.length > 0 : true, list: result
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.post((req, res) => { // create new user
		let { name, gender, email, phone, username, password, type, status } = req.body

		query(`INSERT INTO user VALUES (
			NULL, '${name}', '${gender}', '${email}', '${phone}', '${username.toLowerCase()}', MD5('${password}'), '${type}', '${status}'
		)`)
			.then(result => res.json({
				success: result.affectedRows > 0 || result.changedRows > 0
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})

	.put((req, res) => { // edit user
		let { id, name, gender, email, phone, username, password, type, status } = req.body

		let pass = password!='' ? `password=MD5('${password}'),` : ``

		query(`UPDATE user SET
				name='${name}',
				gender='${gender}',
				email='${email}',
				phone='${phone}',
				username='${username.toLowerCase()}',
				${pass}
				type='${type}',
				status='${status}'
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

	.delete((req, res) => {
		query(`DELETE FROM user WHERE id=${req.body.id}`)
			.then(result => res.json({
				success: result.affectedRows > 0 || result.changedRows > 0
			}))
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})




export default router