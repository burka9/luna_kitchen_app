import fs from 'fs'
import path from 'path'
import xmlbuilder from "xmlbuilder"
import { query } from "."

const rootPath = path.resolve('xml')

export default async id => {
	try {
		let order = await query(`SELECT * FROM orders WHERE id=${id}`)

		order = order[0]

		let xmlString = {
			root: {
				'xml-builder': {
					repo: {
						'@type': 'git',
						'#text': 'github.com/burka9'
					}
				},
				order: {
					id: {
						'#text': order.id
					},
					items: {
						'#text': JSON.parse(order.menu_items).join(', ')
					},
					issued: {
						'@format': 'milliseconds',
						'@type': 'JavaScript Date',
						'#text': order.order_issued_date,
					},
					description: {
						'#text': order.description
					}
				}
			}
		}

		let xml = xmlbuilder.create(xmlString).end({ pretty: true })
		!fs.existsSync(rootPath) && fs.mkdirSync(rootPath)
		fs.writeFileSync(path.resolve(rootPath, new Date().getTime().toString()), xml)
	} catch (e) {
		console.error(e)
	}
}