<script setup>
import axios from 'axios';
import { reactive } from 'vue';

	const state = reactive({
		tables: [],
	})

	const addTable = () => {
		axios.post('/api/table')
			.then(result => {
				if (result.data.success) fetch_list()
			})
			.catch(err => console.log(err))
	}

	const removeTable = table => {
		axios.delete('/api/table', { data: table })
			.then(result => {
				if (result.data.success) fetch_list()
			})
			.catch(err => console.log(err))
	}

	const fetch_list = () => {
		axios.get('/api/table')
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
	<v-container class="grey lighten-3 p-10" fluid style="padding: 2rem">
		<v-row align="center">
			<v-col cols="12" sm="6" md="4" lg="3" v-for="(table, index) in state.tables">
				<v-card
					elevation="3"
				>
					<v-card-title>Table {{ index + 1 }}</v-card-title>
					<v-card-actions>
						<v-btn color="error" depressed dense @click="removeTable(table)">Remove</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
			<v-col cols="12" sm="6" md="4" lg="3" align="center" fill-height>
				<v-btn fab color="primary" @click="addTable">
					<v-icon>mdi-plus</v-icon>
				</v-btn>
			</v-col>
		</v-row>
	</v-container>
</template>

