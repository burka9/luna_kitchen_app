<script setup>
import { computed, reactive } from 'vue';
import axios from 'axios';

const state = reactive({
	dialog: false,
	tables: [],
	menu_list: [],
	order: {
		id: '',
		items: [],
		description: '',
		issued: null,
		table: null,
	},
	snackbar: {
		toggle: false,
		text: '',
		color: 'red',
		show: (text, color = 'error') => {
			state.snackbar.toggle = true
			state.snackbar.text = text
			state.snackbar.color = color
		}
	},
})


const selectedList = computed(() => state.menu_list.filter(i => i.selected))
const price = computed(() => {
	let price = 0
	state.menu_list.filter(i => i.selected).forEach(i => price += parseInt(i.price))
	return price
})

const clear = () => {
	state.order = {
		id: '',
		items: [],
		description: '',
		issued: null,
		table: null,
	}
	state.menu_list.forEach(item => item.selected = false)
}

const submit = () => {
	state.order.items = state.menu_list.filter(i => i.selected).map(i => i.id)
	state.order.issued = new Date().getTime()
	try {
		state.order.id = JSON.parse(localStorage.order_data).id
	} catch {}

	if (state.order.items.length > 0) {
		// do submit order request
		axios.post('/api/order', state.order)
			.then(result => {
				// show success message here
				if (result.data.success) {
					state.snackbar.show('Item successfully created!', 'primary')
				} else {
					state.snackbar.show('Somthing went wrong!')
				}
			})
			.catch(err => {
				// show error message here
				state.snackbar.show('Somthing went wrong!')
				console.log(err)
			})
			.then(() => clear())
	}
}

const init = () => {
	axios.get('/api/table?sort=true')
		.then(result => {
			if (result.data.success)
				state.tables = result.data.list.map(table => ({ text: `Table ${table.table_index}`, value: table.table_index }))
		})
		.catch(err => console.error(err))
	axios.get('/api/menu-item')
		.then(result => {
			if (result.data.success)
				state.menu_list = result.data.list.map(item => ({ ...item, selected: false }))
		})
		.catch(err => console.error(err))
}

init()
</script>

<template>
	<div>
		<v-snackbar v-model="state.snackbar.toggle" :timeout="3500" top :color="state.snackbar.color" elevation="3">
			<span class="text-subtitle-1">{{ state.snackbar.text }}</span>
		</v-snackbar>

		<v-dialog v-model="state.dialog" fullscreen>
			<v-card>
				<v-app-bar dark small color="primary">
					<v-btn icon dark @click="state.dialog = false">
						<v-icon>mdi-close</v-icon>
					</v-btn>
					<v-app-bar-title>Menu</v-app-bar-title>
					<v-spacer></v-spacer>
					<v-btn dark text @click="state.dialog = false">Save</v-btn>
				</v-app-bar>

				<v-card-title>Menu List</v-card-title>
				<v-card-text>
					<v-virtual-scroll height="240px" itemHeight="40px" :items="state.menu_list">
						<template v-slot:default="{ item }">
							<div class="d-flex justify-between" :disabled="!item.available">
								<v-checkbox class="ma-0 mr-auto" v-model="item.selected" small hide-details :label="item.name"></v-checkbox>
								<p class="ma-0 mr-4">{{ item.price }}</p>
							</div>
							<v-divider></v-divider>
						</template>
					</v-virtual-scroll>
					<v-card-title>Selected Items</v-card-title>
					<div class="d-flex flex-wrap">
						<v-chip v-for="item in selectedList" :key="item.id" class="ma-1" dark @click="item.selected = false">{{ item.name }}</v-chip>
					</div>
				</v-card-text>
			</v-card>
		</v-dialog>

		<v-container>
			<v-row align="center">
				<v-col cols="3">
					<div class="d-flex flex-column">
						<p class="ma-0 font-weight-bold">Items:{{ selectedList.length }}</p>
						<p class="ma-0 font-weight-bold">Price:{{ price }}</p>
					</div>
				</v-col>
				<v-col cols="9" sm="6">
					<div class="d-flex flex-wrap">
						<v-chip v-for="item in selectedList" :key="item.id" class="ma-1" dark @click="item.selected = false">{{ item.name }}</v-chip>
					</div>
				</v-col>
				<v-col cols="12" sm="3" align="center" justify="center">
					<v-btn rounded small color="primary" @click="state.dialog = true">
						<span>Add Items</span>
						<v-icon>mdi-plus</v-icon>
					</v-btn>
				</v-col>
			</v-row>
			<v-row>
				<v-col cols="12">
					<v-select v-model="state.order.table" dense solo :items="state.tables" label="Table" />
				</v-col>
			</v-row>
			<v-row>
				<v-col cols="12">
					<v-textarea v-model="state.order.description" clearable dense solo label="Description" />
				</v-col>
			</v-row>
			<v-row>
				<v-col cols="12" align="right">
					<v-btn color="primary" small @click="submit">Submit</v-btn>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>
