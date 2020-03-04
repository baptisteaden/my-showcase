import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import reducer from './reducer'
import Pixapp from './components/Pixapp'
// Polyfillz for ie6-11..
import 'es6-promise/auto'
import 'isomorphic-fetch'
if (!HTMLCanvasElement.prototype.toBlob) {
   Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
     value: function (callback, type, quality) {
       var canvas = this;
       setTimeout(function() {
         var binStr = atob( canvas.toDataURL(type, quality).split(',')[1] ),
         len = binStr.length,
         arr = new Uint8Array(len);

         for (var i = 0; i < len; i++ ) {
            arr[i] = binStr.charCodeAt(i);
         }

         callback( new Blob( [arr], {type: type || 'image/png'} ) );
       });
     }
  });
}


/** Entry point for Pixapp react app. */

fetch('https://acierdesigncreation.com/realisations_data.json')
.then(data => data.json())
.then(data => {
	//console.log("Realisation pictures received:", data)
	
	// See state format in 'reducer.js')
	const updates = {}
	Object.keys(data).forEach(product => updates[product] = [])
	const initState = {
		additions: [],
		deletions: [],
		updates,
		data,
		// Additional states (track send button disabled prop, update state when reqs finishes)
		postPixStatus: null,
		deletePixStatus: null,
		postUpdatesStatus: null,
		emptyMandatoryFieldsRows: []
	}

	// { agencements: 'Agencements', ... }	
	const productTitles = {}
	Object.keys(data).forEach(productKey => {
		productTitles[productKey] = data[productKey].title.fr
	})

	const store = createStore(reducer, initState, applyMiddleware(thunk))
	//window['store'] = store

	render(
		<Provider store={store} >
			<Pixapp productTitles={productTitles} />
		</Provider>,
		document.getElementById('pixapp')
	)
})