<script setup>
import axios from 'axios';
import { reactive, onMounted } from 'vue';

const state = reactive({
	tabs: null,
	name: '',
})

const destroy = () => {
	localStorage.order_data = null
	location.assign('/')
}

onMounted(() => {
	try { // resume session
		let { type, username, name } = JSON.parse(localStorage.order_data)
		axios.get(`/api/user?type=${type}&username=${username}`)
			.then(result => {
				if (!result.data.success) return destroy()
				state.name = name
			})
			.catch(err => destroy())
	} catch {
		destroy()
	}
})
</script>

<template>
	<div>
		<v-app>
			<v-app-bar dense dark elevation="1" max-height="auto" app>
				<v-app-bar-nav-icon></v-app-bar-nav-icon>
				<v-app-bar-title>{{ state.name }}</v-app-bar-title>
				<v-spacer></v-spacer>
				<v-btn text>
					<v-icon>mdi-logout</v-icon>
					Logout
				</v-btn>

				<template v-slot:extension>
					<v-tabs v-model=state.tabs>
						<v-tab>User accounts</v-tab>
						<v-tab>Menu Items</v-tab>
						<v-tab>Tables</v-tab>
					</v-tabs>
				</template>
			</v-app-bar>

			<v-main>
				<v-tabs-items v-model="state.tabs" class="m-4">
					<v-tab-item>
						<UserAccounts />
					</v-tab-item>
					<v-tab-item>
						<MenuItems />
					</v-tab-item>
				</v-tabs-items>
			</v-main>
		</v-app>
	</div>
</template>