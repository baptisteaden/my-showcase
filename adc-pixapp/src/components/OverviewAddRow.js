import React from 'react'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import CircularProgress from '@material-ui/core/CircularProgress'


class OverviewAddRow extends React.Component {
	constructor(props){
		super(props)
		this.state = { imgLoaded: false }
		this.imgRef = React.createRef()
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

	/** Read image blob and set it as src */
	setImageSource(blob) {
		const reader = new FileReader()
		reader.readAsDataURL(blob)
		reader.onload = e => {
			this.imgRef.current.src = e.target.result
		}
	}


	render() {
		const { index, data, error, onClick } = this.props
		const { imgLoaded } = this.state
		return (
			<TableRow 
				className={(error) ? 'error' : null} 
				onClick={onClick} 
				data-index={index}
			>
				<TableCell>
					{imgLoaded ? null : <CircularProgress />}
					<img
						ref={this.imgRef}
						className={imgLoaded ? 'tiny' : 'tiny hidden'}
						onLoad={(imgLoaded) ? null : () => this.setState({ imgLoaded: true })} 
					/>
				</TableCell>
				<TableCell title={(error) ? 'Un champ obligatoire est vide' : 'Cliquez pour afficher la ligne'}>
					{decodeURIComponent(data.name)}
				</TableCell>
			</TableRow>
		)
	}	 
}



export default OverviewAddRow