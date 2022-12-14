<script setup>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';

const requiredRule = [val => !!val || 'Required Field!']

const itemForm = ref(null)
const categoryForm = ref(null)

const props = defineProps({
	api: String,
	socket: Object,
})

const CATEGORY = 1
const SUBCATEGORY = 2
const ITEM = 3

const state = reactive({
	snackbar: {
		toggle: false,
		text: '',
		color: 'red',
		override: false,
		show: (text, color = 'error') => {
			if (state.snackbar.override) return state.snackbar.override = false
			state.snackbar.toggle = true
			state.snackbar.text = text
			state.snackbar.color = color
		}
	},
	delete: {
		show: false,
		item: null,
		text: '',
		type: '',
		toggle: (item, type) => {
			state.delete.item = item
			state.delete.type = type
			state.delete.text = type=='category'
			? `Delete category "${item.name}" and all items within?`
			: type=='subcategory'
			? `Delete subcategory "${item.name}" and all items within?`
			: `Delete item "${item.name}"?`
			state.delete.show = true
		},
		close: () => {
			state.delete.item = null
			state.delete.show = false
		},
		confirm: () => state.delete.type=='category'
			? deleteCategory()
			: state.delete.type=='subcategory'
			? deleteSubcategory()
			: deleteItem()
	},
	window: {
		value: 1,
		home: () => {
			state.window.value = 1
			state.category = null
			state.subcategory.item = {}
			state.categorySection = true
		},
		category: category => {
			state.window.value = 2
			state.category = category
			state.categorySection = false
		},
	},
	categories: [],
	items: [],

	category: null,

	subcategory: {
		headers: [
			{ text: 'No', value: 'no' },
			{ text: 'Maraki ID', value: 'maraki_id' },
			{ text: 'Item Name', value: 'name' },
			{ text: 'Price', value: 'price' },
			{ text: 'Status', value: 'available' },
			{ text: 'Actions', value: 'actions', sortable: false },
		],
		search: '',
		item: {},
		set: item => {
			state.subcategory.item = { ...item }
			state.subcategory.item.children = state.items.filter(item => item.category_id === state.category.id && item.subcategory_id === state.subcategory.item.id)
		},
		update: () => {
			state.subcategory.set(state.category.children.find(child => child.id === state.subcategory.item.id))
		},
		reset: () => {
			state.subcategory.item = {}
		}
	},

	categorySection: true,
	selectItems: [
		{ text: 'Available', value: 1 },
		{ text: 'Not Available', value: 0 },
	],

	dialog: {
		category: {
			show: false,
			id: -1,
			name: '',
			detail: '',
			printer: '',
			editing: false,
			toggle: item => {
				if (categoryForm.value && categoryForm.value.reset) categoryForm.value.reset()
				state.dialog.category.show = true
				state.dialog.category.editing = false
				if (item) {
					state.dialog.category.editing = true
					state.dialog.category.id = item.id
					state.dialog.category.name = item.name
					state.dialog.category.detail = item.detail ? item.detail : ''
					state.dialog.category.printer = item.printer ? item.printer : ''
				}
			},
			close: () => {
				state.dialog.category.id = -1
				state.dialog.category.name = ''
				state.dialog.category.detail = ''
				state.dialog.category.show = false
				state.dialog.category.printer = ''
			},
			save: () => {
				if (categoryForm.value.validate())
					state.categorySection
					? (state.dialog.category.editing ? editCategory() : createNewCategory())
					: (state.dialog.category.editing ? editSubcategory() : createNewSubcategory())
			}
		},
		item: {
			show: false,
			id: -1,
			maraki_id: '',
			name: '',
			detail: '',
			price: '',
			available: 1,
			editing: false,
			toggle: item => {
				if (itemForm.value && itemForm.value.reset) itemForm.value.reset()
				state.dialog.item.show = true
				state.dialog.item.editing = false
				if (item) {
					state.dialog.item.editing = true
					state.dialog.item.id = item.id
					state.dialog.item.maraki_id = item.maraki_id
					state.dialog.item.name = item.name
					state.dialog.item.detail = item.detail
					state.dialog.item.price = item.price
					state.dialog.item.available = item.available ? 1 : 0
				}
			},
			close: () => {
				state.dialog.item.id = -1
				state.dialog.item.maraki_id = ''
				state.dialog.item.name = ''
				state.dialog.item.detail = ''
				state.dialog.item.price = ''
				state.dialog.item.available = 1
				state.dialog.item.editing = false
				state.dialog.item.show = false
			},
			save: () => {
				state.dialog.item.editing ? editItem() : createItem()
			}
		},
	},
	printers: []
})

