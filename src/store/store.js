import Vue from 'vue'
import Vuex from 'vuex'
import { json } from 'd3-fetch'
import { ORGS } from './../data/variables.js'

Vue.use(Vuex)

export const store = new Vuex.Store({
	state: {
		// Items
		allItems: [],
		// Filtered items
		items: [],
		// Treemap JSON
		treemapData: {},
		// Orgs
		orgs: ORGS,
		// Current orgs
		selectedOrg: 'all'
	},
	mutations: {
		fetchItems: (state, response) => {
			state.allItems = response
			state.items = state.allItems
		},
		filterItems: (state, payload) => {
			state.selectedOrg = payload
			if (payload === 'all') {
				state.items = state.allItems
			} else if(payload === 'Otros') {
				state.items = state.allItems.filter(d => {
					return d['organización'] !== 'El Confidencial' && d['organización'] !== 'Civio'
				})
			} else {
				state.items = state.allItems.filter(d => {
					return d['organización'] === payload
				})
			}
		},
		setTreemapData(state) {
			const res = state.items.reduce((acc, obj) => {
			// Loop in library array
				obj.biblioteca.forEach((bib) => {

					// Get tec (js, py) and lib (Leaflet, bs4)
					const keys = bib.split('.')
					let keyTec = keys[1]
					let keyLib = keys[0]
					if(keys[1] === undefined) {
						keyTec = 'Otras'
					}
					// If global children array doesn't have and object with tec name...
					if(!acc.children.some(allChild => allChild.name === keyTec)) {
					  //... create it
						acc.children.push({name: keyTec, sum: 0, children: []})
					}

					// Get children tec array
					const keyList = acc.children.filter(allChild => allChild.name === keyTec)[0]

					// If children tec array doesn't have and object with lib name...
					if(!keyList.children.some(tecChild => tecChild.name === keyLib)) {
						//... create it
						keyList.children.push({name: keyLib, value: 1})
						keyList.sum += 1
					} else {
						// Otherwise, add 1 to value property of the array
						const tecList = keyList.children.filter(tecChild => tecChild.name === keyLib)[0]
						tecList.value += 1
						keyList.sum += 1
					}
       			})
		        return acc
		    }, { name: 'all', children: [] })

			res.children = sortArr(res.children, 'sum')
			res.children.forEach(child => { sortArr(child.children, 'value') })
			function sortArr(arr, prop) {
				return arr.sort((a, b) => {
					if(a[prop] < b[prop]) {
					  return 1
					} else {
					  return -1
					}
				})
    		}
			state.treemapData = res
		}
	},
    actions: {
    	fetchItems(context) {
    		json('https://raw.githubusercontent.com/anerodata/portfolio/master/src/data/data.json')
    			.then(response => {
    				context.commit('fetchItems', response)	
					context.commit('setTreemapData')
    			})
    	},
    	filterItems: (context, payload) => {
    		context.commit('filterItems', payload)
    	}
    }
})