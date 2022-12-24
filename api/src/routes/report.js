import fs from 'fs'
import path from 'path'
import { Router } from 'express'
import { query } from '..'
import { convertToPDF, getReportItems, printFile } from '../util'
import { addDays, compareAsc, compareDesc, isEqual } from 'date-fns'

const router = Router()

const getWaiter = (order, waiters) => {
	let waiter = waiters.filter(w => w.id == order.user_id)[0]
	return !!waiter ? waiter : ''
}

router.get('/detail', async (req, res) => {
	console.log('sending report...')
	
	try {
		let waiters = await query(`SELECT * FROM user WHERE type='waiter'`)
		let orders = await query(`SELECT * FROM orders`)
		let items = await query(`SELECT * FROM menu_item`)

		if (orders.length==0 || waiters.length==0) res.end()

		let temp = []

		orders.forEach(order => {
			temp.push({
				id: order.id,
				waiter: getWaiter(order, waiters),
				issue_date: order.order_issued_date,
				cancel_date: order.order_cancel_date,
				serve_date: order.order_done_date,
				complete_date: order.order_archive_date,
				status: order.status,
				items: getReportItems(items, JSON.parse(order.menu_items)),
			})
		})

		res.status(200).json({
			success: true,
			list: temp,
		})
	} catch(err) {
		console.error(err)
		res.status(500).send(err)
	}
})

const reportStatus = {
	'pending': 'Pending',
	'canceled': 'Canceled',
	'finished': 'Completed',
	'archived': 'Completed',
}

router.route('/')
	.get(async (req, res) => {
		console.log('sending minimal report...')

		try {
			let report = []
			let orders = await query(`SELECT * FROM orders`)
			let items = await query(`SELECT * FROM menu_item`)
			let waiters = await query(`SELECT * FROM user WHERE id=235325`)
			
			orders.forEach(order => {
				let list = JSON.parse(order.menu_items).sort()
				
				for (const item of items) {
					let count = list.filter(l => l==item.id).length
					if (count <= 0) continue
					let waiter = waiters.find(waiter => waiter.id == order.user_id)
					report.push({
						id: item.id,
						category: item.category_id,
						subcategory: item.subcategory_id,
						maraki_id: item.maraki_id,
						name: item.name,
						table: order.table_index,
						tableText: `Table ${order.table_index}`,
						status: order.status,
						statusText: reportStatus[order.status],
						date: order.order_issued_date,
						parsedDate: new Date(parseInt(order.order_issued_date)).toDateString(),
						quantity: count,
						price: item.price,
						totalPrice: count * item.price,
						waiter: waiter ? {
							id: waiter.id,
							name: waiter.name
						} : {}
					})
				}
			})
			
			
			res.status(200).json({
				success: true,
				report,
				reportStatus: Object.entries(reportStatus).map(status => ({
					name: status[1],
					value: status[0],
				})),
			})
		} catch(err) {
			console.error(err)
			res.status(500).send(err)
		}
	})


const pdfFormatOptions = {
	border: '10mm'
}

router.route('/print')
	.post(async (req, res) => {
		try {
			// summarize data
			let report = req.body

			if (Object.values(req.body).length == 0) return res.status(400).send('Cannot print empty report')
			
			let start = new Date("1970/01/01")
			let end = addDays(new Date(), 30)
			let items = {}
			let total = {
				name: 'Total',
				quantity: 0,
				unit_price: 0,
				total_price: 0,
			}

			report.forEach(item => {
				if (items[item.name]) {
					items[item.name]['quantity'] += parseInt(item.quantity)
					items[item.name]['unit_price'] += parseInt(item.price)
					items[item.name]['total_price'] += parseInt(item.totalPrice)
				}
				else {
					items[item.name] = {
						name: item.name,
						quantity: parseInt(item.quantity),
						unit_price: parseInt(item.price),
						total_price: parseInt(item.totalPrice),
					}
				}

				if (compareAsc(start, new Date(parseInt(item.date))) == -1)
					start = new Date(parseInt(item.date))
				if (compareDesc(end, new Date(parseInt(item.date))) == -1)
					end = new Date(parseInt(item.date))

				total.quantity += parseInt(item.quantity)
				total.unit_price += parseInt(item.price)
				total.total_price += parseInt(item.totalPrice)
			})

			items = Object.values({ ...items, total })


			let formattedDate = ''

			if (isEqual(new Date(end.toDateString()), new Date(start.toDateString())))
				formattedDate = start.toDateString()
			else
				formattedDate = `${end.toDateString()} - ${start.toDateString()}`

			const summarizedData = { formattedDate, items }

			let result = await convertToPDF(summarizedData, path.resolve('assets/summary.html'), pdfFormatOptions)

			if (result.success) {
				// do print job here
				await printFile(result.filename, process.env.REPORT_PRINTER_NAME || '')
		
				// remove the temp file
				fs.unlinkSync(path.resolve(result.filename))
				return res.json({ success: true })
			}
		} catch(err) {
			console.error(err)
		}

		return res.end()
	})


const TOKEN = 'THIS IS A TOKEN USED FOR DOWNLOADING REPORT'

router.route('/get-file')
	.get((req, res) => {
	if (req.query.token !== TOKEN) return res.end()

	res.download(req.query.filename, 'report.pdf', err => {
		if (err) return console.error(err)
		setTimeout(() => fs.unlinkSync(path.resolve(req.query.filename)), process.env.FILE_DELETE_DELAY)
	})
})
	
router.route('/download')
	.post(async (req, res) => {
		try {
			let result = await convertToPDF(req.body, path.resolve('assets/report.html'), pdfFormatOptions)

			if (result.success) {
				return res.redirect(`/api/report/get-file?token=${TOKEN}&filename=${result.tempFilename}`)
			} else return res.end()
		} catch(err) {
			console.error(err)
			return res.end()
		}
	})


export default router