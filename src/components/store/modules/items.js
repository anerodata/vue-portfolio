import data from './../../../data/data.json';
const state = {
	items: [

	]
}

const getters = {
	items: (state) => state.items
}

const actions = {
	async fetchItems({commit}) {
		data.forEach(d => {
			d.visible = true
		})	
		commit('setItems', data)
	}
}

const mutations = {
	setItems: (state, items) => state.items = items
}

export default {
	state,
	getters,
	actions,
	mutations
}