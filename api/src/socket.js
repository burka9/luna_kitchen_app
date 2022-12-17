import { query } from "."

let io = null


export function updateMenu () {
	if (io === null) return
	io.emit('update_menu')
}

export function updateOrder(result, { table_index }) {
	if (result[0]) query(`UPDATE tables SET current_order_id=${result[0]['LAST_INSERT_ID()']} WHERE table_index=${table_index}`)
	if (io === null) return
	io.emit('update_order')
	io.emit('update_table')
}

export function updateTable() {
	if (io === null) return
	io.emit('update_table')
}

export function notifyWaiter(id) {
	if (io === null) return
	console.log('notifying waiter...')	
	query(`SELECT user_id, table_index FROM orders WHERE id=${id}`)
		.then(result => {
			result = result[0]
			if (result) {
				// free up table
				query(`UPDATE tables SET current_order_id=NULL WHERE id=${result.table_index}`)
				io.emit('order_finished', result)
				io.emit('update_table')
			}
		})
		.catch(err => console.error(err))
}

export function notifyCancel(id) {
	if (io == null) return
	console.log('notifying canceled order...')
	query(`SELECT * FROM orders WHERE id=${id}`)
		.then(result => {
			result = result[0]
			if (result) {
				io.emit('order_canceled', result)
				query(`UPDATE tables SET current_order_id=NULL WHERE id=${result.table_index}`)
					.then(() => io.emit('update_table'))
					.catch(err => console.error(err))
			}
		})
		.catch(err => console.error(err))
}

export function notifyArchive() {
	if (io == null) return
	io.emit('archived_an_order')
}

export default arg => {
	io = arg
	console.log('listening to socket connections...')
	
	io.on('connection', socket => {
		console.log(`socket connected: ${socket.id}`)

		socket.on('disconnect', () => console.log(`socket disconnected: ${socket.id}`))
	})
}