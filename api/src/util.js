import pdf from 'pdf-creator-node'
import fs from 'fs'
import path from 'path'
import { getPrinters, print } from 'pdf-to-printer'
import { print as unixPrint } from 'unix-print'

export const getReportItems = (items, list) => {
	let count = {}
	list.forEach(item => {
		count = {...count, [item]: list.filter(l => l == item).length }
	})

	return items.map(item => {
		return list[item.id] ? {
			name: item.name,
			quantity: list[item.id],
			unit_price: item.price,
			total_price: item.price * list[item.id]
		} : 'string'
	}).filter(i => typeof i != 'string')
}

const htmlPath = path.resolve('assets/template.html')

export const convertToPDF = async (data, templatePath = htmlPath, options) => {
	try {
		let tempFilename = path.resolve(`tmp/${new Date().getTime()}.pdf`)
		let result = await pdf.create({
			html: fs.readFileSync(templatePath).toString(),
			data,
			path: tempFilename,
			type: '',
		}, options)

		result = { ...result, success: true, tempFilename }

		return result
	} catch(err) {
		console.error(err)
		return { success: false }
	}
}

export const printFile = async (file, printer) => {
	switch (process.platform) {
		case 'win32':
			await print(file, { printer })
			// console.log(`print job completed`)
			return true
			break
		case 'linux':
			await unixPrint(file, printer)
			return true
			break
		default:
			console.log(`no print handler for platform ${process.platform}`)
			return false
	}
}