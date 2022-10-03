<script setup>
import axios from 'axios';
import { reactive, ref, onMounted } from 'vue';

const requiredRule = val => !!val || 'Required!'

const state = reactive({
	search: '',
	headers: [
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
	editing: false,
	editIndex: -1,
	showPassword: false,
	user: {
		name: '',
		gender: '',
		email: '',
		phone: '',
		username: '',
		type: '',
		status: '',
	},
	password: '',
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
	]
})

const newUser = ref(null)

const showDialog = () => {
	if (newUser.value && newUser.value.reset) newUser.value.reset()
	state.editing = false
	state.dialog = true
}
const createUser = async () => {
	state.rules.username.error = {
		status: false,
		message: []
	}
	if (newUser.value.validate()) {
		if ((await axios.get(`/api/user?username=${state.user.username}`)).data.success) {
			return state.rules.username.error = {
				status: true,
				message: ['Username Exists!']
			}
		}
		// do axios call to create new user
		axios.post('/api/user', state.user)
			.then(result => {
				if (result.data.success) {
					// show success dialog
					fetch_list()
				}
			})
			.catch(err => {
				// show failed dialog
				console.log(err)
			})
	}
}
const editUser = (u) => {
	state.editing = true
	state.editIndex = state.users.indexOf(u)
	state.user = Object.assign({}, state.users[state.editIndex])
	state.dialog = true
}
const confirmEdit = () => {
	if (newUser.value.validate()) {
		// do axios call to edit user
	}
}
const deleteUser = (u) => {
	state.deletePrompt = true
}
const confirmDelete = () => {
	// do axios call to delete user
}
const close = () => {
	state.editing = false
	state.dialog = false
	Object.keys(state.user).forEach(key => state.user[key] = '')
}

const fetch_list = () => {
	axios.get('/api/user')
		.then(result => {
			state.users = []
			state.users = result.data.list
		})
		.catch(err => console.error(err))
}


fetch_list()
</script>

<template>
	<div class="main">
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
								<v-col class="cols-6">
									<v-text-field dense label="Name" v-model="state.user.name" :rules="state.rules.name" required />
								</v-col>
								<v-col class="cols-6">
									<v-select dense label="Gender" :items="state.genders" v-model="state.user.gender" :rules="state.rules.gender"
										required />
								</v-col>
							</v-row>
							<v-row>
								<v-col class="cols-6">
									<v-text-field dense label="Email" type="email" v-model="state.user.email" :rules="state.rules.email" />
								</v-col>
								<v-col class="cols-6">
									<v-text-field dense label="Phone" v-model="state.user.phone" :rules="state.rules.phone" />
								</v-col>
							</v-row>
							<v-row>
								<v-col class="cols-6">
									<v-text-field dense label="Username" v-model="state.user.username" :error="state.rules.username.error.status" :error-messages="state.rules.username.error.message" :rules="state.rules.username.required" required />
								</v-col>
								<v-col class="cols-6">
									<v-select dense label="Type" :items="state.types" v-model="state.user.type" :rules="state.rules.type" required />
								</v-col>
							</v-row>
							<v-row>
								<v-col class="cols-6">
									<v-text-field dense label="Password" :type="state.showPassword ? 'text' : 'password'"
										v-model="state.password" :rules="state.rules.password()" required>
										<v-icon slot="append" small style="cursor: pointer" @click="state.showPassword = !state.showPassword">mdi-eye
										</v-icon>
									</v-text-field>
								</v-col>
								<v-col class="cols-6">
									<v-select dense label="Status" :items="state.statuses" v-model="state.user.status" :rules="state.rules.status" />
								</v-col>
							</v-row>
						</v-form>
					</v-container>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="error" @click="close">Close</v-btn>
					<v-btn color="primary" @click="state.editing ? confirmEdit() : createUser()">Save</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>


		<v-card>
			<v-card-title>
				<v-text-field v-model="state.search" append-icon="mdi-magnify" label="Search" single-line hide-details />
				<v-spacer></v-spacer>
				<v-btn class="blue white--text" @click="showDialog" small>
					Create new user
				</v-btn>
			</v-card-title>
			<v-data-table :headers="state.headers" :items="state.users" :search="state.search" dense :items-per-page="5">
				<template v-slot:item.actions="{ item }">
					<v-icon small class="mr-2" @click="editUser(item)">
						mdi-pencil
					</v-icon>
					<v-icon small @click="deleteUser(item)">
						mdi-delete
					</v-icon>
				</template>
			</v-data-table>
		</v-card>
	</div>
</template>


<style scoped>
.main {
	margin: 2rem;
	display: grid;
	grid-template-columns: repeat(1, 1fr);
	gap: 2rem;
}
</style>