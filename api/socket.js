export default socket => {
	console.log('socket connected');
  socket.on('disconnect', () => console.log('disconnected'))
}