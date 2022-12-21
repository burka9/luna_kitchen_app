<script setup>
import axios from 'axios';
import { reactive, computed, onMounted } from 'vue'

const props = defineProps({
	api: String,
	socket: Object,
})

const state = reactive({
	filter: {
		waiter: -1,
		status: 'All',
		date: null,
	},
	waiters: [],
	expanded: [],
	statuses: {
		'all': 'All',
		'archived': 'Archived',
		'pending': 'Pending',
		'canceled': 'Canceled',
		'finished': 'Completed'
	},
	headers: [
		{ text: 'No', value: 'no' },
		{ text: 'Waiter Name', value: 'waiter.name' },
		{ text: 'Issue Date', value: 'issue_date' },
		{ text: 'Cancel Date', value: 'cancel_date' },
		{ text: 'Serve Date', value: 'serve_date' },
		{ text: 'Complete Date', value: 'complete_date' },
		{ text: 'Status', value: 'status' },
		{ text: 'Price', value: 'price' },
		{ text: '', value: 'data-table-expand' },
	],
	options: {
		singleExpland: true
	},
	items: []
})

const fetch_list = () => {
	axios.get(`${props.api}/api/report/detail`)
		.then(result => {
			if (result.data.success) state.items = result.data.list
		})
		.catch(err => console.error(err))
}

const filteredItems = computed(() => {
	return state.items.map(item => {
		// item.issue_date = item.issue_date ? new Date(parseInt(item.issue_date)).toDateString() : ''
		// item.cancel_date = item.cancel_date ? new Date(parseInt(item.cancel_date)).toDateString() : ''
		// item.serve_date = item.serve_date ? new Date(parseInt(item.serve_date)).toDateString() : ''
		// item.complete_date = item.complete_date ? new Date(parseInt(item.complete_date)).toDateString() : ''
		item.price = 0
		item.items.forEach(i => item.price += parseInt(i.total_price))
		
		if (state.filter.waiter != -1 && state.filter.waiter != item.waiter.id) return 'exclude'
		if (state.filter.status != 'All' && state.filter.status != state.statuses[item.status]) return 'exclude'

		if (
			state.filter.date != null
			&& new Date(state.filter.date).toDateString().toString() != new Date(parseInt(item.issue_date)).toDateString().toString()
		) return 'exclude'
		
		return item
	}).filter(item => item != 'exclude')
})

const clearFilter = () => {
	state.filter.waiter = -1
	state.filter.status = 'All'
	state.filter.date = null
}

const fetch_waiters = () => {
	axios.get(`${props.api}/api/user?type=waiter`)
		.then(result => {
			if (result.data.success) state.waiters = result.data.list
		})
		.catch(err => console.error(err))
}

onMounted(() => {
	fetch_list()
	fetch_waiters()
})
</script>

<template>
	<v-container fluid>

		<v-row class="mb-5">
			<v-col cols="2">
				<v-select dense  label="Filter by Waiter" :items="state.waiters" item-text="name" item-value="id" v-model="state.filter.waiter"></v-select>
			</v-col>
			<v-col cols="2">
				<v-select dense  label="Filter by Status" :items="Object.values(state.statuses)" v-model="state.filter.status"></v-select>
			</v-col>
			<v-col cols="2">
				<v-text-field dense  label="Filter by Issued Date" type="date" v-model="state.filter.date"></v-text-field>
			</v-col>
			<v-col cols="2">
				<v-btn color="primary" @click="clearFilter">Clear All</v-btn>
			</v-col>
		</v-row>
		
		<v-data-table :headers="state.headers" :items="filteredItems" class="elevation-3" show-expand item-key="id" :single-expand="true" :expanded.sync="state.expanded">
			<template v-slot:item.no="{ item, index }">
				{{ index + 1 }}
			</template>
			<template v-slot:item.status="{ item }">
				{{ state.statuses[item.status] }}
			</template>
			<template v-slot:item.issue_date="{ item }">
				{{ item.issue_date ? new Date(parseInt(item.issue_date)).toDateString() : '' }}
			</template>
			<template v-slot:item.cancel_date="{ item }">
				{{ item.cancel_date ? new Date(parseInt(item.cancel_date)).toDateString() : '' }}
			</template>
			<template v-slot:item.serve_date="{ item }">
				{{ item.serve_date ? new Date(parseInt(item.serve_date)).toDateString() : '' }}
			</template>
			<template v-slot:item.complete_date="{ item }">
				{{ item.complete_date ? new Date(parseInt(item.complete_date)).toDateString() : '' }}
			</template>
			<template v-slot:expanded-item="{ item }">
				<td :colspan="state.headers.length">
					<v-container fluid class="pa-8 px-16">
						<v-simple-table dense>
							<template v-slot:default>
								<thead>
									<tr>
										<th class="text-left">Item</th>
										<th class="text-left">Quantity</th>
										<th class="text-left">Unit Price</th>
										<th class="text-left">Total Price</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="item in item.items" :key="item.name">
										<td>{{ item.name }}</td>
										<td>{{ item.quantity }}</td>
										<td>{{ item.unit_price }}</td>
										<td>{{ item.total_price }}</td>
									</tr>
								</tbody>
							</template>
						</v-simple-table>
					</v-container>
				</td>
			</template>
		</v-data-table>
	</v-container>
</template>

<style>
</style>