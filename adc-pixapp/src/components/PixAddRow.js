import React from 'react'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import CircularProgress from '@material-ui/core/CircularProgress'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import InputAdornment from '@material-ui/core/InputAdornment'


class PixAddRow extends React.Component {
	constructor(props){
		super(props)
		this.state = { imgLoaded: false, selectLabelWidth: 0 }
		this.selectLabel = React.createRef()
		this.imgRef = React.createRef()
		this.ext = props.data.name.substr(props.data.name.lastIndexOf('.')) // Separate extension from name
		this.setImageSource(props.data._blob)	
	}

	componentDidUpdate(prevProps) {
		// '_fileName' is not updatable, so update means line deleted + React data reordered
		if(prevProps.data._fileName != this.props.data._fileName) {
			const newBlob = (this.props.data._blob.small) 
				? this.props.data._blob.small	// Loaded
				: this.props.data._blob			// Initial load not even finished 

			this.setImageSource(newBlob)
		}
	}

	componentDidMount() {
		this.setState({ selectLabelWidth: this.selectLabel.current.offsetWidth })
	}


	/** Read image blob and set it as src */
	setImageSource(blob) {
		const reader = new FileReader()
		reader.readAsDataURL(blob)
		reader.onload = e => {
			this.imgRef.current.src = e.target.result
		}
	}

	handleChange = e => {
		const { onChange, index } = this.props
		const path = ['additions', index]
		const value = encodeURIComponent(e.target.value)
		let name = e.target.name.split('.')

		// For props in an intermediate object
		if(name.length == 2) {
			path.push(name[0])
			name = name[1]
		} else {
			name = name[0]
		}

		onChange(path, name, (name === 'name') ? value + this.ext : value)
	}


	handleDelete = () => {
		this.props.onDelete(['additions'], this.props.index)
	}

	handleImageLoad = e => {
		const { data, index, onImageLoad } = this.props
		onImageLoad(e.target, data._blob, index, () => this.setState({ imgLoaded: true }))
	}

	render() {
		const { productTitles, data, index } = this.props
		const { imgLoaded, selectLabelWidth } = this.state
		let name = data.name.substr(0, data.name.lastIndexOf('.'))
		name = decodeURIComponent(name)

		return (
			<TableRow data-index={index}>

				{/* Delete button */}
				<TableCell>
					<Tooltip title='Supprimer'>
						<IconButton aria-label='delete' onClick={this.handleDelete}>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				</TableCell>

				{/* Image + original name */}
				<TableCell>
					{imgLoaded ? null : <CircularProgress />}
					<figure>
						<img
							ref={this.imgRef}
							className={imgLoaded ? 'small' : 'small hidden'}
							onLoad={(imgLoaded) ? null : this.handleImageLoad} 
						/>
						<figcaption>{decodeURIComponent(data._fileName)}</figcaption>
					</figure>
				</TableCell>

				{/* File name + product */}
				<TableCell>
					{/* File name */}
					<TextField 
						label='Nom fichier'
						name='name'
						variant='outlined' 
						value={name} 
						title={name + this.ext} 
						InputProps={{
							endAdornment: <InputAdornment position="end">{this.ext}</InputAdornment>
						}}
						onChange={this.handleChange}
						error={!name}
						helperText={(name) ? null : "Le nom de fichier ne peut être vide"}
						className='margin-bottom'
					/>
					{/* Product */}
					<FormControl error={!data._product} variant='outlined'>
						<InputLabel ref={this.selectLabel}>Produit</InputLabel>
						<Select 
							name='_product' 
							value={data._product} 
							onChange={this.handleChange} 
							labelWidth={selectLabelWidth}
						>
							{Object.keys(productTitles).map((productKey, i) => (
								<MenuItem 
									key={i} 
									value={productKey}
								>
									{productTitles[productKey]}
								</MenuItem>
							))}
						</Select>
						{data._product ? null : <FormHelperText>Catégorie obligatoire</FormHelperText>}
					</FormControl>
				</TableCell>

				{/* City fr + en */}
				<TableCell>
					{/* City fr */}
					<TextField 
						variant='outlined' 
						label='Ville (fr)'
						value={decodeURIComponent(data.fr.city)} 
						title={decodeURIComponent(data.fr.city)} 
						name='fr.city'
						onChange={this.handleChange}
						className='margin-bottom'
					/>
					{/* City en */}
					<TextField 
						variant='outlined' 
						label='Ville (en)'
						value={decodeURIComponent(data.en.city)} 
						title={decodeURIComponent(data.en.city)} 
						name='en.city'
						onChange={this.handleChange}
					/>
				</TableCell>

				{/* Description fr + en */}
				<TableCell>
					{/* Description fr */}
					<TextField 
						variant='outlined' 
						label='Description (fr)'
						value={decodeURIComponent(data.fr.description)} 
						title={decodeURIComponent(data.fr.description)} 
						name='fr.description'
						onChange={this.handleChange}
						className='margin-bottom'
					/>
					{/* Description en*/}
					<TextField 
						variant='outlined' 
						label='Description (en)'
						value={decodeURIComponent(data.en.description)} 
						title={decodeURIComponent(data.en.description)} 
						name='en.description'
						onChange={this.handleChange}
					/>
				</TableCell>
			</TableRow>
		)
	}	 
}



export default PixAddRow