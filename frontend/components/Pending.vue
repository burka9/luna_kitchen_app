<script setup>
import axios from 'axios';
import { reactive, onMounted } from 'vue';

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
	items: [],
	cancel: {
		id: -1,
		username: '',
		password: '',
		visible: false,
		show(id) {
			state.cancel.toggle(true, id)
		},
		hide() {
			state.cancel.toggle(false, -1)
		},
		toggle(visible, id) {
			state.cancel.visible = visible
			state.cancel.id = id
			state.cancel.username = ''
			state.cancel.password = ''
		},
	},
})

const get_id = () => {
	try {
		return JSON.parse(localStorage.order_data).id
	} catch { return -1 }
}

const fetch_list = () => {
	axios.get(`${props.api}/api/order?id=${get_id()}&status=pending`)
		.then(result => {
			if (result.data.success)
				state.items = result.data.list.map(item => ({
					id: item.id,
					table: item.table,
					status: item.status,
					description: item.description,
					order: item.items.map(i => i.name),
					price: getPrice(item.items),
					issued: new Date(parseInt(item.issued)).toLocaleTimeString()
				}))
		})
		.catch(err => console.log(err))
}

const getPrice = items => {
	let price = 0
	items.forEach(i => price += parseInt(i.price))
	return price
}

const get_title = title => {
	title = title.join(', ')
	return title.length>21 ? `${title.substr(0, 20)}...` : title
}

const cancelOrder = item => {
	state.cancel.show(item.id)
}

const confirmCancel = () => {
	const { id, username, password } = state.cancel
	if (id == -1 || username == '' || password == '') return

	axios.post(`${props.api}/api/order/cancel`, {
		id,
		username,
		password,
	})
		.then(result => {
			if (result.data.success) {
				fetch_list()
				return state.snackbar.show('Order canceled!', 'primary')
			}

			state.snackbar.show('Invalid credentials!')
		})
		.catch(err => {
			state.snackbar.show('Something went wrong!')
			console.log(err)
		})
		.then(state.cancel.hide)
}

onMounted(() => {
	fetch_list()
	props.socket.on('order_finished', data => {
		fetch_list()
	})
	props.socket.on('update_order', () => fetch_list())
})
</script>

<template>
	<v-container fluid>
		<v-snackbar v-model="state.snackbar.toggle" :timeout="3500" top :color="state.snackbar.color" elevation="3">
			<span class="text-subtitle-1">{{ state.snackbar.text }}</span>
		</v-snackbar>

		<v-dialog v-model="state.cancel.visible" width="350px">
			<v-card>
				<v-card-title>
					Confirm cancel
				</v-card-title>
				<v-card-text>
					<v-text-field placeholder="Admin username" v-model="state.cancel.username"></v-text-field>
					<v-text-field placeholder="Admin password" type="password" v-model="state.cancel.password"></v-text-field>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn class="grey white--text" @click="state.cancel.hide">Close</v-btn>
					<v-btn color="error" @click="confirmCancel">Confirm</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		
		<v-expansion-panels>
			<v-expansion-panel v-for="(item, i) in state.items" :key="i">
				<v-expansion-panel-header expand-icon="expand_more">
					<v-row align="center" class="mx-1 mx-sm-2 mx-md-3">
						<h4>{{ get_title(item.order) }}</h4>
						<v-spacer></v-spacer>
						<p class="ma-0">Table {{ item.table }}</p>
					</v-row>
				</v-expansion-panel-header>
				<v-expansion-panel-content>
					<v-row class="px-0 px-sm-3 px-md-6">
						<v-col cols="12" sm="4" md="2">
							<p class="ma-0 font-weight-bold">Items</p>
						</v-col>
						<v-col cols="12" sm="8" md="10">
							<p class="ma-0">{{ item.order.join(', ') }}</p>
						</v-col>
						<v-col cols="12" sm="4" md="2">
							<p class="ma-0 font-weight-bold">Price</p>
						</v-col>
						<v-col cols="12" sm="8" md="10">
							<p class="ma-0">{{ item.price }}</p>
						</v-col>
						<v-col cols="12" sm="4" md="2">
							<p class="ma-0 font-weight-bold">Descritption</p>
						</v-col>
						<v-col cols="12" sm="8" md="10">
							<p class="ma-0">{{ item.description }}</p>
						</v-col>
						<v-col cols="12" sm="4" md="2">
							<p class="ma-0 font-weight-bold">Status</p>
						</v-col>
						<v-col cols="12" sm="8" md="10">
							<v-chip color="orange lighten-2">{{ item.status }}</v-chip>
						</v-col>
						<v-col cols="12" sm="4" md="2">
							<p class="ma-0 font-weight-bold">Order Time</p>
						</v-col>
						<v-col cols="12" sm="8" md="10">
							<v-chip color="orange lighten-2">{{ item.issued }}</v-chip>
						</v-col>
						<v-col cols="12">
							<div class="d-flex justify-end">
								<v-spacer></v-spacer>
								<v-btn color="error" @click="cancelOrder(item)" small>Cancel</v-btn>
							</div>
						</v-col>
					</v-row>
				</v-expansion-panel-content>
			</v-expansion-panel>
		</v-expansion-panels>
	</v-container>
</template>