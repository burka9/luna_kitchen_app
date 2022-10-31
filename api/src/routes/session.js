import { Router } from 'express'
import { query } from '..'


const router = Router()



router.route('/')
	.post((req, res) => { // LOGIN
		let { username, password } = req.body

		query(`SELECT * FROM user WHERE username='${username}' AND password=MD5('${password}')`)
			.then(result => {
				if (result[0])
					res.json({
						success: true,
						id: result[0].id,
						name: result[0].name,
						username: result[0].username,
						type: result[0].type,
					})
				else res.json({ success: false })
			})
			.catch(err => {
				console.log(err)
				res.sendStatus(500)
			})
	})




export default router