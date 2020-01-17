global.fetch = require('node-fetch')
import * as GetSheetDone from 'get-sheet-done'
import { createFile, parseNameToNumericalId } from './helpers'

function mapas(){
	GetSheetDone.labeledCols(process.env.GOOGLE_SHEET_ID, 3) // mapas_camadas
		.then(data => {
			let output = []
			let raw = data.data
				.map(mapa => {
					return {
						"INDICADOR": mapa.indicador,
						"ID": Number(mapa.iddomapaqgis)
					}
				})
			
			const unique = raw
				.map(mapa => mapa.ID)
				.filter((value, id, array) => array.indexOf(value) === id)
			

			unique.forEach(id => {
				const layers = raw
					.filter(layer => layer.ID === id)
					.map(layer => layer.INDICADOR)
				output.push({
					'id': id,
					'layers': layers
				})
			})
			return output
		})
		.then( mapsArrayNoNames => {
			let outPutObject = {}

			GetSheetDone.labeledCols(process.env.GOOGLE_SHEET_ID, 2) // mapas_info
				.then(data => {
					data.data.forEach(item => {
						const idNumber = parseNameToNumericalId(item.iddomapaqgis)
						outPutObject[idNumber] = { 
							name: item.nome,
							legenda: item.legenda,
							descricao: item.descricao
						}
					})

					const mapsArrayWithNames = mapsArrayNoNames
						.map(item =>{
							item.name = outPutObject[item.id].name
							item.legenda = 'data-src/legendas/' + outPutObject[item.id].legenda
							item.descricao = outPutObject[item.id].descricao
							return item
						})
					// 
					// console.log(mapsArrayWithNames)
					return mapsArrayWithNames
				})
				.then(maps => createFile(maps, './data-src/json/mapas.json'))
		})
		.catch(err => console.error(err)
	)
}

mapas()
