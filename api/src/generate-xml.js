import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import xmlbuilder from "xmlbuilder"
import { query } from "."
import SMB2 from 'smb2'
import { copyXML } from './util'

let rootPath

const {
	PLANT_CODE,
	PLANT_NAME,
	INVOICE_TYPE,
	REFERENCE_NUMBER,
	REFERENCE_NUMBER_1,
	REFERENCE_NUMBER_2,
	REFERENCE_NUMBER_3,
	CUSTOMER_CODE,
	CUSTOMER_NAME,
	CUSTOMER_TIN,
	PAYMENT_TYPE,
	INVOICE_DISCORADD_AMOUNT,
	ITEM_UOM,
	ITEM_TAX_PERCENT,
	ITEM_DISCORADD_AMOUNT,
	XML_DIR_PATH
} = process.env

const getDate = () => {
	let now = new Date()
	return `${now.getDate()}.${now.getMonth()}.${now.getFullYear()}`
}

const properties = [
	{ 'Plant_Code': PLANT_CODE },
	{ 'Plant_Name': PLANT_NAME },
	{ 'Invoice_Type': INVOICE_TYPE },
	{ 'Reference_Number': REFERENCE_NUMBER },
	{ 'Reference_Number_1': REFERENCE_NUMBER_1 },
	{ 'Reference_Number_2': REFERENCE_NUMBER_2 },
	{ 'Reference_Number_3': REFERENCE_NUMBER_3 },
	{ 'Invoice_Date': () => getDate() },
	{ 'Customer_Code': CUSTOMER_CODE },
	{ 'Customer_Name': CUSTOMER_NAME },
	{ 'Customer_TIN': CUSTOMER_TIN },
	{ 'Payment_Type': PAYMENT_TYPE },
	{ 'Invoice_DiscOrAdd_Amount': INVOICE_DISCORADD_AMOUNT },
]

export default async id => {
	try {
		let order = await query(`SELECT * FROM orders WHERE id=${id}`)

		order = order[0]

		if (!order) return console.log('no order found')

		let xmlString = {}

		properties.forEach(prop => {
			for (const [key, value] of Object.entries(prop)) {
				xmlString = {
					...xmlString,
					[key]: {
						'#text': key == 'Invoice_date' ? value() : key == 'Reference_Number' ? order.id : value
					}
				}
			}
		})

		let xml = xmlbuilder.create('Invoice', {
			version: '1.0',
			encoding: 'utf-8',
		}).ele(xmlString).up()
		
		await new Promise(async resolve => {
			let items = JSON.parse(order.menu_items)
			let count = {}
			items.forEach(item => count = {
				...count,
				[item]: (items.filter(i => i == item)).length
			})
			let item
			let unique = [...new Set(items)]
			for (const index in unique) {
				item = (await query(`SELECT * FROM menu_item WHERE id=${items[index]}`))[0]
				if (!item) {
					if (index == items.length-1) resolve()
					return
				}

				xml.ele('Line_Items')
					.ele('Item_ID').text(item.maraki_id).up()
					.ele('Item_Description').text(item.name).up()
					.ele('Item_Quantity').text(count[item.id]).up()
					.ele('Item_UOM').text(ITEM_UOM).up()
					.ele('Item_Unit_Price').text(item.price).up()
					.ele('Item_Tax_Percent').text(ITEM_TAX_PERCENT).up()
					.ele('Item_DiscOrAdd_Amount').text(ITEM_DISCORADD_AMOUNT)

				if (index == unique.length-1) resolve()
			}
		})

		// set dir path
		rootPath = path.resolve(XML_DIR_PATH || 'xml')
		
		const filename = new Date().getTime().toString() + '.xml'
		
		!fs.existsSync(rootPath) && fs.mkdirSync(rootPath)
		fs.writeFileSync(path.resolve(rootPath, filename), xml.end({ pretty: true }))

		copyXML(rootPath, filename)
	} catch (e) {
		console.error(e)
	}
}