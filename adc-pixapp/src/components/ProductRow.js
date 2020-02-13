import React from 'react'
import { connect } from 'react-redux'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import TextField from '@material-ui/core/TextField'

export class ProductRow extends React.Component {
	constructor(props){
		super(props)
		this.updatePath = ['data', props.product, 'pictures', props.index]
	}

	handleChange = e => {
		const { onChange } = this.props
		let name = e.target.name.split('.')
		let path = this.updatePath

		// For props in an intermediate object
		if(name.length == 2) {
			path = this.updatePath.concat(name[0])
			name = name[1]
		} else {
			name = name[0]
		}
		
		onChange(path, name, encodeURIComponent(e.target.value))
	}

	handleRemove = () => {
		const { onRemove, product, index, deleted } = this.props
		onRemove(product, index, !deleted)
	}

	render(){
		const { product, index, data, deleted, updated } = this.props
		let className = null
		if(deleted) {
			className = 'deleted'	// Prevail on update
		} else if(updated) {
			className = 'updated'
		}
		
		return (
			<TableRow className={className} data-index={index}>
				{/* Delete button */}
				<TableCell>
					<Tooltip title={(deleted) ? 'Annuler la suppression' : 'Supprimer'}>
						<IconButton aria-label='delete' onClick={this.handleRemove}>
							{(deleted) ? <DeleteForeverIcon /> : <DeleteIcon />}
						</IconButton>
					</Tooltip>
				</TableCell>

				{/* Image + original title */}
				<TableCell>
					<figure>
						<img className='small' src={'../images/realisations/' + product + '/840/' + data.name} />
						<figcaption>{decodeURIComponent(data.name)}</figcaption>
					</figure>
				</TableCell>

				{/* City fr + en */}
				<TableCell>
					<TextField 
						name='fr.city' 
						variant='outlined' 
						label='Ville (fr)'
						value={decodeURIComponent(data.fr.city)} 
						onChange={this.handleChange} 
						className='margin-bottom'
						disabled={deleted}
						InputLabelProps={{
							classes: {
								root: 'input-label'
							}
						}}
					/>
					<TextField 
						name='en.city' 
						variant='outlined' 
						label='Ville (en)'
						value={decodeURIComponent(data.en.city)} 
						onChange={this.handleChange} 
						disabled={deleted}
						InputLabelProps={{
							classes: {
								root: 'input-label'
							}
						}}
					/>
				</TableCell>

				{/* Description fr + en */}
				<TableCell>
					<TextField 
						name='fr.description' 
						variant='outlined' 
						label='Description (fr)'
						value={decodeURIComponent(data.fr.description)} 
						onChange={this.handleChange} 
						className='margin-bottom'
						disabled={deleted}
						InputLabelProps={{
							classes: {
								root: 'input-label'
							}
						}}
					/>
					<TextField 
						name='en.description' 
						variant='outlined'
						label='Description (en)' 
						value={decodeURIComponent(data.en.description)} 
						onChange={this.handleChange} 
						disabled={deleted}
						InputLabelProps={{
							classes: {
								root: 'input-label'
							}
						}}
					/>
				</TableCell>
			</TableRow>
		) 
	}	 
}

 
const mapStateToProps = (state, ownProps) => {
	const deleted = state.deletions.some(deletion => 
		deletion[0] === ownProps.product && deletion[1] === ownProps.index
	)
	const updated = state.updates[ownProps.product].some(index => index === ownProps.index)
	return { deleted, updated }
}

export default connect(mapStateToProps)(ProductRow)