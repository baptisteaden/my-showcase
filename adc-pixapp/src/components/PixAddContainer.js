import React  from 'react'
import { connect } from 'react-redux'
import PixAddRow from './PixAddRow'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import HelpIcon from '@material-ui/icons/Help'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { addPix, updateData, cancelAddition, storeCompressedBlobs } from '../actions'
import 'babel-polyfill'		// For async function promise


class PixAddContainer extends React.Component {
	constructor(props){
		super(props)
		this.fileNameHelp = `
			Ce champ permet de renommer les fichiers avant de les envoyer sur le serveur. 
			Il est recommandé de le faire car cela améliore le référencement du site (= classement du site 
			lors d'une recherche). 
			Choisissez des noms de fichiers à la fois compréhensibles pour un humain et cohérents avec 
			le contenu de l'image. Exemple : 'escaliers-verre-jeulin-1.jpg'.
		`
	}

	handleFileAdd = e => {
		this.props.dispatch(addPix(e.target.files))
	}

	handleChange = (path, key, value) => {
		this.props.dispatch(updateData(path, key, value))
	}

	handleDelete = (path, index) => {
		this.props.dispatch(cancelAddition(path, index))
	}

	handleImageLoad = (img, initBlob, index, onBothCompressed) => {
		Promise.all([
			this.compressImage(img, initBlob, 1080),
			this.compressImage(img, initBlob, 840)
		])
		.then(compressedBlobs => {
			// Exec callback functon alerting child component the image can now display
			onBothCompressed()
			// And dispatch with the wanted 1080p and 840p blobs
			this.props.dispatch(storeCompressedBlobs(index, compressedBlobs[0], compressedBlobs[1]))
		})
	}

	/** Compress 'img' by lowering resolution and quality. 
	  * @param img The initial image just after it is loaded
	  * @param initBlob The initial blob read from the file input
	  * @param newHeight The new height to give to the image
	  */
	compressImage = async (img, initBlob, newHeight) => new Promise(resolve => {
		// First check that we can compress something (ie lower resolution or quality)
		if(img.height < newHeight) {
			newHeight = img.height	// Keep the same height
			if(initBlob.type != 'image/jpeg' && initBlob.type != 'image/webp') {
				resolve(initBlob)	// Cannot change quality either => just keep initial blob
			}
		}

		const elem = document.createElement('canvas')
		const scaleFactor = newHeight / img.height
		elem.height = newHeight
		elem.width = img.width * scaleFactor
		const ctx = elem.getContext('2d')
		ctx.drawImage(img, 0, 0, img.width * scaleFactor, newHeight)
		ctx.canvas.toBlob(res => resolve(res), initBlob.type, .7)
	})


	render() {
		const { productTitles, additions } = this.props
		return (
			<div className='pix-add-container'>
				{/* Title + add button */}
				<h1>
					Ajouter de nouvelles photos&nbsp;&nbsp;
					<Fab component='label' size='small' title='Ajouter'>
						<AddIcon />
						<input 
							id='add-files' 
							type='file' 
							value='' 
							onChange={this.handleFileAdd} 
							multiple 
							accept='image/*'
							style={{ display: 'none' }}
						/>
					</Fab>
				</h1>

				{/* Data table */}
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>{/* Delete button */}</TableCell>
							<TableCell>Image</TableCell>
							<TableCell>
								Nom fichier&nbsp;
								<Tooltip classes={{ tooltip: 'filename-help' }} title={this.fileNameHelp}>
									<HelpIcon />
								</Tooltip>
								<br/>
								Produit
							</TableCell>
							<TableCell>Ville (fr / en)</TableCell>
							<TableCell>Description (fr / en)</TableCell>
						</TableRow>
					</TableHead><TableBody>
						{(additions.length === 0)
							? (
								// Help message if no 'additions'
								<TableRow><TableCell colSpan={5} style={{ textAlign: 'center' }}>
									Cliquez sur le
									&nbsp;<AddIcon style={{ verticalAlign: 'middle'}} />&nbsp;
									ci-dessus pour ajouter des photos
								</TableCell></TableRow>
							) : (
								// Else display rows
								additions.map((addition, i) => (
									<PixAddRow 
										key={i} 
										index={i}
										data={additions[i]} 
										productTitles={productTitles} 
										onChange={this.handleChange}
										onDelete={this.handleDelete}
										onImageLoad={this.handleImageLoad}
									/>
								))
							)
						}
					</TableBody>
				</Table>
			</div>
		) 
	}	 
}


export default connect(state => ({ additions: state.additions }))(PixAddContainer)