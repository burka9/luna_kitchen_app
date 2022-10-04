<script setup>
	import axios from 'axios';
	import { reactive, ref } from 'vue';

	const requiredRule = val => !!val || 'Required!'

	const state = reactive({
		search: '',
		headers: [
			{ text: 'No', value: 'no', },
			{ text: 'Name', value: 'name', },
			{ text: 'Price', value: 'price', },
			{ text: 'Status', value: 'available', },
			{ text: 'Action', value: 'actions', sortable: false },
		],
		items: [],
		item: {
			id: '',
			name: '',
			price: '',
			available: true,
		},
		statuses: [
			{ text: 'Available', value: 1 },
			{ text: 'Not available', value: 0 },
		],
		rules: {
			name: [requiredRule],
			price: [requiredRule, v => (v && v >= 0) || 'Price should be positive.'],
		},
		dialog: false,
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
		editing: false,
		editIndex: -1,
		deletePrompt: false,
		deletingItem: null,
	})

	const itemForm = ref(null)

	const showDialog = () => {
		if (itemForm.value && itemForm.value.reset) itemForm.value.reset()
		state.dialog = true
	}
	const closeDialog = () => {
		itemForm.value.reset()
		state.dialog = false
	}

	const edit = item => {
		state.editing = true
		state.editIndex = state.items.indexOf(item)
		state.item = Object.assign({}, state.items[state.editIndex])
		state.dialog = true
		console.log(item)
	}
	const remove = item => {
		state.deletePrompt = true
		state.deletingItem = item
	}

	const createItem = () => {
		if (itemForm.value.validate())
			axios.post('/api/menu-item', state.item)
			.then(result => {
					if (result.data.success) {
						// show success dialog
						state.snackbar.show('Item successfully created!', 'primary')
						fetch_list()
					}
					else state.snackbar.show('Somthing went wrong!')
				})
				.catch(err => {
					// show failed dialog
					state.snackbar.show('Somthing went wrong!')
					console.log(err)
				})
				.then(() => closeDialog())
	}
	const confirmEdit = () => {
		if (itemForm.value.validate())
			axios.put('/api/menu-item', state.item)
				.then(result => {
					if (result.data.success) {
						// show success dialog
						state.snackbar.show('Item successfully edited!', 'primary')
						fetch_list()
					}
					else state.snackbar.show('Somthing went wrong!')
				})
				.catch(err => {
					// show failed dialog
					state.snackbar.show('Somthing went wrong!')
					console.log(err)
				})
				.then(() => closeDialog())
	}
	const confirmRemove = () => {
		axios.delete('/api/menu-item', { data: state.deletingItem })
			.then(result => {
				if (result.data.success) {
					// show success dialog
					state.snackbar.show('Item successfully deleted!', 'primary')
					fetch_list()
				}
				else state.snackbar.show('Somthing went wrong!')
			})
			.catch(err => {
				// show failed dialog
				state.snackbar.show('Somthing went wrong!')
				console.log(err)
			})
			.then(() => state.deletePrompt = false)
	}

	const fetch_list = () => {
		axios.get('/api/menu-item')
			.then(result => {
				if (!result.data.success) return
				state.items = []
				state.items = result.data.list
				state.items.forEach(item => Object.keys(item).forEach(key => item[key] = item[key] == 'null' ? '' : item[key]))
			})
			.catch(err => console.log(err))
	}

	const availability = item => {
		let { id, name, price, available } = item

		axios.put('/api/menu-item', { id, name, price, available: !available })
			.then(result => {
				if (result.data.success) item.available = !item.available
			})
			.catch(err => console.log(err))
	}
	
	fetch_list()
</script>
	
	<template>
		<v-container class="grey lighten-3 p-10" fluid style="padding: 2rem">
			<v-snackbar v-model="state.snackbar.toggle" :timeout="3500" top :color="state.snackbar.color" elevation="3">
				<span class="text-subtitle-1">{{ state.snackbar.text }}</span>
			</v-snackbar>

			<v-dialog v-model="state.deletePrompt" width="400px">
			<v-card>
				<v-card-title>
					<p display="text-h6">Delete Item?</p>
				</v-card-title>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="error" dense @click="confirmRemove">Yes</v-btn>
					<v-btn color="primary" dense @click="state.deletePrompt = false">No</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

			<v-dialog v-model="state.dialog" width="400px">
				<v-card>
					<v-card-title>
						<span>{{ state.editing ? 'Edit Item' : 'Create Item' }}</span>
					</v-card-title>
					<v-card-text>
						<v-container>
							<v-form ref="itemForm">
								<v-row>
									<v-col cols="12" md="6">
										<v-text-field dense v-model="state.item.name" label="Name" :rules="state.rules.name" />
									</v-col>
									<v-col cols="12" md="6">
										<v-text-field dense v-model="state.item.price" label="Price" type="number" :rules="state.rules.price" @keydown.enter="state.editing ? confirmEdit() : createItem()" />
									</v-col>
									<v-col cols="12" md="6" v-if="state.editing">
										<v-select v-model="state.item.available" :items="state.statuses" label="Status" dense></v-select>
									</v-col>
								</v-row>
							</v-form>
						</v-container>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="error" @click="closeDialog">Close</v-btn>
						<v-btn color="primary" @click="state.editing ? confirmEdit() : createItem()">{{ state.editing ? 'Edit' : 'Save' }}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
			
			<v-card>
				<v-card-title>
					<v-text-field v-model="state.search" append-icon="mdi-magnify" label="Search" single-line hide-details />
					<v-spacer></v-spacer>
					<v-btn class="blue white--text" @click="showDialog" small>
						Create new Menu Item
					</v-btn>
				</v-card-title>
				<v-data-table :headers="state.headers" :items="state.items" :search="state.search" dense :items-per-page="5">
					<template v-slot:item.no="{ item, index }">
						{{ index + 1 }}
					</template>

					<template v-slot:item.available="{ item }">
						<v-chip class="pointer" :color="item.available ? 'primary' : 'error'" label small @click="availability(item)">
							{{ item.available ? 'Available' : 'Not available' }}
						</v-chip>
					</template>
					
					<template v-slot:item.actions="{ item }">
						<v-icon small color="primary" class="mr-2" @click="edit(item)">
							mdi-pencil
						</v-icon>
						<v-icon small color="error" @click="remove(item)">
							mdi-delete
						</v-icon>
					</template>
				</v-data-table>
			</v-card>
		</v-container>
	</template>


<style scoped>
	.pointer {
		cursor: pointer;
	}
	</style>