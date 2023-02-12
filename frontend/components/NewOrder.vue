<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import axios from 'axios';

const requiredRule = [val => !!val || 'Required Value!' ]

const newOrderForm = ref(null)

const props = defineProps({
	api: String,
	socket: Object
})

const state = reactive({
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

	selection: {
		category: null,
		subcategory: null,
		items: [],
	},

	user: {
		id: -1,
		username: '',
		name: '',
	},

	order: {
		user_id: -1,
		table_index: -1,
		description: '',
	},

	tables: [],
	category: [],
	subcategory: [],
	items: [],
})

const price = computed(() => {
	let price = 0
	state.selection.items.forEach(i => price += parseInt(i.price))
	return price
})
const subcategories = category => state.subcategory.filter(subcategory => subcategory.category_id == category.id)
const items = computed(() => {
	if (state.selection.category == null || state.selection.subcategory == null) return []

	return state.items.filter(item => item.category_id == state.selection.category.id && item.subcategory_id == state.selection.subcategory.id)
})

const makecategoryActive = category => state.selection.category = category
const makeSubcategoryActive = subcategory => state.selection.subcategory = subcategory
const isActive = subcategory => state.selection.subcategory != null ? state.selection.subcategory.id == subcategory.id : false

const getSelectionCount_category = category => state.selection.items.filter(i => i.category_id == category.id).length
const getSelectionCount_subcategory = subcategory => state.selection.items.filter(i => i.subcategory_id == subcategory.id).length
const getSelectionCount = item => state.selection.items.filter(i => i.id == item.id).length
const selectItem = item => {
	state.selection.items.push(item)
}
const deselectItem = item => {
	let index = state.selection.items.findIndex(i => i.id == item.id)

	if (-1 < index) state.selection.items.splice(index, 1)
}

const clear = () => { return
	state.order = {
		table_index: -1,
		description: '',
		user_id: JSON.parse(localStorage.order_data).id
	},
	state.selection.items = []
	if (newOrderForm.value && newOrderForm.value.reset) newOrderForm.value.reset()
}

const submit = sendToPrinter => {
	if (newOrderForm.value.validate()) {
		if (state.selection.items.length == 0) return
		axios.post(`${props.api}/api/order`, {
			description: state.order.description,
			user_id: state.order.user_id,
			table_index: state.order.table_index,
			items: state.selection.items.map(item => item.id),
			issued: new Date().getTime(),
			sendToPrinter
		})
			.then(result => {
				if (result.data.success) return state.snackbar.show('Order sent!', 'primary')
				state.snackbar.show('Something went wrong!')
			})
			.catch(err => {
				console.error(err)
				state.snackbar.show('Something went wrong!')
			})
			.then(clear)
		}
}

const getTableList = () => {
	axios.get(`${props.api}/api/table?sort=true`)
		.then(result => state.tables = result.data.success ? result.data.list.map(table => ({ ...table, label: `Table ${table.table_index}` })) : [])
		.catch(err => console.error(err))
}

const init = () => {
	try {
		state.user = JSON.parse(localStorage.order_data)
		state.order.user_id = state.user.id
	}
	catch (e) {
		console.log('error here initing user from local storage')
	}

	// get table list
	getTableList()

	// get category list
	axios.get(`${props.api}/api/category`)
		.then(result => state.category = result.data.success ? result.data.list : [])
		.catch(err => console.error(err))

	// get subcategory list
	axios.get(`${props.api}/api/subcategory`)
		.then(result => state.subcategory = result.data.success ? result.data.list : [])
		.catch(err => console.error(err))

	// get item list
	axios.get(`${props.api}/api/menu-item`)
		.then(result => state.items = result.data.success ? result.data.list : [])
		.catch(err => console.error(err))
}

init()

const availableTables = computed(() => {
	// return state.tables.filter(table => table.current_order_id == null)
	return state.tables
})

onMounted(() => {
	if (newOrderForm.value && newOrderForm.value.reset) newOrderForm.value.reset()
	props.socket.on('update_menu', () => init())
	props.socket.on('update_table', () => getTableList())
})
</script>

