import { broadcast } from '.';


export default socket => {
	console.log('socket connected');
  socket.on('disconnect', () => console.log('disconnected'))
}

export function updateMenu () {
	broadcast('update_menu')
}
