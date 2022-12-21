import { Router } from 'express'
import { getPrinters } from 'pdf-to-printer'


const router = Router()


router.route('/')
	.get((req, res) => { // list available printers
		getPrinters()
			.then(result => {
				res.json({
					success: true,
					list: result
				})
			})
			.catch(err => {
				res.json({ success: false })
			})
	})


export default router