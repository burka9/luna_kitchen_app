<script setup>
	import axios from 'axios';
	import { reactive } from 'vue';
	
	const state = reactive({
		items: [],
		panels: [],
	})
	
	
	const fetch_list = () => {
		axios.get(`/api/order?status=pending`)
			.then(result => {
				if (result.data.success)
					state.items = result.data.list.map(item => ({
						id: item.id,
						table: item.table,
						status: item.status,
						user_name: item.user.name,
						description: item.description,
						order: item.items.map(i => i.name),
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
	
	const get_title = title => {
		title = title.join(', ')
		return title.length>21 ? `${title.substr(0, 20)}...` : title
	}
	
	fetch_list()
	</script>
	
	<template>
		<v-container fluid>
			<v-expansion-panels v-model="state.panels">
				<v-expansion-panel v-for="(item, i) in state.items" :key="i">
					<v-expansion-panel-header>
						<v-row align="center" class="mx-1 mx-sm-2 mx-md-3">
							<h4>{{ get_title(item.order) }}</h4>
							<v-spacer></v-spacer>
							<p class="ma-0"><span class="fonr-weight-bold">Order By</span> {{ item.user_name }}</p>
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
								<v-chip color="orange lighten-2">{{ item.status }}</v-chip>
							</v-col>
							<v-col cols="12" sm="4" md="2">
								<p class="ma-0 font-weight-bold">Order Time</p>
							</v-col>
							<v-col cols="12" sm="8" md="10">
								<v-chip color="orange lighten-2">{{ item.issued }}</v-chip>
							</v-col>
							<v-col cols="12" v-if="true">
								<div class="d-flex justify-end">
									<v-spacer></v-spacer>
									<v-btn color="green darken-2" dark small @click="finish(item)">
										<span>Done</span>
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