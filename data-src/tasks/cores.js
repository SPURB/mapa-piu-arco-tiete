global.fetch = require('node-fetch')
import * as GetSheetDone from 'get-sheet-done'
import { createFile } from './helpers'

function cores(){
	let outputColors = {}
	const tables =[ 1 ] // 1 -> camadas

	tables.forEach(table => {
		GetSheetDone.labeledCols(process.env.GOOGLE_SHEET_ID, table)
			.then((data) => {
				data.data
					.forEach(projeto => {
						const colors = projeto.rgba
						const rgba = colors.split(',').map(color => Number(color))
						const indicador = projeto.indicador 
						outputColors[indicador] = rgba
					})
				return outputColors
			})
			.then( colors => { if(colors) createFile(colors, './data-src/json/cores.json') })
			.catch(err => console.error(err))
	})
}
cores()
