import { query } from "."

let io = null


export function updateMenu () {
	if (io === null) return
	io.emit('update_menu')
}

export function updateOrder() {
	if (io === null) return
	io.emit('update_order')
}

export function notifyWaiter(id) {
	if (io === null) return
	console.log('notifying waiter...')
	query(`SELECT user_id FROM orders WHERE id=${id}`)
		.then(result => {
			result = result[0]
			if (result) io.emit('order_finished', result)
		})
		.catch(err => console.error(err))
}

export default arg => {
	io = arg
	console.log('listening to socket connections...')
	
	io.on('connection', socket => {
		console.log(`socket connected: ${socket.id}`)

		socket.on('disconnect', () => console.log(`socket disconnected: ${socket.id}`))
	})
}