<template>
	<div>
		<v-snackbar v-model="state.snackbar.toggle" :timeout="3500" top :color="state.snackbar.color" elevation="3">
			<span class="text-subtitle-1">{{ state.snackbar.text }}</span>
		</v-snackbar>

		<v-container>
			<v-card class="pa-2 px-8">
				<v-form ref="newOrderForm">
					<v-row>
						<v-col cols="6">
							<v-card-title>Selected Items</v-card-title>
							<v-card-text>
								<v-chip class="ma-2" color="green" text-color="white" v-for="item in [...new Set(state.selection.items)]" :key="`selected-${item.id}`" @click="deselectItem(item)">
									<v-avatar left>{{ getSelectionCount(item) }}</v-avatar>
									{{ item.name }}
								</v-chip>
							</v-card-text>
							<v-card-title>Price</v-card-title>
							<v-card-subtitle>{{ (price).toFixed(2) }}</v-card-subtitle>
						</v-col>
						<v-col cols="6">
							<v-card-text>
								<v-select dense label="Select Table" outlined :rules="requiredRule" :items="availableTables" item-text="label" item-value="table_index" v-model="state.order.table_index" />
								<v-textarea label="Description" dense outlined clearable auto-grow rows="3" v-model="state.order.description"></v-textarea>
								<div class="d-flex">
									<v-spacer></v-spacer>
									<v-btn small class="mr-4" color="primary" @click="clear">Clear All</v-btn>
									<v-btn small class="mr-4" color="primary" @click="submit(true)">Submit & Print</v-btn>
									<v-btn small color="primary" @click="submit(false)">Submit</v-btn>
								</div>
							</v-card-text>
						</v-col>
					</v-row>
				</v-form>
			</v-card>
			<v-card class="mt-8">
				<v-card-title>Menu List</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="4" class="border-right">
							<v-list dense>
								<v-list-group v-for="category in state.category" :key="`category-${category.id}`"
									v-model="category.active" no-action @click="makecategoryActive(category)" append-icon="expand_more">
									<template v-slot:activator>
										<v-list-item-icon>
											<v-chip dark :color="getSelectionCount_category(category) == 0 ? 'grey' : 'green'" small pill>{{ getSelectionCount_category(category) }}</v-chip>
										</v-list-item-icon>
										<v-list-item-content>
											<v-list-item-title v-text="category.name"></v-list-item-title>
										</v-list-item-content>
									</template>

									<v-list-item v-for="subcategory in subcategories(category)" :key="`subcategory-${subcategory.id}`"
										v-model="subcategory.active" link
										:class="{ 'blue lighten-2 white--text rounded': isActive(subcategory) }"
										@click="makeSubcategoryActive(subcategory)">
										<v-list-item-icon>
											<v-chip class="pr-5" dark :color="getSelectionCount_subcategory(subcategory) == 0 ? 'grey' : 'green'" small pill>{{ getSelectionCount_subcategory(subcategory) }}</v-chip>
										</v-list-item-icon>
										<v-list-item-title v-text="subcategory.name"></v-list-item-title>
									</v-list-item>
								</v-list-group>
							</v-list>
						</v-col>
						<v-col cols="8">
							<v-list dense>
								<v-list-item v-for="item in items" :key="`item-${item.id}`" :disabled="item.available != 1" link
									two-line @click="selectItem(item)">
									<template v-slot>
										<v-list-item-action>
											<v-chip dark :color="getSelectionCount(item) == 0 ? 'grey' : 'green'" small pill>{{ getSelectionCount(item) }}</v-chip>
										</v-list-item-action>
										<v-list-item-content>
											<v-list-item-title class="text-subtitle-1">{{ item.name }}</v-list-item-title>
											<v-list-item-subtitle class="text-subtitle-2">{{ item.name }}</v-list-item-subtitle>
										</v-list-item-content>
										<v-list-item-action>
											<p class="ma-0 text-subtitle-1">{{ Number(item.price).toFixed(2) }}</p>
										</v-list-item-action>
									</template>
								</v-list-item>
							</v-list>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
			<v-container>
			</v-container>
		</v-container>

	</div>
</template>


<style scoped>
p.title {
	font-weight: bold;
	margin: 0;
}

p.subtitle {
	text-align: right;
}

.border-right {
	border-right: 1px solid #0002;
	margin-bottom: 1.5rem;
	padding-right: 2.5rem;
}
</style>