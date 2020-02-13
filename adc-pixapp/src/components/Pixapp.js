import React from 'react'
import OverviewPanel from './OverviewPanel'
import ProductTable from './ProductTable'
import PixAddContainer from './PixAddContainer'
import ReactNotification from 'react-notifications-component'

const Pixapp = ({ productTitles }) => (
	<React.Fragment>
		<ReactNotification />
		<OverviewPanel />
		<main>
			{/* Add pictures */}
			<PixAddContainer productTitles={productTitles} />
			<hr />
			
			{/* Update or delete pictures */}
			<h1>Modifier des informations / supprimer des photos</h1>
			{Object.keys(productTitles).map((productKey, i) => (
				<ProductTable key={i} id={productKey} />
			))}
		</main>
	</React.Fragment>
)


export default Pixapp