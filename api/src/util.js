import pdf from 'pdf-creator-node'
import fs, { writeFileSync } from 'fs'
import path, { resolve } from 'path'
import { getPrinters, print } from 'pdf-to-printer'
import { print as unixPrint } from 'unix-print'
import { exec, execFile } from 'child_process'

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
		console.log('error converting to pdf')
		console.error(err)
		return { success: false }
	}
}

export const printFile = async (file, printer) => {
	try {
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
	} catch(err) {
		console.log('error printing file')
		console.log(err)
		return false
	}
}

export const copyXML = (path, filename) => {
	const scriptPath = resolve('copy.ps1')
	const dest = [
		process.env.XML_DEST_0 || 'user@192.168.11.10',
		process.env.XML_DEST_1 || '/MarakiInterface/Source/',
		process.env.KEY || 'luna_cashier'
	]

	writeFileSync(scriptPath, `scp -i ${dest[2]} -rp xml/* ${dest[0]}:${dest[1]}
rm xml/* -r
`)
	
	// execFile('powershell.exe', ['-File', scriptPath], (err, stdout, stderr) => {
	exec(scriptPath, (err, stdout, stderr) => {
		if (err) return console.error(err)

		console.log(`stdout: ${stdout}`);
		console.error(`stderr: ${stderr}`);

		console.log('xml file copied')
	})
}