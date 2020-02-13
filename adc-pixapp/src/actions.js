import update from 'immutability-helper'
import { store as notifStore } from 'react-notifications-component'

// ..................
let _deleting = false
let _adding = false

/** Addition */
export const addPix = files => ({
	type: 'ADD_PIX',
	files
})

/** Deletions */
export const togglePicDeletion = (product, index, deleted) => ({
	type: 'TOGGLE_PIC_DELETION',
	product, index, deleted
})

/** Update */
export const updateData = (path, key, value) => {
	return {
		type: 'UPDATE_DATA',
		path, key, value
	}
}


export const cancelAddition = (path, index) => {
	return {
		type: 'CANCEL_ADDITION',
		path, index
	}
}


export const storeCompressedBlobs = (index, bigBlob, smallBlob) => {
	return {
		type: 'STORE_COMPRESSED_BLOBS',
		index, bigBlob, smallBlob
	}
}




/**************************************************************************************** 
 * POST new pictures to server 
 */
export const postPix = () => (dispatch, getState) => {
	const { additions } = getState()

	// Fill in a FormData with picture pathes and blobs (1080p and 540p)
	const formData = new FormData()
	additions.forEach(addition => {
		const name = addition.name.substr(0, addition.name.lastIndexOf('.'))
		formData.append(addition._product + '/' + name, addition._blob.big)
		formData.append(addition._product + '/840/' + name, addition._blob.small)
	})

	// POST
	fetch(document.location.origin + '/pixapp/realisations', {
		method: 'POST',
		body: formData
	})
	.then(res => res.json())
	.then(res => {
		// Notify store: postPix req finished
		dispatch({
			type: 'POSTED_PIX', 
			postPixStatus: res.status 
		})
		_adding = false

		// Notify user
		notifyUser(res, 'Image(s) ajoutée(s) avec succès')

		// No other request => update json
		//if(getState().deletePixStatus != 'requesting') {
		if(!_deleting) {
			const postUpdatesObj = postUpdates()
			if(postUpdatesObj) {
				dispatch(postUpdatesObj)
			}
		}
	})

	// .......
	_adding = true

	// Notify store: postPix req sent
	return { 
		type: 'POST_PIX', 
		postPixStatus: 'requesting', 
		postUpdatesStatus: 'requesting'
	}
}


/**************************************************************************************** 
 * DELETE pictures from server 
 */
export const deletePix = () => (dispatch, getState) => {
	const { deletions, data } = getState()

	// Fill in a FormData with picture pathes to delete
	const deletionPaths = []
	deletions.forEach(deletion => {
		deletionPaths.push(deletion[0] + '/' + data[deletion[0]].pictures[deletion[1]].name)
		deletionPaths.push(deletion[0] + '/840/' + data[deletion[0]].pictures[deletion[1]].name)
	})

	// DELETE
	fetch(document.location.origin + '/pixapp/realisations', {
		method: 'DELETE',
		body: JSON.stringify(deletionPaths)
	})
	.then(res => res.json())
	.then(res => {
		// Notify store: deletePix req finished
		dispatch({ 
			type: 'DELETED_PIX', 
			deletePixStatus: res.status 
		})
		_deleting = false

		// Notify user
		notifyUser(res, 'Image(s) supprimée(s) avec succès')

		// No other request => update json
		//if(getState().postPixStatus != 'requesting') {
		if(!_adding) {
			const postUpdatesObj = postUpdates()
			if(postUpdatesObj) {
				dispatch(postUpdatesObj)
			}
		}
	})

	// ............
	_deleting = true

	// Notify store: deletePix req sent
	return { 
		type: 'DELETE_PIX', 
		deletePixStatus: 'requesting', 
		postUpdatesStatus: 'requesting'	// Set here because they are dependant
	}
}



/**************************************************************************************** 
 * POST new 'realisations_data.json' to server 
 * @return An action object to dispatch, or null if:
 * - there is no new data in 'additions', 'deletions' and 'updates'
 * - all previous requests failed (postPix, deletePix)
 */
export const postUpdates = () => (dispatch, getState) => {
	const state = getState()
	const { additions, deletions, updates, postPixStatus, deletePixStatus } = state
	let { data } = state
	const initData = data
	
	// Format and add 'additions' content to 'data'
	if(postPixStatus != 'error') {
		additions.forEach(addition => {
			const product = addition._product
			// Remove props not useful for server side, ie all props starting with '_'
			const cleanedAddition = update(addition, {
				$unset: Object.keys(addition).filter(key => key.startsWith('_'))
			})
			// Add to data
			data = update(data, {[product]: {pictures: {$push: [cleanedAddition]}}})
		})
	}

	// Remove 'deletions' content from 'data'
	if(deletePixStatus != 'error') {
		deletions.sort((a,b) => b[1]-a[1])	// Sort by descending order index for splice
		.forEach(deletion => {
			data = update(data, {[deletion[0]]: {pictures: {$splice: [[deletion[1], 1]]}}})
		})
	}

	// No POST if no change
	let updatesCount = 0
	Object.keys(updates).forEach(product => updatesCount += updates[product].length)
	if(data === initData && updatesCount === 0) {
		return null
	}

	// POST
	fetch(document.location.origin + '/pixapp/realisations_data', {
		method: 'POST',
		body: JSON.stringify(data)
	})
	.then(res => res.json())
	.then(res => {
		// Notify store: postUpdates req finished
		dispatch({ 
			type: 'POSTED_UPDATES', 
			postUpdatesStatus: res.status,
			data
		})
		// Notify user
		notifyUser(res, 'Informations mises à jour avec succès')
	})

	// Notify store: postUpdates req sent
	return { 
		type: 'POST_UPDATES', 
		postUpdatesStatus: 'requesting'
	}
}


/**************************************************************************************** 
  * Dispatch message to notifications store 
  */
const notifyUser = (res, successMessage) => {
	const animateConf = {
		duration: 300,
		timingFunction: 'ease-out',
		delay: 0
	}

	notifStore.addNotification({
		title: (res.status === 'success') ? 'Succès !' : 'Erreur',
		message: (res.status === 'success') ? successMessage : res.message,
		type: (res.status === 'success') ? 'success' : 'danger',
		insert: 'top',
		container: 'top-right',
		animationIn: ['animated', 'fadeIn'],
		animationOut: ['animated', 'fadeOut'],
		dismiss: {
			duration: (res.status === 'success') ? 7000 : 0,	// Error messages must be closed by the user
			pauseOnHover: (res.status === 'success') ? true : false,
			showIcon: (res.status === 'success') ? false : true
		},
		slidingEnter: animateConf,
		slidingExit: animateConf
	})
}