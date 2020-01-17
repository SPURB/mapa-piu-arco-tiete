import { Vector as VectorLayer } from 'ol/layer'
import VectorSource from 'ol/source/Vector.js'
import { DEVICE_PIXEL_RATIO as pixelRatio } from 'ol/has.js'
import KML from 'ol/format/KML'
import { Style, Icon, Stroke, Fill } from 'ol/style'

/**
 * 
 * @param {String} name The Layer name
 * @param {String} path The KML source path
 * @param { Object } project project.id -> Kml numerical id | project.indicador -> Layer (indicador) numerical id
 * @param {String} icon The icon path
 * @returns { Object } Open Layer new Vector instance
 */
function setIconLayer (name, path, project, icon){
	const source = new VectorSource ({
		url: path, 
		format: new KML ({ extractStyles: false })
	})

	const style = new Style({
		image: new Icon({
			src: icon
		})
	})

	return new VectorLayer({
		name: name,
		source: source,
		projectId: project.id,
		projectIndicador: project.indicador,
		style: style
	})
}

/**
 * Return open layer with two overlaped layers
 * @param { String } name Layer name
 * @param { String } path kml file complete path
 * @param { Object } project project.id -> Kml numerical id | project.indicador -> Layer (indicador) numerical id
 * @param { Array } lines Array of Objects -> { width -> Number, color -> [ r, g, b, a ] }
 * @param { String } lineCap Open layer Stroke option, see 'lineCap'. Acceptables: 'butt', 'round', 'square' https://openlayers.org/en/latest/apidoc/module-ol_style_Stroke.html#~Options 
 * @returns { Object } Open Layer new Vector instance
 */
function setTwoStrokes(name, path, project, lines, lineCap, lineDash = false) {
	const source = new VectorSource({
		url: path,
		format: new KML({ extractStyles: false })
	})

	const styles = lines
		.map(line => {
			return new Style ({
				stroke: new Stroke({
					width: line.width,
					color: line.color,
					lineCap: lineCap,
					lineDash: lineDash
				})
			})
		})

	return new VectorLayer ({
		name: name,
		source: source,
		projectId: project.id,
		projectIndicador: project.indicador,
		style: styles
	})
}

/**
 * Return open layer source and file from kml file
 * @param { String } name Layer name
 * @param { String } path kml file complete path
 * @param { Object } project project.id -> Kml numerical id | project.indicador -> Layer (indicador) numerical id
 * @param { String } type the Pattern type valid -> 'lines-crossed', 'lines-diagonal', 'lines-vertical', 'lines-horizontal' or 'dots'
 * @param { Array } fillStyle Set the line color. Optional [r,g,b,a]
 * @returns { Object } Open Layer new Vector instance
 */
function setPatternLayer(name, path, project, type, fillStyle = [0, 0, 0, 1]){
	const canvas = document.createElement('canvas')
	const context = canvas.getContext('2d')

	const pattern = (function() {
		canvas.width = 8 * pixelRatio
		canvas.height = 8 * pixelRatio
		context.fillStyle = `rgb(${fillStyle[0]}, ${fillStyle[1]}, ${fillStyle[2]})`

		context.beginPath()


		if(type === 'lines-crossed'){
			canvas.width = 12 * pixelRatio
			canvas.height = 12 * pixelRatio

			context.moveTo(0, 0)
			context.lineTo(canvas.width, canvas.height)
			context.strokeStyle = `rgba(0, 0, 0, 0.5)`
			context.stroke()
	
			context.beginPath()
			context.moveTo(canvas.width, 0)
			context.lineTo(0, canvas.height)
			context.strokeStyle = `rgba(0, 0, 0, 0.5)`
			context.stroke()

		}
		if(type === 'lines-diagonal'){
			context.fillRect(0, 0, canvas.width, canvas.height)
			context.lineWidth = 1.5
			context.moveTo(canvas.width, 0)
			context.lineTo(0, canvas.height)
			context.strokeStyle = `rgba(255, 255, 255, 0.5)`
			context.lineCap = 'square'
			context.stroke()
		}

		if(type === 'lines-vertical'){
			context.moveTo(canvas.width/2, 0)
			context.lineTo(canvas.width/2, canvas.height)
			context.strokeStyle = `rgba(0, 0, 0, 0.5)`
			context.stroke()
		}

		if(type === 'lines-horizontal'){
			context.moveTo(0, canvas.height/2)
			context.lineTo(canvas.width, canvas.height/2)
			context.strokeStyle = `rgba(0, 0, 0, 0.5)`
			context.stroke()
		}
		if(type === 'dots'){ // inner circle
			context.arc(4 * pixelRatio, 4 * pixelRatio, 1.5 * pixelRatio, 0, 2 * Math.PI)
			context.fill()
		}
		if(type === 'balls'){ // inner circle
			context.arc(4 * pixelRatio, 4 * pixelRatio, 3 * pixelRatio, 0, 2 * Math.PI)
			context.strokeStyle = `rgba(0, 0, 0, 0.5)`
			context.stroke()
		}

		return context.createPattern(canvas, 'repeat')
	}())

	let getStackedStyle = () => {
		let style = new Style({
			stroke: new Stroke({
				color: `rgba(0, 0, 0, 0.5)`,
				width: 1,
			}),
			fill: new Fill({
				color: pattern
			})
		})
		return style
	}

	const source = new VectorSource({
		url: path,
		format: new KML({ extractStyles: false })
	})

	return new VectorLayer({
		title: name,
		source: source,
		style: getStackedStyle,
		projectId: project.id,
		projectIndicador: project.indicador
	})

}

/**
 * Return open layer source and file from kml file
 * @param { String } name Layer name
 * @param { String } path kml file complete path
 * @param { Object } project project.id -> Kml numerical id | project.indicador -> Layer (indicador) numerical id
 * @param { Object } custom custom open layer styles. Availables: color(Array), width(Number), lineDash(Number), fillCollor(Array)
 * @returns { Object } Open Layer new Vector instance
 */
function setLayer(name, path, project, custom = false){
	const source = new VectorSource({
		url: path,
		format: new KML({ extractStyles: false })
	})

	let style;

	const color = custom.color ? custom.color : [0, 0, 0, 1]
	const width = custom.width ? custom.width : 1
	const lineDash = custom.lineDash ? custom.lineDash : false
	const fillCollor = custom.fillCollor ? custom.fillCollor : [255, 255, 255, 0]

	style = new Style({
		stroke: new Stroke({
			color: color,
			width: width,
			lineDash: lineDash
		}),
		fill: new Fill({
			color: fillCollor
		})
	})

	return new VectorLayer({
		title: name,
		source: source,
		style: style,
		projectId: project.id, // !!! this is important !!!,
		projectIndicador: project.indicador
	})
}

/**
* Return the project data
* @param { Number } id The project id
* @param { Object } colocalizados  The colocalizados.json data
* @return { Object } The project data
*/
function getProjectData(id, colocalizados){
	let output = false
	for (let projeto in colocalizados){
		if (colocalizados[projeto].ID === id) { 
			output = colocalizados[projeto] 
		}
	}
	return output
}

export{ 
	setLayer,
	setTwoStrokes,
	setPatternLayer,
	setIconLayer,
	getProjectData
}