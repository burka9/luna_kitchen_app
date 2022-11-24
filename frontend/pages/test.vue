<script setup>
import { onMounted } from 'vue';

const vibrate = () => {
	let vibrationPattern = []

	for (let i=0; i<5; i++) vibrationPattern.push(350)
	
	window.navigator.vibrate(0)
	window.navigator.vibrate(vibrationPattern)
	console.log('vibrating...')
}

let audio = null

onMounted(() => {
	audio = document.getElementById('audio')
})


const play = () => {
	if (audio != null) audio.play()
}

</script>

<template>
	<div>
		<v-app class="ma-8">
			<audio id="audio" src="http://localhost:3000/notification.wav" hidden></audio>
			<v-btn @click="vibrate">Vibrate</v-btn>
			<v-btn @click="play">Play</v-btn>
		</v-app>
	</div>
</template>