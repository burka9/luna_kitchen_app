<script>
	import axios from 'axios';
	import UserAccounts from '../components/UserAccounts.vue';
	import MenuItems from '../components/MenuItems.vue';
	import Tables from '../components/Tables.vue';
	import NewOrder from '../components/NewOrder.vue';
	import Pending from '../components/Pending.vue';
	import Finished from '../components/Finished.vue';
	import Orders from '../components/Orders.vue';

	export default {
		name: 'CustomView',
		components: { UserAccounts, MenuItems, Tables, Orders },

		data: () => ({
			types: ['/admin', '/waiter', '/kitchen'],
			typeIndex: -1,
			name: '',
			drawer: false,
			tab: null,
			tabs: [
				{
					header: ['user accounts', 'menu items', 'tables'],
					component: [ UserAccounts, MenuItems, Tables ],
				},
				{
					header: ['New', 'Pending', 'finished'],
					component: [ NewOrder, Pending, Finished ],
				},
				{
					header: ['orders', 'menu items' ],
					component: [ Orders, MenuItems ],
				}
			],
		}),
		methods: {
			destroy() {
				localStorage.order_data = null
				location.assign('/')
			}
		},
		created() {
			this.typeIndex = this.types.findIndex(p => p.toLowerCase() == this.$route.path.toLowerCase())
		},
		mounted() {
			try { // resume session
				let { type, username, name } = JSON.parse(localStorage.order_data)
				axios.get(`/api/user?type=${type}&username=${username}`)
					.then(result => {
						if (!result.data.success) return this.destroy()
						this.name = name
					})
					.catch(err => this.destroy())
			} catch {
				this.destroy()
			}
		}
	}
</script>


<template>
	<div v-if="typeIndex > -1">
		<v-app>
			<v-app-bar dense dark elevation="1" max-height="auto" app>
				<v-app-bar-nav-icon @click="drawer = false"></v-app-bar-nav-icon>
				<v-app-bar-title>{{ name }}</v-app-bar-title>
				<v-spacer></v-spacer>
				<v-btn text @click="destroy" small>
					<v-icon>mdi-logout</v-icon>
					Logout
				</v-btn>

				<template v-slot:extension>
					<v-tabs v-model="tab" show-arrows>
						<v-tab v-for="item in tabs[typeIndex].header" :key="item">
							{{ item }}
						</v-tab>
					</v-tabs>
				</template>
			</v-app-bar>

			<!-- <v-navigation-drawer app dark v-model="state.drawer">
			</v-navigation-drawer> -->

			<v-main class="grey lighten-3">
				<v-tabs-items v-model="tab">
					<v-tab-item v-for="(item, i) in tabs[typeIndex].component" :key="`tab-item-${i}`">
						<component :is="item" class="grey lighten-3 pa-0 pa-sm-6 pa-md-12" />
					</v-tab-item>
				</v-tabs-items>
			</v-main>
		</v-app>
	</div>
	<div v-else>
		<v-app>
			<h1>404. Page Nout Found.</h1>
		</v-app>
	</div>
</template>