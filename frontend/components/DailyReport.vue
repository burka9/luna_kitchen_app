<script setup>
import axios from 'axios'
import { reactive, computed, onMounted } from 'vue'
import { isAfter, isWithinInterval, addDays, isEqual, isSameDay } from 'date-fns'

const props = defineProps({
	api: String,
	socket: Object,
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
	headers: [
		{ text: 'ID', value: 'maraki_id' },
		{ text: 'Date', value: 'parsedDate' },
		{ text: 'Waiter', value: 'waiter.name' },
		{ text: 'Status', value: 'statusText' },
		{ text: 'Table', value: 'tableText' },
		{ text: 'Item', value: 'name' },
		{ text: 'Quantity', value: 'quantity' },
		{ text: 'Unit Price', value: 'price' },
		{ text: 'Total Price', value: 'totalPrice' },
	],
	report: [],
	waiters: [],
	status: [],
	items: [],
	subcategories: [],
	tables: [],
	filter: {
		date: null,
		startDate: null,
		endDate: null,
		waiter: -1,
		status: 'All',
		item: -1,
		subcategory: -1,
		table: -1,
		orderID: '',
		clear() {
			state.filter.date = null
			state.filter.startDate = null
			state.filter.endDate = null
			formatStartDate()
			formatEndDate()
			state.filter.waiter = -1
			state.filter.status = 'All'
			state.filter.item = -1
			state.filter.subcategory = -1
			state.filter.table = -1
			state.filter.orderID = ''
		},
	},
	menu: false,
	startDateMenu: false,
	endDateMenu: false,
	formattedDate: '',
	formattedStartDate: '',
	formattedEndDate: '',
})

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const formatDate = () => {
	if (state.filter.date == null) return

	const start = new Date(state.filter.date[0])
	const end = new Date(state.filter.date[1])

	if (start == 'Invalid Date' || end == 'Invalid Date') return

	state.formattedDate = `${monthNames[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
}

const formatStartDate = () => {
	if (state.filter.startDate == null) return

	const start = new Date(state.filter.startDate)

	if (start == 'Invalid Date') return

	state.formattedStartDate = `${monthNames[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()}`
}

const formatEndDate = () => {
	if (state.filter.endDate == null) return

	const end = new Date(state.filter.endDate)

	if (end == 'Invalid Date') return

	state.formattedEndDate = `${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
}

const compareDate = (filter, date) => {
	try {
		let start = new Date(filter[0])
		let end = new Date(filter[1])

		if (isAfter(start, end)) {
			let temp = start
			start = end
			end = temp
		}

		end = addDays(end, 1)

		return (isWithinInterval(new Date(parseInt(date)), { start, end }))
	} catch (err) {
		return true
	}
}

const saveDate = () => {
	formatDate()
	state.menu = false
}

const saveStartDate = () => {
	formatStartDate()
	state.startDateMenu = false
}

const saveEndDate = () => {
	formatEndDate()
	state.endDateMenu = false
}

const filterMethod = report => {
	let pass = true
	// check for waiter filter
	if (state.filter.waiter !== -1)
		pass = pass && report.waiter.id == state.filter.waiter

	// // check for status filter
	if (state.filter.status != 'All')
		pass = pass && report.statusText == state.filter.status

	// // check for item filter
	if (state.filter.item != -1)
		pass = pass && report.id == state.filter.item

	// check for subcategory filter
	// if (state.filter.subcategory != -1)
	// 	pass = pass && report.category.id

	// console.log(state.filter.subcategory)

	// // check for date filter
	if (state.filter.startDate != null)
		// pass = pass && compareDate(state.filter.date, report.date)
		pass = pass && isSameDay(new Date(state.filter.startDate), new Date(parseInt(report.date)))
		
	// // check for table filter
	if (state.filter.table != -1)
		pass = pass && report.table == state.filter.table

	// check for order id
	if (state.filter.orderID != '')
		pass = pass && report.order_id == state.filter.orderID

	return pass
}

const filteredReport = computed({
	get() {
		return state.report.filter(filterMethod).sort((a, b) => a.order_id > b.order_id ? 1 : -1)
	}
})

const total = computed(() => {
	let totalQuantity = 0
	let totalPrice = 0
	let totalSum = 0

	filteredReport.value.forEach(item => {
		totalQuantity += parseInt(item.quantity)
		totalPrice += parseInt(item.price)
		totalSum += parseInt(item.totalPrice)
	})

	return {
		name: 'Total',
		quantity: totalQuantity,
		price: totalPrice,
		totalPrice: totalSum,
	}
})

const fetch_report = () => {
	axios.get(`${props.api}/api/report`)
		.then(result => {
			state.report = result.data.success ? result.data.report : state.report
			state.status = result.data.success ? ['All', ...Object.values(result.data.reportStatus).map(value => value.name)] : state.status
			// console.log(
			// 	state.report.map(r => r.status)
			// )
		})
		.catch(err => console.error(err))
}
const fetch_waiters = () => {
	axios.get(`${props.api}/api/user?type=waiter`)
		.then(result => {
			state.waiters = result.data.success ? [{ name: 'All', id: -1, }, ...result.data.list] : state.waiters
		})
		.catch(err => console.error(err))
}

const fetch_items = filter => {
	let temp = filter ? Object.keys(filter).map(key => (`${key}=${filter[key]}`)).join('&') : ''
	axios.get(`${props.api}/api/menu-item?${temp}`)
		.then(result => {
			state.items = result.data.success ? [{ name: 'All', id: -1, }, ...result.data.list] : state.items
		})
		.catch(err => console.error(err))
}

const fetch_subcategories = () => {
	axios.get(`${props.api}/api/subcategory`)
		.then(result => {
			state.subcategories = result.data.success ? [{ name: 'All', id: -1, }, ...result.data.list] : state.subcategories
		})
		.catch(err => console.error(err))
}

const fetch_tables = () => {
	axios.get(`${props.api}/api/table?sort=true`)
		.then(result => {
			state.tables = result.data.success ? [{ name: 'All', table_index: -1 }, ...result.data.list.map(({ table_index }) => ({ name: `Table ${table_index}`, table_index }))] : state.tables
		})
		.catch(err => console.log(err))
}

const print = () => {
	let data = []

	try {
		data = state.report.filter(report => filterMethod(report))
	} catch { }

	axios.post(`${props.api}/api/report/print`, data)
		.then(result => {
			if (result.data.success) {
				return state.snackbar.show('Report Printed!', 'primary')
			} else {
				return state.snackbar.show('Something went wrong.')
			}
		})
		.catch(err => {
			state.snackbar.show('Something went wrong.')
			console.error(err)
		})
}

const download = () => {
	let data = []

	try {
		data = state.report.filter(report => filterMethod(report))
	} catch { }

	axios.post(`${props.api}/api/report/download`, data)
		.then(result => {
			if (result.data.success) {
			}
		})
		.catch(err => console.error(err))
}


const init = () => {
	fetch_report()
	fetch_waiters()
	fetch_items()
	fetch_tables()
	fetch_subcategories()
}

init()

onMounted(() => {
	props.socket.on('update_table', init)
	props.socket.on('update_order', init)
	props.socket.on('update_menu', init)
	props.socket.on('order_finished', init)
	props.socket.on('order_canceled', init)
	props.socket.on('archived_an_order', init)

	state.filter.startDate = new Date().toISOString().substring(0, 10).split('-').join('-')
})
</script>

<template>
	<v-container fluid>
		<v-snackbar v-model="state.snackbar.toggle" :timeout="3500" top :color="state.snackbar.color" elevation="3">
			<span class="text-subtitle-1">{{ state.snackbar.text }}</span>
		</v-snackbar>

		<v-row>
			<v-col cols="12" md="10">
				<v-row>
					<v-col cols="2">
						<v-select dense label="Filter by waiter" :items="state.waiters" item-text="name" item-value="id"
							v-model="state.filter.waiter"></v-select>
					</v-col>
					<v-col cols="2">
						<v-select dense label="Filter by status" :items="[...new Set(state.status)]"
							v-model="state.filter.status"></v-select>
					</v-col>
					<v-col cols="2">
						<v-select dense label="Filter by items" :items="state.items" item-text="name" item-value="id"
							v-model="state.filter.item"></v-select>
					</v-col>
					<v-col cols="2">
						<v-select dense label="Filter by table" :items="state.tables" item-text="name" item-value="table_index"
							v-model="state.filter.table"></v-select>
					</v-col>

					<!-- <v-col cols="4">
						<v-menu v-model="state.menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
							<template v-slot:activator="{ on, attrs }">
								<v-text-field dense v-model="state.formattedDate" label="Filter by date" hint="MM DD, YYYY format" @blur="formatDate" readonly v-bind="attrs" v-on="on"></v-text-field>
							</template>
							<v-date-picker v-model="state.filter.date" no-title scrollable range>
								<v-spacer></v-spacer>
								<v-btn small text color="primary" @click="state.menu = false">Cancel</v-btn>
								<v-btn small text color="primary" @click="saveDate">OK</v-btn>
							</v-date-picker>
						</v-menu>
					</v-col> -->

					<!-- <v-col cols="2">
						<v-menu v-model="state.startDateMenu" :close-on-content-click="true" transition="scale-transition" offset-y
							min-width="auto">
							<template v-slot:activator="{ on, attrs }">
								<v-text-field dense v-model="state.formattedStartDate" label="Start Date" hint="MM DD, YYYY format"
									@blur="formatStartDate" readonly v-bind="attrs" v-on="on"></v-text-field>
							</template>
							<v-date-picker v-model="state.filter.startDate" no-title scrollable>
								<v-spacer></v-spacer>
								<v-btn small text color="primary" @click="state.startDateMenu = false">Cancel</v-btn>
								<v-btn small text color="primary" @click="saveStartDate">OK</v-btn>
							</v-date-picker>
						</v-menu>
					</v-col>

					<v-col cols="2">
						<v-menu v-model="state.endDateMenu" :close-on-content-click="true" transition="scale-transition" offset-y
							min-width="auto">
							<template v-slot:activator="{ on, attrs }">
								<v-text-field dense v-model="state.formattedEndDate" label="End Date" hint="MM DD, YYYY format"
									@blur="formatEndDate" readonly v-bind="attrs" v-on="on"></v-text-field>
							</template>
							<v-date-picker v-model="state.filter.endDate" no-title scrollable>
								<v-spacer></v-spacer>
								<v-btn small text color="primary" @click="state.endDateMenu = false">Cancel</v-btn>
								<v-btn small text color="primary" @click="saveEndDate">OK</v-btn>
							</v-date-picker>
						</v-menu>
					</v-col> -->

					<v-col cols="2">
						<v-menu v-model="state.startDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
							min-width="auto">
							<template v-slot:activator="{ on, attrs }">
								<v-text-field dense v-model="state.filter.startDate" label="Select Date" readonly v-bind="attrs"
									v-on="on"></v-text-field>
							</template>
							<v-date-picker v-model="state.filter.startDate" no-title scrollable @input="state.startDateMenu = false"></v-date-picker>
						</v-menu>
					</v-col>

					<v-col cols="2"></v-col>

					<v-col cols="2">
						<v-text-field label="Order Ref" dense v-model="state.filter.orderID"></v-text-field>
					</v-col>
				</v-row>
			</v-col>

			<v-col cols="12" md="2">
				<div class="d-flex items-center justify-end flex-wrap">
					<v-spacer></v-spacer>
					<v-btn class="ma-2" color="primary" small @click="state.filter.clear">Clear Filter</v-btn>
					<v-btn class="ma-2" color="primary" small @click="download" v-if="false">Download</v-btn>
					<v-btn class="ma-2" color="primary" small @click="print">Print</v-btn>
				</div>
			</v-col>

			<!-- <v-col cols="2">
				<v-select dense label="Filter by category" :items="state.subcategories" item-text="name" item-id="category_id" v-model="state.filter.subcategory"></v-select>
			</v-col> -->
		</v-row>

		<v-simple-table>
			<thead>
				<tr class="blue">
					<!-- <th>ID</th> -->
					<th class="white--text">Order Ref</th>
					<th class="white--text">Date</th>
					<th class="white--text">Waiter</th>
					<th class="white--text">Status</th>
					<th class="white--text">Table</th>
					<th class="white--text">Item</th>
					<th class="white--text">Quantity</th>
					<th class="white--text">Unit Price</th>
					<th class="white--text">Total Price</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in filteredReport" :key="Math.random() + item.id + item.maraki_id + '-key'" :class="{
					'grey lighten-2': item.order_id % 2 == 0
				}">
					<!-- <td>{{ item.maraki_id }}</td> -->
					<td>{{ item.order_id.toString().padStart(6, '0').replace(/\B(?=(\d{3})+(?!\d))/g, " ") }}</td>
					<td>{{ item.parsedDate }}</td>
					<td>{{ item.waiter.name }}</td>
					<td>{{ item.statusText }}</td>
					<td>{{ item.tableText }}</td>
					<td>{{ item.name }}</td>
					<td>{{ item.quantity }}</td>
					<td>{{ item.price }}</td>
					<td>{{ item.totalPrice }}</td>
				</tr>
				<tr>
					<th class="text-center font-weight-bold" colspan="6">{{ total.name }}</th>
					<td>{{ total.quantity }}</td>
					<td>{{ total.price }}</td>
					<td>{{ total.totalPrice }}</td>
				</tr>
			</tbody>
		</v-simple-table>

	</v-container>
</template>