const fetch_printers = () => {
	axios.get(`${props.api}/api/printer`)
		.then(result => {
			if (result.data.success) state.printers = result.data.list
		})
		.catch(err => console.error(err))
}

const completed = (result, text = 'Successful!') => {
	if (result.data.success) {
		state.snackbar.show(text, 'primary')
		fetch_category()
	}
	else state.snackbar.show('Something went wrong!')
}
const error = err => {
	state.snackbar.show('Something went wrong!')
	console.error(err)
}
const udpateCategorySection = () => {
	state.category = state.categories.find(cat => {
		if (cat.id)
		return cat.id === state.category.id
	})
	if (state.subcategory.item.id) state.subcategory.update()
}

const toggleStatus = item => {
	state.dialog.item.id = item.id
	state.dialog.item.maraki_id = item.maraki_id
	state.dialog.item.name = item.name
	state.dialog.item.detail = item.detail
	state.dialog.item.price = item.price
	state.dialog.item.available = !item.available
	state.dialog.item.category_id = item.category_id
	state.dialog.item.subcategory_id = item.subcategory_id
	state.snackbar.override = true
	editItem(true)
}

// category functions
const createNewCategory = () => {
	axios.post(`${props.api}/api/category`, {
		name: state.dialog.category.name,
		detail: state.dialog.category.detail ? state.dialog.category.detail : '',
		type: state.dialog.category.printer
	})
		.then(result => completed(result, 'Category created!'))
		.catch(error)
		.then(() => state.dialog.category.close())
}
const editCategory = () => {
	axios.put(`${props.api}/api/category`, {
		id: state.dialog.category.id,
		name: state.dialog.category.name,
		detail: state.dialog.category.detail
	})
		.then(result => completed(result, 'Category edited!'))
		.catch(error)
		.then(() => state.dialog.category.close())
}
const deleteCategory = () => {
	axios.delete(`${props.api}/api/category`, { data: { id: state.delete.item.id } })
		.then(result => completed(result, 'Category deleted!'))
		.catch(error)
		.then(state.delete.close)
}

// subcategory functions
const createNewSubcategory = () => {
	axios.post(`${props.api}/api/subcategory`, {
		name: state.dialog.category.name,
		detail: state.dialog.category.detail ? state.dialog.category.detail : '',
		category: state.category.id
	})
		.then(result => completed(result, 'Subcategory created!'))
		.catch(error)
		.then(() => state.dialog.category.close())
}
const editSubcategory = () => {
	axios.put(`${props.api}/api/subcategory`, {
		id: state.dialog.category.id,
		name: state.dialog.category.name,
		detail: state.dialog.category.detail
	})
		.then(result => {
			completed(result, 'Subcategory edited!')
		})
		.catch(error)
		.then(() => state.dialog.category.close())
}
const deleteSubcategory = () => {
	axios.delete(`${props.api}/api/subcategory`, { data: { id: state.subcategory.item.id } })
		.then(result => {
			completed(result, 'Category deleted!')
			state.subcategory.reset()
		})
		.catch(error)
		.then(state.delete.close)
}

// item functions
const createItem = () => {
	if (itemForm.value.validate())
		axios.post(`${props.api}/api/menu-item`, {
			maraki_id: state.dialog.item.maraki_id,
			name: state.dialog.item.name,
			detail: state.dialog.item.detail,
			price: state.dialog.item.price,
			available: state.dialog.item.available,
			category_id: state.category.id,
			subcategory_id: state.subcategory.item.id,
		})
			.then(result => completed(result, 'Item created!'))
			.catch(error)
			.then(() => state.dialog.item.close())
}
const editItem = (availableToggle = false) => {
	if ((itemForm.value && itemForm.value.validate && itemForm.value.validate()) || availableToggle)
		axios.put(`${props.api}/api/menu-item`, {
			id: state.dialog.item.id,
			maraki_id: state.dialog.item.maraki_id,
			name: state.dialog.item.name,
			detail: state.dialog.item.detail,
			price: state.dialog.item.price,
			available: state.dialog.item.available,
			category_id: state.category.id,
			subcategory_id: state.subcategory.item.id,
		})
			.then(result => completed(result, 'Item edited!'))
			.catch(error)
			.then(() => state.dialog.item.close())
}
const deleteItem = () => {
	axios.delete(`${props.api}/api/menu-item`, { data: { id: state.delete.item.id }})
		.then(result => completed(result, 'Item deleted!'))
		.catch(error)
		.then(() => state.delete.close())
}



