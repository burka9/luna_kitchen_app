<script>
	import axios from 'axios';
	import { io } from 'socket.io-client';
	import UserAccounts from '../components/UserAccounts.vue';
	import MenuItems from '../components/MenuItems.vue';
	import Tables from '../components/Tables.vue';
	import NewOrder from '../components/NewOrder.vue';
	import Pending from '../components/Pending.vue';
	import Finished from '../components/Finished.vue';
	import Orders from '../components/Orders.vue';
	import DetailReport from '../components/DetailReport.vue';
	import DailyReport from '../components/DailyReport.vue';

	export default {
		name: 'CustomView',
		components: { UserAccounts, MenuItems, Tables, Orders, DetailReport },

		data: () => ({
			api: 'http://localhost:3000',
			socket: null,
			types: ['/admin', '/waiter', '/kitchen'],
			typeIndex: -1,
			name: '',
			drawer: false,
			tab: null,
			tabs: [
				{
					header: ['menu items', 'user accounts', 'tables', 'detail report', 'transaction report'],
					component: [ MenuItems, UserAccounts, Tables, DailyReport, DetailReport ],
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
			finishedDialog: {
				show: false,
				text: 'You have a completed order!',
			}
		}),
		methods: {
			destroy() {
				localStorage.order_data = null
				location.assign('/')
			},
			changeTab(index) {
				this.finishedDialog.show = false
				this.tab = index
			},
			showFinished(text) {
				this.finishedDialog.text = text ? text : 'You have a notification!'
				this.finishedDialog.show = true
			},
		},
		created() {
			this.typeIndex = this.types.findIndex(p => p.toLowerCase() == this.$route.path.toLowerCase())
		},
		mounted() {
			// set api
			if (location.hostname != 'localhost') {
				this.api = `${location.protocol}//${location.hostname}`
				if (!isNaN(location.port)) this.api += `:${3000}`
			}

			// socket connection
			this.socket = io(this.api)
			this.socket.on('connect', () => console.log(`socket connected on ${this.socket.id}`))
			this.socket.on('order_finished', data => { // notification for finished order
				try {
					let { id } = JSON.parse(localStorage.order_data)

					if (data.user_id == id) {
						this.showFinished('You have a completed order!')
						document.getElementById('audio').play()
						window.navigator.vibrate([350, 350, 350, 350, 350])
					}
				} catch {}
			})
			this.socket.on('update_order', () => {
				try {
					let { type } = JSON.parse(localStorage.order_data)

					if (type == 'kitchen') {
						document.getElementById('audio').play()
						window.navigator.vibrate([350, 350, 350, 350, 350])
					}
				} catch {}
			})
			
			try { // resume session
				let { type, username, name } = JSON.parse(localStorage.order_data)
				axios.get(`${this.api}/api/user?type=${type}&username=${username}`)
					.then(result => {
						// check if url matches user type
						if (!result.data.success) return this.destroy()

						this.name = name
						
						if (location.pathname != `/${type}`) location.assign(type)
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
		<audio id="audio" src="http://localhost:3000/notification.wav" hidden></audio>
		<v-app>
			<v-app-bar dense dark elevation="1" max-height="auto" app>
				<v-app-bar-nav-icon @click="drawer = false" v-if="false"></v-app-bar-nav-icon>
				<v-app-bar-title>{{ name }}</v-app-bar-title>
				<v-spacer></v-spacer>
				<v-btn text @click="destroy" small>
					<v-icon>mdi-logout</v-icon>
					Logout
				</v-btn>

				<v-dialog v-model="finishedDialog.show" width="400px">
					<v-card class="pa-7">
						<v-card-text>
							<div class="d-flex items-center">
								<!-- <v-icon x-large class="mr-4 green--text">mdi-check</v-icon> -->
								<p class="text-h5 text-center ma-0">{{ finishedDialog.text }}</p>
							</div>
						</v-card-text>
						<div class="d-flex justify-center grow-1 mt-5">
							<v-btn text color="green" @click="changeTab(2)">
								<v-icon class="mr-3">mdi-check</v-icon>
								View
							</v-btn>
						</div>
					</v-card>
				</v-dialog>

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
						<component :is="item" class="grey lighten-3 pa-0 pa-sm-6 pa-md-12" :api="api" :socket="socket" />
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