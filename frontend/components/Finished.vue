<script setup>
	import axios from 'axios';
	import { reactive, onMounted } from 'vue';
	
	const props = defineProps({
		api: String,
		socket: Object
	})

	const state = reactive({
		items: [],
		panels: [],
	})
	
	const get_id = () => {
		try {
			return JSON.parse(localStorage.order_data).id
		} catch { return -1 }
	}

	const markDone = item => {
		axios.post(`${props.api}/api/order/done`, item)
			.then(result => {
				fetch_list()
				state.panels = []
			})
			.catch(err => console.error(err))
	}
	
	const fetch_list = () => {
		axios.get(`${props.api}/api/order?id=${get_id()}&status=finished`)
			.then(result => {
				if (result.data.success)
					state.items = result.data.list.map(item => ({
						id: item.id,
						table: item.table,
						status: item.status,
						description: item.description,
						order: item.items.map(i => i.name),
						price: getPrice(item.items),
						issued: new Date(parseInt(item.issued)).toLocaleTimeString()
					}))
			})
			.catch(err => console.log(err))
	}
	
	const getPrice = items => {
		let price = 0
		items.forEach(i => price += parseInt(i.price))
		return price
	}

	const get_title = title => {
		title = title.join(', ')
		return title.length>21 ? `${title.substr(0, 20)}...` : title
	}
	
	fetch_list()

	
	onMounted(() => {
		props.socket.on('order_finished', data => {
			fetch_list()
		})
	})
	</script>
	
	<template>
		<v-container fluid>
			<v-expansion-panels v-model="state.panels">
				<v-expansion-panel v-for="(item, i) in state.items" :key="i">
					<v-expansion-panel-header>
						<v-row align="center" class="mx-1 mx-sm-2 mx-md-3">
							<h4>{{ get_title(item.order) }}</h4>
							<v-spacer></v-spacer>
							<p class="ma-0">Table {{ item.table }}</p>
						</v-row>
					</v-expansion-panel-header>
					<v-expansion-panel-content>
						<v-row class="px-0 px-sm-3 px-md-6">
							<v-col cols="12" sm="4" md="2">
								<p class="ma-0 font-weight-bold">Items</p>
							</v-col>
							<v-col cols="12" sm="8" md="10">
								<p class="ma-0">{{ item.order.join(', ') }}</p>
							</v-col>
							<v-col cols="12" sm="4" md="2">
								<p class="ma-0 font-weight-bold">Price</p>
							</v-col>
							<v-col cols="12" sm="8" md="10">
								<p class="ma-0">{{ item.price }}</p>
							</v-col>
							<v-col cols="12" sm="4" md="2">
								<p class="ma-0 font-weight-bold">Descritption</p>
							</v-col>
							<v-col cols="12" sm="8" md="10">
								<p class="ma-0">{{ item.description }}</p>
							</v-col>
							<v-col cols="12" sm="4" md="2">
								<p class="ma-0 font-weight-bold">Status</p>
							</v-col>
							<v-col cols="12" sm="8" md="10">
								<v-chip color="green darken-2" dark>{{ item.status }}</v-chip>
							</v-col>
							<v-col cols="12" sm="4" md="2">
								<p class="ma-0 font-weight-bold">Order Time</p>
							</v-col>
							<v-col cols="12" sm="8" md="10">
								<v-chip color="green darken-2" dark>{{ item.issued }}</v-chip>
							</v-col>
							<v-col cols="12" v-if="true">
								<div class="d-flex justify-end">
									<v-spacer></v-spacer>
									<v-btn color="primary" small @click="markDone(item)">
										<span class="mr-1">Mark as done</span>
										<v-icon>mdi-check</v-icon>
									</v-btn>
								</div>
							</v-col>
						</v-row>
					</v-expansion-panel-content>
				</v-expansion-panel>
			</v-expansion-panels>
		</v-container>
	</template>