// fetch data
const fetch_category = () => {
	axios.get(`${props.api}/api/category`)
		.then(result => {
			if (result.data.success) state.categories = result.data.list.map(cat => ({ ...cat, type: CATEGORY, children: [] }))
			fetch_subcategory()
		})
		.catch(err => console.error(err))
}

const fetch_subcategory = () => {
	state.categories.forEach(cat => {
		axios.get(`${props.api}/api/subcategory?category_id=${cat.id}`)
			.then(result => {
				cat.children = result.data.list.map(child => ({ ...child, type: SUBCATEGORY }))
				fetch_item()
			})
			.catch(err => console.error(err))
	})
}

const fetch_item = filter => {
	let temp = filter ? Object.keys(filter).map(key => (`${key}=${filter[key]}`)).join('&') : ''
	axios.get(`${props.api}/api/menu-item?${temp}`)
		.then(result => {
			if (result.data.success) {
				state.items = result.data.list.map(item => ({ ...item, type: ITEM }))
				if (!state.categorySection) udpateCategorySection()
			}
		})
		.catch(err => console.error(err))
}


fetch_category()
fetch_printers()

onMounted(() => {
	props.socket.on('update_menu', () => {
		fetch_category()
	})
})
</script>
	
<template>
	<v-container fluid>
		<v-snackbar v-model="state.snackbar.toggle" :timeout="3500" top :color="state.snackbar.color" elevation="3">
			<span class="text-subtitle-1">{{ state.snackbar.text }}</span>
		</v-snackbar>

		<!-- delete item promt -->
		<v-dialog v-model="state.delete.show" width="400px">
			<v-card>
				<v-card-title>
					<p class="text-h5" id="delete-p">{{ state.delete.text }}</p>
				</v-card-title>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="error" dense @click="state.delete.confirm">Yes</v-btn>
					<v-btn color="primary" dense @click="state.delete.close">No</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>


		<v-dialog v-model="state.dialog.category.show" width="350px">
			<v-card>
				<v-card-title>{{
					state.dialog.category.editing
					? `Edit ${state.categorySection ? 'Category' : 'Subcategory'}`
					: `New ${state.categorySection ? 'Category' : 'Subcategory'}`
				}}</v-card-title>
				<v-card-text>
					<v-form ref="categoryForm">
						<v-text-field label="Name" :rules="requiredRule" v-model="state.dialog.category.name"></v-text-field>
						<v-text-field label="Detail" v-model="state.dialog.category.detail"></v-text-field>
						<!-- <v-select label="Print Type" :items="state.printers" item-text="name" item-value="deviceId" v-model="state.dialog.category.printer" v-if="state.categorySection"></v-select> -->
						<v-select label="Category Type" :rules="requiredRule" :items="['Bar', 'Kitchen']" v-model="state.dialog.category.printer" v-if="state.categorySection"></v-select>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn small color="error" @click="state.dialog.category.close">Cancel</v-btn>
					<v-btn small color="primary" @click="state.dialog.category.save">{{ state.dialog.category.editing ? 'Edit' : 'Create' }}</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>


		<v-dialog v-model="state.dialog.item.show" width="350px">
			<v-card>
				<v-card-title>{{ state.dialog.item.editing ? 'Edit Item' : 'New Item' }}</v-card-title>
				<v-card-text>
					<v-form ref="itemForm">
						<v-row>
							<v-col cols="4">
								<v-text-field label="ID" required :rules="requiredRule" v-model="state.dialog.item.maraki_id"></v-text-field>
							</v-col>
							<v-col cols="8">
								<v-text-field label="Name" required :rules="requiredRule" v-model="state.dialog.item.name"></v-text-field>
							</v-col>
							<v-col cols="4">
								<v-text-field label="Price" type="number" required :rules="requiredRule" v-model="state.dialog.item.price"></v-text-field>
							</v-col>
							<v-col cols="8">
								<v-select label="Status" :items="state.selectItems" v-model="state.dialog.item.available"></v-select>
							</v-col>
							<v-col cols="12">
								<v-text-field label="Detail" v-model="state.dialog.item.detail"></v-text-field>
							</v-col>
						</v-row>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn small color="error" @click="state.dialog.item.close">Cancel</v-btn>
					<v-btn small color="primary" @click="state.dialog.item.save">{{ state.dialog.item.editing ? 'Edit' : 'Create' }}</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		
		<!-- main view goes here -->
		<v-window v-model="state.window.value">
			<v-window-item :value="1">				
				<v-container>
					<div class="d-flex justify-space-between align-center mb-8">
						<p class="ma-0 text-h4">Menu Categories</p>
						<v-btn small color="primary" @click="state.dialog.category.toggle()">New Category</v-btn>
					</div>
					<v-row>
						<v-col v-for="cat in state.categories" :key="`${cat.id}-window`" cols="12" md="4">
							<v-card relative>								
								<v-card-title>
									<p class="ma-0">{{ cat.name }}</p>
									<v-spacer></v-spacer>
									<v-icon color="success" class="cursor-pointer ml-2" @click="state.dialog.category.toggle(cat)">edit</v-icon>
									<v-icon color="error" class="cursor-pointer ml-2" @click="state.delete.toggle(cat, 'category')">delete</v-icon>
								</v-card-title>
								<v-card-text>{{ cat.detail }}</v-card-text>
								<v-card-actions>
									<v-spacer></v-spacer>
									<v-btn small elevation="0" color="primary" class="px-3" @click="state.window.category(cat)">
										<span class="mr-2">View</span>
									</v-btn>
								</v-card-actions>
							</v-card>
						</v-col>
					</v-row>
				</v-container>
			</v-window-item>

			<v-window-item :value="2">
				<v-card v-if="state.category !== null">
					<v-toolbar dark dense color="primary">
						<v-icon small class="cursor-pointer mr-4" @click="state.window.home">arrow_back</v-icon>
						<v-toolbar-title class="uppercase text-subtitle-1">
							{{ state.category.name }}
						</v-toolbar-title>
						<v-spacer></v-spacer>
						<v-btn small text @click="state.dialog.category.toggle()">
							<v-icon small>add</v-icon>
							Add Sub Category
						</v-btn>
					</v-toolbar>

					<div class="d-flex">
						<div class="d-flex flex-column grey lighten-3">
							<div v-for="sub in state.category.children" :key="`sub-${sub.id}`" :class="{
								'list-item pa-4 px-4 pa-md-4 px-md-8 cursor-pointer': true,
								'active': sub.id==state.subcategory.item.id
							}" @click="state.subcategory.set(sub)">
								<p class="ma-0 mx-md-8">{{ sub.name }}</p>
							</div>
						</div>
						<v-container class="flex-grow-1 ma-2 mx-6" v-show="JSON.stringify(state.subcategory.item) !== JSON.stringify({})">
							<div class="d-flex align-center">
								<div class="d-flex flex-column">
									<p class="ma-0 text-h5">{{ state.subcategory.item.name }}</p>
									<p class="ma-0 text-subtitle1">{{ state.subcategory.item.detail }}</p>
								</div>
								<v-spacer></v-spacer>
								<div>
									<v-btn small fab text color="success" @click="state.dialog.category.toggle(state.subcategory.item)">
										<v-icon small>edit</v-icon>
									</v-btn>
									<v-btn small fab text color="error" @click="state.delete.toggle(state.subcategory.item, 'subcategory')">
										<v-icon small>delete</v-icon>
									</v-btn>
								</div>
							</div>

							<div class="my-6"></div>
							
							<div class="d-flex align-center mb-8">
								<v-text-field class="col-4" v-model="state.subcategory.item.search" prepend-inner-icon="search" label="Search" single-line hide-details />
								<v-spacer></v-spacer>
								<v-btn small color="primary" @click="state.dialog.item.toggle()" elevation="0">
									<v-icon small class="mr-2">add</v-icon>
									Add Item
								</v-btn>
							</div>
							<v-data-table :headers="state.subcategory.headers" :items="state.subcategory.item.children" :search="state.subcategory.item.search" dense :footer-props="{
								prevIcon: 'chevron_left',
								nextIcon: 'chevron_right',
							}">
								<template v-slot:item.no="{ item, index }">
									{{ index + 1 }}
								</template>

								<template v-slot:item.available="{ item }">
									<v-chip small :color="item.available ? 'success' : 'error'" @click="toggleStatus(item)">
										{{ item.available ? 'Available' : 'Not Available' }}
									</v-chip>
								</template>

								<template v-slot:item.actions="{ item }">
									<v-icon small color="primary" class="mr-2" @click="state.dialog.item.toggle(item)">
										edit
									</v-icon>
									<v-icon small color="error" @click="state.delete.toggle(item, 'item')">
										delete
									</v-icon>
								</template>
							</v-data-table>
						</v-container>
					</div>
					
				</v-card>
			</v-window-item>
		</v-window>
	</v-container>
</template>


<style scoped>
.uppercase {
	text-transform: uppercase;
}
.cursor-pointer {
	cursor: pointer;
}
#delete-p {
	word-break: keep-all;
}
.list-item.active {
	background-color: white;
	color: #224;
	font-weight: bold;
	text-transform: capitalize;
	box-shadow: -3px 2px 2px #0003;
}
.list-item:not(.active):hover {
	background-color: #9993;
}
</style>