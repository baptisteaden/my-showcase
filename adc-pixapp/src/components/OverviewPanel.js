import React from 'react'
import { connect } from 'react-redux'
import Fab from '@material-ui/core/Fab'
import SendIcon from '@material-ui/icons/Send'
import { postPix, deletePix, postUpdates } from '../actions'
import OverviewTable from './OverviewTable'

class OverviewPanel extends React.Component {
	constructor(props){
		super(props)
		this.pageHeader = React.createRef()
	}

	handleSend = () => {
		const { additions, deletions, updates, dispatch } = this.props
		const message = 'Ces modifications seront directement effectives sur le site acierdesigncreation.com.'
			+ '\n\nContinuer ?'
			
		if(!confirm(message))
			return

		if(additions.length === 0 && deletions.length === 0 && updates.length > 0) {
			dispatch(postUpdates())
			// In other cases, postUpdates is triggered after postPix/deletePix reqs finished successfully
		} else {
			if(deletions.length > 0) {
				dispatch(deletePix())
			}
			if(additions.length > 0) {
				dispatch(postPix())
			}
		}
	}

	handleAdditionClick = e => {
		const { index } = e.currentTarget.dataset
		document.querySelector('.pix-add-container tr[data-index="' + index + '"]').scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		})
	}

	handleUpdateOrDeleteClick = e => {
		const { product, index } = e.currentTarget.dataset
		const panelSummary = document.querySelector('.product.' + product + ' .MuiExpansionPanelSummary-root')
		let openTransitionTime = 0
		if(!panelSummary.classList.contains('Mui-expanded')) {
			panelSummary.click()
			openTransitionTime = 200	// Wait for open transition
		}
		setTimeout(() => {
			document.querySelector('.product.' + product + ' tr[data-index="' + index + '"]').scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			})
		}, openTransitionTime)
	}

	scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })


	render() {
		const { additions, deletions, updates, isRequesting, emptyMandatoryFieldsRows, 
			data, dispatch } = this.props
		const noChanges = additions.length === 0 && deletions.length === 0 && updates.length === 0
		
		return (
			<div className='overview'>
				{/* Logo + title */}
				<div className='page-header' ref={this.pageHeader}>
					<a 
						href='#' 
						onMouseEnter={() => this.pageHeader.current.classList.add('hover')}
						onMouseLeave={() => this.pageHeader.current.classList.remove('hover')}
					>
						<img src='https://acierdesigncreation.com/images/logo_adc.png' className='logo' alt='Logo' />
					</a>
					<div id='page-description'>
						<h1 id='page-title'><a href='#'>Pixapp</a></h1>
						<p>
							L&apos;appli qui gère les photos du&nbsp; 
							<a 
								href='https://acierdesigncreation.com/fr'
								title='acierdesigncreation.com'
							>site ADC</a>
						</p>
					</div>
				</div>

				{/* Content */}
				<div className='overview-content'>
					{/* No data */}
					{ additions.length == 0 && deletions.length == 0 && updates.length == 0
						? <p className='no-update'>Aucune modification pour le moment</p>
						: null
					}

					{/* Additions */}
					<OverviewTable
						containerClass='additions'
						singTitle='image ajoutée'
						plurTitle='images ajoutées'
						rows={additions}
						emptyMandatoryFieldsRows={emptyMandatoryFieldsRows}
						onClick={this.handleAdditionClick}
					/>
				
					{/* Updates */}
					<OverviewTable
						containerClass='updates'
						singTitle="ligne d'informations modifiée"
						plurTitle="lignes d'informations modifiées"
						rows={updates}
						data={data}
						onClick={this.handleUpdateOrDeleteClick}
					/>

					{/* Deletions */}
					<OverviewTable
						containerClass='deletions'
						singTitle='image supprimée'
						plurTitle='images supprimées'
						rows={deletions}
						data={data}
						onClick={this.handleUpdateOrDeleteClick}
					/>
				</div>

				{/* Send button */}
				<div className='send-button-container'>
					<Fab 
						className='send-button' 
						variant='extended' 
						onClick={this.handleSend}
						disabled={noChanges || isRequesting || emptyMandatoryFieldsRows.length > 0}
					>
						Envoyer&nbsp;
						<SendIcon />
					</Fab>
				</div>
			</div>
		) 
	}	 
}

 

const mapStateToProps = state => {
	const { additions, deletions, updates, data, postPixStatus, deletePixStatus, postUpdatesStatus, 
		emptyMandatoryFieldsRows } = state
	
	// Format updates as array of arrays: [[product, index]] + filter if present in deletion
	let formattedUpdates = []
	Object.keys(updates).forEach(product => updates[product].forEach(index => {
		if(deletions.every(deletion => deletion[0] != product || deletion[1] != index)) {
			formattedUpdates.push([product, index])
		}
	}))

	return {
		isRequesting: postPixStatus === 'requesting' || deletePixStatus === 'requesting' || 
			postUpdatesStatus === 'requesting',
		emptyMandatoryFieldsRows,
		additions, 
		deletions, 
		updates: formattedUpdates,
		data
	}
}

export default connect(mapStateToProps)(OverviewPanel)