import update from 'immutability-helper'

/* STATE FORMAT: 
{
	additions: [{
		_blob: File() AND THEN { big: File(), small: File() },
		_product: 'agencements',
		_fileName: 'AGENCEMENT%20(1).JPG',
		name: 'agencement-(1).jpg',
		fr: {
			'city': '',
			'description': ''
		},
		en: {
			'city': '',
			'description': ''
		}
	}],
	deletions: [
		['agencements', 3],
		['agencements', 6],
		['pieces-uniques', 2]
	],
	updates: {
		agencements: [3, 2, 6],
		escaliers: [],
		pieces-uniques: [],
		traitement-metaux: []
	},
	data: see 'realisations_data.json'
}*/

let _initState = null

const reducer = (state={}, action) => {
	switch (action.type) {

		// Update a field in 'additions' or 'data'
		case 'UPDATE_DATA': {
			// Format path + update value
			const { pathToUpdate, deepestObj } = formatPathForUpdate(action.path)
			deepestObj[action.key] = { $set: action.value }
			state = update(state, pathToUpdate)

			// Update 'data' (ie not 'additions'): also update 'updates'
			if(action.path[0] === 'data') {
				const product = action.path[1]
				const index = (typeof action.path[action.path.length-1] === 'number')
					? action.path[action.path.length-1]
					: action.path[action.path.length-2]
				
				// No change between init and new data => remove from 'updates'
				if(compareData(state, action.path)) {
					state = update(state, {updates: {[product]: arr => {
						// Remove if present (and new array), else do nothing
						let newArr = arr
						const indexOfIndex = arr.indexOf(index)
						if(indexOfIndex !== -1) {
							newArr = [ ...newArr ]
							newArr.splice(indexOfIndex, 1)
						}
						return newArr
					}}})
				}

				// Init and new data are different => add to 'updates' 
				else {
					state = update(state, {updates: {[product]: arr => {
						return (arr.includes(index)) ? arr : [ ...arr, index ]
					}}})
				}	
			}

			// Update 'additions': check mandatory fields (ie name, _product) 
			else {
				const addition = state.additions[action.path[1]]
				if(!addition.name.substring(0, addition.name.lastIndexOf('.')) || !addition._product) {
					// Mandatory fields are empty => put row index in state (if not present)
					state = update(state, {emptyMandatoryFieldsRows:
						arr => (arr.includes(action.path[1])) ? arr : [ ...arr, action.path[1] ]
					})
				} else {
					// Mandatory fields are not empty => remove row index from state (if present)
					state = update(state, {emptyMandatoryFieldsRows: arr => {
						// Remove if present (and new array), else do nothing
						let newArr = arr
						const indexOfIndex = arr.indexOf(action.path[1])
						if(indexOfIndex !== -1) {
							newArr = [ ...newArr ]
							newArr.splice(indexOfIndex, 1)
						}
						return newArr
					}})
				}
			}

			return state
		}


		// Add entries to 'additions'
		case 'ADD_PIX': {
			const newAdditions = []
			for(let i=0; i<action.files.length; i++) {
				newAdditions.push({
					name: action.files[i].name
						.toLowerCase()
						.replace(/[ _]/g, '-')	// Replace ' ' and '_' by '-'
						.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),	// Remove accents
					_fileName: encodeURIComponent(action.files[i].name),
					_product: 'agencements',
					_blob: action.files[i],
					fr: {
						city: '',
						description: ''
					},
					en: {
						city: '',
						description: ''
					}
				})
			}
			return update(state, {additions: {$push: newAdditions}})
		}


		// Remove an entry from 'additions'
		case 'CANCEL_ADDITION': {
			// Remove an entry from 'additions'
			const { pathToUpdate, deepestObj } = formatPathForUpdate(action.path)
			deepestObj.$splice = [[action.index, 1]]
			state = update(state, pathToUpdate)
			return state
		}


		// Update property '_blob' of an entry in 'additions'
		case 'STORE_COMPRESSED_BLOBS': {
			// Store 1080p and 840p versions of image as blobs
			state = update(state, {additions: {[action.index]: {_blob: {
				$set: { big: action.bigBlob, small: action.smallBlob }
			}}}})
			return state
		}
		

		// Add or remove an entry of 'deletion'
		case 'TOGGLE_PIC_DELETION': {
			return (action.deleted) 
				? update(state, {deletions: {$push: [[action.product, action.index]]}})
				: update(state, {deletions: arr => (
					arr.filter(pair => pair[0] != action.product || pair[1] != action.index)
				)})
		}


		// Set 'postPixStatus' to 'requesting'
		case 'POST_PIX': {
			return {
				...state,
				postPixStatus: action.postPixStatus,
				postUpdatesStatus: action.postUpdatesStatus
			}
		}


		// Update 'postPixStatus' according to request status
		case 'POSTED_PIX': {
			return { ...state, postPixStatus: action.postPixStatus }
		}


		// Set 'deletePixStatus' to 'requesting'
		case 'DELETE_PIX': {
			return {
				...state,
				deletePixStatus: action.postPixStatus,
				postUpdatesStatus : action.postUpdatesStatus
			}
		}


		// Update 'deletePixStatus' according to request status
		case 'DELETED_PIX': {
			return { ...state, deletePixStatus: action.deletePixStatus }
		}


		// Set 'postUpdatesStatus' to 'requesting'
		case 'POST_UPDATES': {
			return { ...state, postUpdatesStatus : action.postUpdatesStatus }
		}


		// Manage updates according to requests status + reset them all
		case 'POSTED_UPDATES': {
			if(action.postUpdatesStatus === 'success') {
				// Empty 'updates' + set new 'data'
				Object.keys(state.updates).forEach(productArr => state.updates[productArr] = [])
				state.updates = { ...state.updates }
				state.data = action.data
				// Empty 'additions' if both requests succeeded
				if(state.postPixStatus === 'success') {
					state.additions = []
				}
				// Empty 'deletions' if both requests succeeded
				if(state.deletePixStatus === 'success') {
					state.deletions = []
				}
			}

			// In case of multiple requests, 'postUpdates' is always sent after others finished
			// So here we are guaranteed every requests are done => set null status
			return {
				...state,
				postPixStatus: null,
				deletePixStatus: null,
				postUpdatesStatus: null
			} 
		}


		default:
			if(action.type.startsWith('@@redux/INIT')) {
				// Keep initial state
				_initState = state
			}
			return state
	}
}


// FUNCTIONS


/** Format the path to update as needed for the update method
  * It does the whole path BUT the last value, which is referred as 'deepestObj' to set it afterwards
  * Ex: ['additions', 2] => {additions: {[2]: {deepestObj}}
  * With deepestObj = {}
  * @param path Array describing the path of the value to update
  * @return An object containing the whole path object like above and deepestObj 
  */
function formatPathForUpdate(path) {
	let pathToUpdate = {}
	let deepestObj = pathToUpdate
	path.forEach(prop => {
		deepestObj[prop] = {}
		deepestObj = deepestObj[prop]
	})

	return { pathToUpdate, deepestObj }
}


/** Compares a 'data' object at a path with the one at same path in '_initState' 
  * @return true if equal, false otherwise
  */
function compareData(newState, path) {
	// Get old object (if exists)
	let oldState = _initState
	for(let i=0; i<path.length-1; i++) {	// length-1 because of objects in object fr/en
		oldState = oldState[path[i]]
		if(oldState == null) {
			return false	// The object is not present in old data
		}
	}
	// Get new object
	for(let i=0; i<path.length-1; i++) {
		newState = newState[path[i]]
	}
	// Compare them
	return JSON.stringify(oldState) === JSON.stringify(newState)
}


export default reducer