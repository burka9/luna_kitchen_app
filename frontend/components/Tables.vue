<script setup>
import axios from 'axios';
import { reactive } from 'vue';

const props = defineProps({
	api: String,
})

const state = reactive({
	tables: [],
	adding: false,
})

const addTable = () => {
	state.adding = true
	axios.post(`${props.api}/api/table`)
		.then(result => {
			if (result.data.success) fetch_list()
		})
		.catch(err => console.log(err))
		.then(() => state.adding = false)
}

const removeTable = table => {
	axios.delete(`${props.api}/api/table`, { data: table })
		.then(result => {
			if (result.data.success) fetch_list()
		})
		.catch(err => console.log(err))
}

const fetch_orders = () => {
	axios.get(`${props.api}/api/order?status=pending`)
		.then(result => {
			if (result.data.success)
				result.data.list.forEach(order => {
					let index = state.tables.findIndex(table => table.table_index == order.table)
					state.tables[index]['order'] = order
				})
		})
		.catch(err => console.error(err))
}

const fetch_list = () => {
	axios.get(`${props.api}/api/table?sort=true`)
		.then(result => {
			if (result.data.success) {
				state.tables = result.data.list
				// fetch_orders()
			}
		})
		.catch(err => console.log(err))
}

fetch_list()
</script>

<template>
	<v-container fluid>
		<v-row align="center">
			<v-col cols="12" sm="6" md="4" lg="3" v-for="(table, index) in state.tables" :key="index">
				<v-card elevation="3">
					<v-card-title class="text-h6">Table {{ table.table_index }}</v-card-title>
					<v-card-actions>
						<v-btn color="error" depressed small dense @click="removeTable(table)">Remove</v-btn>
					</v-card-actions>
					<!-- <v-card-text>
						<v-row>
							<v-col cols="12" md="4">
								<p class="text-h6">Table {{ table.table_index }}</p>
								<v-btn color="error" depressed small dense @click="removeTable(table)">Remove</v-btn>
							</v-col>
							<v-col cols="12" md="8" v-if="table.order">
								<p><b>Issued by:</b> {{ table.order.user.name }}</p>
								<p><b>Orders:</b> {{ table.order.items.map(item => item.name).join(', ') }}</p>
							</v-col>
						</v-row>
					</v-card-text> -->
				</v-card>
			</v-col>
			<v-col cols="12" sm="6" md="4" lg="3" align="center" fill-height>
				<v-btn color="primary" :disabled="state.adding" @click="addTable">
					<span class="mr-3">Add Table</span>
					<v-icon>add</v-icon>
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

