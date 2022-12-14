<script setup>
import axios from 'axios';
import { reactive, onMounted, ref } from 'vue';

let api = 'http://localhost:3000'

const state = reactive({
	username: '',
	password: '',
	rules: {
		required: [v => !!v || 'Required Field!'],
	},
	valid: true,
	snackbar: {
		toggle: false,
		text: '',
		color: 'red',
		show: (text, color = 'error') => {
			state.snackbar.toggle = true
			state.snackbar.text = text
			state.snackbar.color = color
		}
	},
	disabled: true,
})

const form = ref(null)

const login = () => {
	if (form.value.validate()) {
		state.disabled = true
		axios.post(`${api}/api/session`, {
			username: state.username,
			password: state.password
		}, { withCredentials: false })
			.then(result => {
				if (result.data.success) {
					localStorage.order_data = JSON.stringify(result.data)
					location.assign(result.data.type)
				}
				else {
					state.snackbar.show('Incorrect username and password!')
					state.disabled = false
				}
			})
			.catch(err => {
				state.snackbar.show('Something went wrong!')
				state.disabled = false
			})
	}
}

onMounted(() => {
	if (location.hostname != 'localhost') {
		api = `${location.protocol}//${location.hostname}`
		if (!isNaN(location.port)) api += `:${3000}`
	}

	try { // resume session
		let { type, username } = JSON.parse(localStorage.order_data)
		axios.get(`${api}/api/user?type=${type}&username=${username}`, {
			withCredentials: false
		})
			.then(result => {
				if (result.data.success) location.assign(type)
				else {
					localStorage.order_data = null
					state.disabled = false
				}
			})
			.catch(err => {
				localStorage.order_data = null
				state.disabled = false
			})
	} catch {
		state.disabled = false
	}
})
</script>


<template>
	<v-app>
		<v-container fill-height>
			<v-snackbar v-model="state.snackbar.toggle" :timeout="2500" top :color="state.snackbar.color" elevation="3">
				<span class="text-subtitle-1">{{ state.snackbar.text }}</span>
			</v-snackbar>
			<v-row>
				<v-col align="center" justify="center">
					<v-form ref="form" v-model="state.valid" style="width: 250px;">
						<h1>Login</h1>
						<v-text-field
							v-model="state.username"
							@keypress.enter="login"
							:rules="state.rules.required"
							:disabled="state.disabled"
							required
							label="Username" />
						<v-text-field
							v-model="state.password"
							@keypress.enter="login"
							:rules="state.rules.required"
							:disabled="state.disabled"
							required
							type="password"
							label="Password" />
						<v-btn class="mt-5" color="primary" @click="login" :loading="state.disabled">Login</v-btn>
					</v-form>
				</v-col>
			</v-row>
		</v-container>
	</v-app>
</template>
