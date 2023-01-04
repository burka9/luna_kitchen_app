<script setup>
import axios from 'axios';
import { reactive, ref } from 'vue';

const props = defineProps({
	api: String,
})

const requiredRule = val => !!val || 'Required!'

const state = reactive({
	search: '',
	headers: [
		{ text: 'No', value: 'no' },
		{ text: 'Name', value: 'name' },
		{ text: 'Gender', value: 'gender' },
		{ text: 'Phone', value: 'phone' },
		{ text: 'Username', value: 'username' },
		{ text: 'Status', value: 'status' },
		{ text: 'Actions', value: 'actions', sortable: false },
	],
	users: [],
	dialog: false,
	deletePrompt: false,
	deletingUser: null,
	editing: false,
	editIndex: -1,
	showPassword: false,
	user: {
		id: '',
		name: '',
		gender: '',
		email: '',
		phone: '',
		username: '',
		type: '',
		status: '',
		password: '',
	},
	rules: {
		name: [requiredRule],
		gender: [requiredRule],
		email: [],
		phone: [],
		username: {
			required: [requiredRule],
			error: {
				status: false,
				message: []
			}
		},
		password: () => state.editing ? [] : [requiredRule],
		type: [requiredRule],
		status: [],
	},
	genders: [
		'Female',
		'Male',
	],
	types: [
		{ text: 'Admin', value: 'admin' },
		{ text: 'Waiter', value: 'waiter' },
		{ text: 'Kitchen', value: 'kitchen' },
	],
	statuses: [
		'Status A',
		'Status B',
		'Status C',
	],
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

const resetUsernameError = () => {
	state.rules.username.error = {
		status: false,
		message: []
	}
}

const newUser = ref(null)

const showDialog = () => {
	if (newUser.value && newUser.value.reset) newUser.value.reset()
	state.editing = false
	state.dialog = true
}
const createUser = async () => {
	resetUsernameError()
	if (newUser.value.validate()) {
		if ((await axios.get(`${props.api}/api/user?username=${state.user.username}`)).data.success) {
			return state.rules.username.error = {
				status: true,
				message: ['Username Exists!']
			}
		}
		// do axios call to create new user
		axios.post(`${props.api}/api/user`, state.user)
			.then(result => {
				if (result.data.success) {
					// show success dialog
					state.snackbar.show('User successfully created!', 'primary')
					fetch_list()
				}
				else state.snackbar.show('Somthing went wrong!')
			})
			.catch(err => {
				// show failed dialog
				state.snackbar.show('Somthing went wrong!')
				console.log(err)
			})
			.then(() => close())
	}
}
const editUser = user => {
	state.editing = true
	state.editIndex = state.users.indexOf(user)
	state.user = Object.assign({}, state.users[state.editIndex])
	state.user.password = ''
	state.dialog = true
}
const confirmEdit = () => {
	if (newUser.value.validate()) {
		// do axios call to edit user
		axios.put(`${props.api}/api/user`, state.user)
			.then(result => {
				if (result.data.success) {
					// show success dialog
					state.snackbar.show('User successfully edited!', 'primary')
					fetch_list()
				}
				else state.snackbar.show('Somthing went wrong!')
			})
			.catch(err => {
				// show failed dialog
				state.snackbar.show('Somthing went wrong!')
				console.log(err)
			})
			.then(() => close())
	}
}
const deleteUser = user => {
	state.deletePrompt = true
	state.deletingUser = user
}
const confirmDelete = () => {
	// do axios call to delete user
	axios.delete(`${props.api}/api/user`, { data: state.deletingUser })
		.then(result => {
			if (result.data.success) {
				// show success dialog
				state.snackbar.show('User successfully deleted!', 'primary')
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
const close = () => {
	state.editing = false
	state.dialog = false
	Object.keys(state.user).forEach(key => state.user[key] = '')
}

const fetch_list = () => {
	axios.get(`${props.api}/api/user`)
		.then(result => {
			if (!result.data.success) return
			state.users = []
			state.users = result.data.list
			state.users.forEach(user => Object.keys(user).forEach(key => user[key] = user[key] == 'null' ? '' : user[key]))
		})
		.catch(err => console.error(err))
}

const isSelf = id => {
	try {
		return JSON.parse(localStorage.order_data).id == id
	} catch {
		return false
	}
}


fetch_list()
</script>

<template>
	<v-container fluid>
		<v-snackbar v-model="state.snackbar.toggle" :timeout="3500" top :color="state.snackbar.color" elevation="3">
			<span class="text-subtitle-1">{{ state.snackbar.text }}</span>
		</v-snackbar>
		<v-dialog v-model="state.deletePrompt" width="400px">
			<v-card>
				<v-card-title>
					<p display="text-h6">Delete User?</p>
				</v-card-title>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="error" dense @click="confirmDelete">Yes</v-btn>
					<v-btn color="primary" dense @click="state.deletePrompt = false">No</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<v-dialog v-model="state.dialog" width="400px">
			<v-card>
				<v-card-title>
					<span>{{ state.editing ? 'Edit User' : 'Create New User' }}</span>
				</v-card-title>
				<v-card-text>
					<v-container>
						<v-form ref="newUser">
							<v-row>
								<v-col cols="12" md="6">
									<v-text-field dense label="Name" v-model="state.user.name" :rules="state.rules.name" required />
								</v-col>
								<v-col cols="12" md="6">
									<v-select dense label="Gender" :items="state.genders" v-model="state.user.gender"
										:rules="state.rules.gender" required />
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12" md="6">
									<v-text-field dense label="Email" type="email" v-model="state.user.email"
										:rules="state.rules.email" />
								</v-col>
								<v-col cols="12" md="6">
									<v-text-field dense label="Phone" v-model="state.user.phone" :rules="state.rules.phone" />
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12" md="6">
									<v-text-field dense label="Username" @keydown="resetUsernameError" v-model="state.user.username"
										:error="state.rules.username.error.status" :error-messages="state.rules.username.error.message"
										:rules="state.rules.username.required" required />
								</v-col>
								<v-col cols="12" md="6">
									<v-select dense label="Type" :items="state.types" v-model="state.user.type" :rules="state.rules.type"
										required />
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12" md="6">
									<v-text-field dense label="Password" :type="state.showPassword ? 'text' : 'password'"
										v-model="state.user.password" :rules="state.rules.password()" required>
										<v-icon slot="append" small style="cursor: pointer"
											@click="state.showPassword = !state.showPassword">visibility
										</v-icon>
									</v-text-field>
								</v-col>
								<v-col cols="12" md="6">
									<v-select dense label="Status" :items="state.statuses" v-model="state.user.status"
										:rules="state.rules.status" />
								</v-col>
							</v-row>
						</v-form>
					</v-container>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="error" @click="close">Close</v-btn>
					<v-btn color="primary" @click="state.editing ? confirmEdit() : createUser()">{{ state.editing ? 'Edit' :
							'Save'
					}}</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>


		<v-card>
			<v-card-title>
				<v-text-field v-model="state.search" append-icon="search" label="Search" single-line hide-details />
				<v-spacer></v-spacer>
				<v-btn class="blue white--text" @click="showDialog" small>
					Create new user
				</v-btn>
			</v-card-title>
			<v-data-table :headers="state.headers" :items="state.users" :search="state.search" dense :items-per-page="5" :footer-props="{
				prevIcon: 'chevron_left',
				nextIcon: 'chevron_right',
			}">
				<template v-slot:item.no="{ item, index }">
					{{ index + 1 }}
				</template>

				<template v-slot:item.actions="{ item }">
					<v-icon small color="primary" class="mr-2" @click="editUser(item)">
						edit
					</v-icon>
					<v-icon small color="error" @click="deleteUser(item)" v-if="!isSelf(item.id) || item.id != 1">
						delete
					</v-icon>
				</template>
			</v-data-table>
		</v-card>
	</v-container>
</template>
