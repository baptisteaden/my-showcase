import React from 'react'
import { connect } from 'react-redux'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ProductRow from './ProductRow'
import { togglePicDeletion, updateData } from '../actions'


export class ProductTable extends React.Component {
	constructor(props){
		super(props)
		this.state = { visible: false }
	}

	handlePicChange = (path, name, value) => this.props.dispatch(updateData(path, name, value))

	handlePicRemove = (product, index, deleted) => this.props.dispatch(togglePicDeletion(product, index, deleted))

	render(){
		const { id, data } = this.props
		const { visible } = this.state

		return (
			<ExpansionPanel className={'product ' + id} expanded={visible}>		
				{/* Panel clickable title */}
				<ExpansionPanelSummary 
					expandIcon={<ExpandMoreIcon />}
					onClick={() => this.setState({ visible: !visible })}
				>
					<h2>{data.title.fr}</h2>
				</ExpansionPanelSummary>

				{/* Panel content */}
				<ExpansionPanelDetails className='content'>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>{/* Delete button */}</TableCell>
								<TableCell>Image</TableCell>
								<TableCell>Ville (fr / en)</TableCell>
								<TableCell>Description (fr / en)</TableCell>
							</TableRow>
						</TableHead><TableBody>
							{data.pictures.map((pic, i) => (
								<ProductRow 
									key={i} 
									index={i} 
									product={id} 
									data={pic} 
									onChange={this.handlePicChange}
									onRemove={this.handlePicRemove} 
								/>
							))}
						</TableBody>
					</Table>
				</ExpansionPanelDetails>
			</ExpansionPanel>
		) 
	}	
}


export default connect((state, ownProps) => ({ data: state.data[ownProps.id] }))(ProductTable)