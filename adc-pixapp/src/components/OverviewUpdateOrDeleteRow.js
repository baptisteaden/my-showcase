import React from 'react'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'


const OverviewUpdateOrDeleteRow = ({ product, index, name, onClick }) => {
	const decodedName = decodeURIComponent(name)
	return (
		<TableRow 
			data-product={product} 
			data-index={index} 
			onClick={onClick}
		>
			<TableCell>
				<img 
					src={'images/realisations/' + product + '/840/' + name}
					className='tiny' 
				/>
			</TableCell>
			<TableCell title={decodedName}>{decodedName}</TableCell>
		</TableRow>
	)
}

export default OverviewUpdateOrDeleteRow