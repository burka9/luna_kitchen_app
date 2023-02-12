<script setup>
	import axios from 'axios';
	import { reactive, onMounted, computed, onUpdated } from 'vue';
	
	const props = defineProps({
		api: String,
		socket: Object
	})
	
	const state = reactive({
		orders: [],
		newItem: null,
	})
	
	const ordersList = computed(() => state.orders)
	
	const fetch_list = (oldList = null) => {
		axios.get(`${props.api}/api/order?from=kitchen`)
			.then(result => {
				if (result.data.success) {
					state.orders = result.data.list.map(item => ({
						id: item.id,
						table: item.table,
						status: item.status,
						user_name: item.user ? item.user.name : '',
						description: item.description,
						canceled: item.status == 'canceled',
						// items: item.items.map(i => ({ name: i.name, done: false })),
						items: item.items.map(i => i.name),
						price: getPrice(item.items),
						issued: new Date(parseInt(item.issued)).toLocaleTimeString()
					}))

					if (oldList != null) {
						state.newItem = state.orders.filter(newItem => !oldList.some(oldItem => oldItem.id === newItem.id))[0];
					}
				}
			})
			.catch(err => console.log(err))
	}
	
	const finish = item => {
		axios.post(`${props.api}/api/order/finish`, item)
			.then(result => {
				fetch_list()
				state.panels = []
			})
			.catch(err => console.error(err))
	}
	
	const getPrice = items => {
		let price = 0
		items.forEach(i => price += parseInt(i.price))
		return price
	}

	const archive = item => {
		axios.post(`${props.api}/api/order/archive-canceled`, item)
			.then(result => {
				fetch_list()
				state.panels = []
			})
			.catch(err => console.error(err))
	}


	const uniqueItems = items => {
		let temp = {}
		
		items.forEach(item => {
			temp = {...temp, [item]: items.filter(i => i == item).length}
		})

		// name, count
		return Object.entries(temp).map(([key, value]) => ({
			name: key,
			count: value
		}))
	}
	
	fetch_list()

	onUpdated(() => {
		if (state.newItem) {
			// console.log('new item added and updated view')
			const el = document.getElementById(`order-view-${state.newItem.id}`)
			
			if (el)
				if (el.classList)
					if (el.classList.add)
						el.classList.add('the-new-item')
			// setTimeout(() => {
			// 	state.newItem.classList.remove('the-new-item')
			// }, 5000)
		}
	})

	onMounted(() => {
		props.socket.on('update_order', () => {
			// console.log('show notification for new order')
			
			try {
				let { type } = JSON.parse(localStorage.order_data)

				if (type == 'kitchen') {
					document.getElementById('audio').play()
					window.navigator.vibrate([350, 350, 350, 350, 350])

					// mark the new order
					fetch_list([...state.orders])
				}
			} catch {}
		})
		props.socket.on('archived_an_order', () => {
			fetch_list()
		})
		props.socket.on('order_canceled', order => {
			try {
				let { type } = JSON.parse(localStorage.order_data)

				if (type == 'kitchen') {
					document.getElementById('audio').play()
					window.navigator.vibrate([350, 350, 350, 350, 350])

					// mark the canceled order
					fetch_list()
				}
			} catch {}
		})
	})
	</script>
	
	<template>
		<v-container fluid>
			<div class="d-flex flex-wrap">
				<v-card v-for="order in ordersList" :key="`order-${order.id}`" :class="{
					'ma-3': true,
					'red white--text': order.canceled
				}" :id="`order-view-${order.id}`" style="width: 400px">
					<v-list-item>
						<v-list-item-content>
							<v-list-item-title :class="{'text-h5': true, 'white--text': order.canceled}">
								{{ order.user_name }}'s order
							</v-list-item-title>
							<v-list-item-subtitle :class="{'text-subtitle-1': true, 'white--text': order.canceled}">{{ order.description }}</v-list-item-subtitle>
							<span>Ref: {{ order.id }}</span>
						</v-list-item-content>
						<p :class="{'ma-0 text-subtitle-1': true, 'white--text': order.canceled}">{{ Number(order.price).toFixed(2) }}</p>
						<p :class="{'ma-0 mx-2 text-subtitle-1': true, 'white--text': order.canceled}">-</p>
						<p :class="{'ma-0 text-subtitle-1': true, 'white--text': order.canceled}">Table {{ order.table }}</p>
					</v-list-item>
					<v-divider class="mx-12"></v-divider>
					<v-card-text class="grow-1">
						<v-container fill-height>
							<v-chip v-for="(item, index) in uniqueItems(order.items)" :key="`items-${index}`" color="warning" class="pointer ma-3 my-2">
								<v-avatar left>{{ item.count }}</v-avatar>
								<span class="wrap-me">{{ item.name }}</span>
							</v-chip>
						</v-container>
						<v-divider class="mx-10 my-3"></v-divider>
						<v-card-actions class="d-flex justify-space-between align-center">
							<p :class="{'ma-0 text-subtitle-2': true, 'white--text': order.canceled}">{{ order.issued }}</p>
							<v-btn dark class="white red--text" @click="archive(order)" v-if="order.canceled">Cancel</v-btn>
							<v-btn dark color="green" @click="finish(order)" v-else>Finish All</v-btn>
						</v-card-actions>
					</v-card-text>
				</v-card>
			</div>
		</v-container>
	</template>


<style scoped>
.pointer {
	cursor: pointer;
}
.v-chip {
	height: auto;
	white-space: normal;
}

@keyframes pulsate {
	0% {
		background-color: white;
	} 50% {
		background-color: aquamarine;
	} 100% {
		background-color: white;
	}
}
.the-new-item {
	animation: pulsate 1.2s ease-in-out 4;
}
</style>