<script setup>
	import axios from 'axios';
	import { reactive } from 'vue';
	
	const state = reactive({
		orders: [],
	})
	
	
	const fetch_list = () => {
		axios.get(`/api/order?status=pending`)
			.then(result => {
				if (result.data.success)
					state.orders = result.data.list.map(item => ({
						id: item.id,
						table: item.table,
						status: item.status,
						user_name: item.user.name,
						description: item.description,
						items: item.items.map(i => ({ name: i.name, done: false })),
						price: getPrice(item.items),
						issued: new Date(parseInt(item.issued)).toLocaleTimeString()
					}))
			})
			.catch(err => console.log(err))
	}
	
	const finish = item => {
		axios.post('/api/order/finish', item)
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

	
	fetch_list()
	</script>
	
	<template>
		<v-container fluid>
			<div class="d-flex flex-wrap">
				<v-card v-for="order in state.orders" :key="`order-${order.id}`" class=" ma-3" style="max-width: 400px">
					<v-list-item>
						<v-list-item-content>
							<v-list-item-title class="text-h5">{{ order.user_name }}'s order'</v-list-item-title>
							<v-list-item-subtitle class="text-subtitle-1">{{ order.description }}</v-list-item-subtitle>
						</v-list-item-content>
						<p class="ma-0 text-subtitle-1">{{ Number(order.price).toFixed(2) }}</p>
					</v-list-item>
					<v-divider class="mx-12"></v-divider>
					<v-card-text class="grow-1">
						<v-container fill-height>
							<v-chip v-for="(item, index) in order.items" :key="`items-${index}`" class="pointer ma-3 my-2" :color="item.done && false ? 'primary' : 'warning'" @click="item.done = !item.done">
							{{ item.name }}
						</v-chip>
						</v-container>
						<v-divider class="mx-10 my-3"></v-divider>
						<v-card-actions class="d-flex justify-space-between align-center">
							<p class="ma-0 subtitle-2">{{ order.issued }}</p>
							<v-btn dark color="green" @click="finish">Finish All</v-btn>
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
</style>