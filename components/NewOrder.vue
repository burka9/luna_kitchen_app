<script setup>
import { computed, reactive } from 'vue';
import axios from 'axios';

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

	window: {
		value: 1,
		items: () => {
			state.window.value = 2
			state.subwindow.categoryView()
		},
		home: () => {
			state.window.value = 1
		},
	},
	subwindow: {
		value: 1,
		category: null,
		subcategory: null,
		categoryView: () => {
			state.subwindow.value = 1
			state.subwindow.category = null
			state.subwindow.subcategory = null
		},
		subcategoryView: category => {
			state.subwindow.value = 2
			state.subwindow.category = category
		},
		itemView: subcategory => {
			state.subwindow.value = 3
			state.subwindow.subcategory = subcategory
		},
	},
	menu: {
		category: [],
		subcategory: [],
		item: [],
	},
	user: { name: '' },
	tables: [],

	order: {
		user_id: -1,
		table_index: -1,
		order_issued_date: null,
		status: 'pending',
		description: '',
		items: [],
		add: item => {
			if (!state.order.items.find(i => i.id = item.id)) {
				state.order.items.push({ item, count: 1 })
			}
		}
	},
})

const price = computed(() => 0)
const category_temp = computed(() => state.subwindow.category===null ? 'Category' : state.subwindow.category.name)
const subcategory_temp = computed(() => state.subwindow.subcategory===null ? null : state.subwindow.subcategory.name)

const filteredSubcategory = computed(() => {})
const filteredItem = computed(() => ([]))

try {
	state.user = JSON.parse(localStorage.order_data)
	state.order.user_id = state.user.id
}
catch {}

axios.get('/api/table')
	.then(result => state.tables = result.data.success ? result.data.list.map(l => ({ ...l, label: `Table ${l.table_index}` })) : [])
	.catch(err => console.error(err))

axios.get('/api/category')
	.then(result => state.menu.category = result.data.success ? result.data.list : [])
	.catch(err => console.error(err))
axios.get('/api/subcategory')
	.then(result => state.menu.subcategory = result.data.success ? result.data.list : [])
	.catch(err => console.error(err))
axios.get('/api/menu-item')
	.then(result => state.menu.item = result.data.success ? result.data.list : [])
	.catch(err => console.error(err))

</script>

<template>
	<div>
		<v-snackbar v-model="state.snackbar.toggle" :timeout="3500" top :color="state.snackbar.color" elevation="3">
			<span class="text-subtitle-1">{{ state.snackbar.text }}</span>
		</v-snackbar>


		<v-window v-model="state.window.value">
			<v-window-item :value="1">
				<v-container>
					<div class="d-flex align-center justify-center mb-12">
						<v-btn color="primary" elevation="0" @click="state.window.items">
							<v-icon>mdi-plus</v-icon>
							Add Item
						</v-btn>
						<v-spacer></v-spacer>
						<p class="ma-0 text-subtitle-1 grey--text">{{ new Date().toDateString() }}</p>
					</div>

					<div class="d-flex justify-center">
						<v-card class="pa-10" style="width: 80vw; max-width: 500px">
							<v-row>
								<v-col cols="6">
									<p class="title">Waiter Name</p>
								</v-col>
								<v-col cols="4" offset="2">
									<div class="d-flex justify-end">
										<p class="subtitle">{{ state.user.name }}</p>
									</div>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="6">
									<p class="title">Table</p>
								</v-col>
								<v-col cols="6">
									<v-select dense elevation="0" label="Select Table" :items="state.tables" item-text="label" item-value="id" v-model="state.order.table_index" />
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="6">
									<p class="title">Price</p>
								</v-col>
								<v-col cols="4" offset="2">
									<div class="d-flex justify-end">
										<p class="subtitle">{{ price }}</p>
									</div>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12">
									<v-textarea label="Description" dense outlined clearable full-width v-mode="state.order.description"></v-textarea>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12">
									<p class="title">Items</p>
								</v-col>
							</v-row>
							<div class="d-flex flex-wrap mt-4">
								<v-chip dense class="mx-2">Item 1</v-chip>
								<v-chip dense class="mx-2">Item 1</v-chip>
							</div>
							<div class="d-flex justify-end mt-8">
								<v-btn color="primary">Submit</v-btn>
							</div>
						</v-card>
					</div>
				</v-container>
			</v-window-item>

			<v-window-item :value="2">
				<v-card style="max-height: 70vh">
					<v-toolbar dense class="px-0 mb-3">
						<v-icon class="blue--text cursor-pointer mr-2" @click="state.window.home">mdi-arrow-left</v-icon>
						<v-toolbar-title>
							<v-btn text>{{ category_temp }}</v-btn>
							<v-icon v-if="subcategory_temp!==null">mdi-chevron-right</v-icon>
							<v-btn text v-if="subcategory_temp!==null">{{ subcategory_temp }}</v-btn>
						</v-toolbar-title>
					</v-toolbar>

					<v-row class="px-5">
						<v-col cols="4">
							<div class="d-flex flex-column pa-2 px-3">
								<p class="title ma-0">Selected Items</p>
							</div>
						</v-col>
						<v-col cols="8">
							<v-window v-model="state.subwindow.value">
								<v-window-item :value="1">
									<div class="d-flex flex-column">
										<v-list>
											<v-list-item-group v-mode="state.subwindow.category">
												<v-list-item v-for="cat in state.menu.category" :key="`${cat.id}-list`" @click="state.subwindow.subcategoryView(cat)">
													<v-list-item-title>
														{{ cat.name }}
													</v-list-item-title>
												</v-list-item>
											</v-list-item-group>
										</v-list>
									</div>
								</v-window-item>
								<v-window-item :value="2">
									<v-list>
										<v-list-item-group>
											<v-list-item v-for="sub in filteredSubcategory" :key="`${sub.id}-sub`" @click="state.subwindow.itemView(sub)">
												<v-list-item-title>
													{{ sub.name }}
												</v-list-item-title>
											</v-list-item>
										</v-list-item-group>
									</v-list>
								</v-window-item>
								<v-window-item :value="3">
									<v-list>
										<v-list-item-group>
											<v-list-item v-for="item in filteredItem" :key="`${item.id}-item`" @click="state.order.add(item)">
												<v-list-item-title>
													{{ item.name }}
												</v-list-item-title>
											</v-list-item>
										</v-list-item-group>
									</v-list>
								</v-window-item>
							</v-window>
						</v-col>
					</v-row>
				</v-card>
			</v-window-item>
		</v-window>
		
		
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
</style>