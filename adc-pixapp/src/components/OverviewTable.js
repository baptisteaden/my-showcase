import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import OverviewAddRow from './OverviewAddRow'
import OverviewUpdateOrDeleteRow from './OverviewUpdateOrDeleteRow'


const OverviewTable = ({ containerClass, singTitle, plurTitle, rows, data, emptyMandatoryFieldsRows, onClick }) => (
	rows.length == 0 ? null : (
		<div className={containerClass}>
			<p className='overview-array-title'>
				{rows.length === 1 
					? '1 ' + singTitle
					: rows.length + ' ' + plurTitle
				}
			</p>
			<Table className='overview-array'><TableBody>
				{rows.map((row, i) => (containerClass === 'additions') ? (
					<OverviewAddRow 
						key={i} 
						index={i}
						data={row} 
						error={emptyMandatoryFieldsRows.includes(i)}
						onClick={onClick}
					/>
				) : (
					<OverviewUpdateOrDeleteRow 
						key={i}
						product={row[0]} 
						index={row[1]} 
						name={data[row[0]].pictures[row[1]].name}
						onClick={onClick}
					/>
				))}
			</TableBody></Table>
		</div>
	)
)

export default OverviewTable