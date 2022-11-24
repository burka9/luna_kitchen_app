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

const fetch_list = () => {
	axios.get(`${props.api}/api/table?sort=true`)
		.then(result => {
			if (result.data.success) {
				state.tables = result.data.list
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
					<v-card-title>Table {{ table.table_index }}</v-card-title>
					<v-card-actions>
						<v-btn color="error" depressed dense @click="removeTable(table)">Remove</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
			<v-col cols="12" sm="6" md="4" lg="3" align="center" fill-height>
				<v-btn fab color="primary" :disabled="state.adding" @click="addTable">
					<v-icon>mdi-plus</v-icon>
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

