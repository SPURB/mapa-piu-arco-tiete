global.fetch = require('node-fetch')
import * as GetSheetDone from 'get-sheet-done'
import { createFile } from './helpers'

/**
* Create .data-src/json/simples.json
* @param { String } baseIds Map base layers ids from google sheet
* @return { File } A json file
*/
function simples(baseIds){
	GetSheetDone.labeledCols(process.env.GOOGLE_SHEET_ID, 1) // camadas
		.then((data) => {
			const simples = data.data
			let output = simples
			.map(projeto => {
				return {
					"ID": Number(projeto.iddokml),
					"INDICADOR": projeto.indicador,
					"NOME": projeto.titulodacamadanomapainterativo,
					"DESCRIÇÃO": projeto.descricaodacamada,
					"ANO": 2019, //fake input
					"SECRETARIA": "MSP", //fake input
					"STATUS": 0, //fake input
					"AUTOR": "SP Urbanismo", //fake input
					"FONTE": "SP Urbanismo" //fake input
				}
			})

			let basesOutput = []
			let simplesOutput = []

			output.forEach(item => {
				if (baseIds.includes(item.ID)) basesOutput.push(item)
				else { simplesOutput.push(item) }
			})

			createFile(basesOutput, './data-src/json/bases.json')
			createFile(simplesOutput, './data-src/json/simples.json')

		})
		.catch(err => console.error(err)
	)
}
simples([0])
