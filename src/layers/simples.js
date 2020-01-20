import { setLayer, setTwoStrokes, setPatternLayer, setIconLayer } from './helpers'
import habPrecarios from '../img/hab-precarios.svg'
import habProvisao from '../img/hab-provisao.svg'
import habCota from '../img/hab-cota.png'
import equipamentos from '../img/equipamentos.svg'

/**
* Create all layers for app
* @param { Object } projetos The projetos.json tree of /data-src/projetos/
* @param { Object } simples The simples.json data
* @param { String } app_url Url of this app (not attached to this app)
* @param { Object } cores The indicadores colors { indicador: [r, g, b, a] }
* @return { Array } Array of new Layers's (from Open Layers) to create de base
*/
function returnSimples (projetos, simples, app_url, cores) {
	let kmlLayers = []
	let validObjs = []
	Object.values(simples).forEach(value => { if(value.ID) { 
		validObjs.push({ 
			id: value.ID,
			name: value.NOME,
			indicador: value.INDICADOR
		})
	} })

	const dashedLayers = [ 'A2', 'A3', 'A4', 'A10', 'A21' , 'A15' ]
	const bigDots 	   = [ 'A12' ]
	const filledLayers = [ 'A11', 'A16' ]
	const biggerWidths = [ 'A7', 'A9' ]
	const twoStrokes   = [ 
		{ indicador: 'A5', type: 'butt'},
		{ indicador: 'A6', type: 'butt'},
		{ indicador: 'A8', type: 'butt'}
		// { indicador: 'A7', type: 'butt', lineDash: [ 15 ] },
	] // pontes, passarelas, cicilopassarelas (passagens)
	const patternLayers = [
		{ indicador: 'A11r', type: 'lines-diagonal', color: cores['A11'] },
		{ indicador: 'A13', type: 'lines-diagonal', color: cores['A13'] },
		{ indicador: 'A22', type:'lines-crossed' }, // ZEIS 1
		{ indicador: 'A23', type:'lines-vertical' }, // ZEIS 2
		{ indicador: 'A24', type:'lines-horizontal' }, // ZEIS 3
		{ indicador: 'A25', type:'balls' }, // ZEIS 5
	]
	const iconLayers = [ 
		{ indicador: 'A17', icon: equipamentos },
		{ indicador: 'A18', icon: habPrecarios },
		{ indicador: 'A19', icon: habProvisao },
		{ indicador: 'A20', icon: habCota }
	]

	let isDashed = dashed => dashedLayers.includes(dashed)
	let isBigDot = doted => bigDots.includes(doted)
	let isFilled = filled => filledLayers.includes(filled)
	let isBigWid = bigger => biggerWidths.includes(bigger)
	let isTwoStr = stroke => twoStrokes.find(object => object.indicador === stroke)
	let isPattrn = pattern => patternLayers.find(object => object.indicador === pattern)
	let isIconUs = icon => iconLayers.find(object => object.indicador === icon)

	validObjs.forEach(valid => {
		const files = projetos.find(obj => obj.id === valid.id)
		if (files) {
			files.children.forEach(file => {
				const indicador = valid.indicador
				const url = app_url + file.path
				const pattern = isPattrn(indicador)
				const twoStrs = isTwoStr(indicador)
				const icon = isIconUs(indicador)

				if (file.extension === '.kml') {
					const rgba = cores[indicador]
					const customStyles = { color: rgba }
					const name = valid.name
					const projeto = { id: valid.id, indicador: indicador }
					if (isFilled(indicador)) customStyles.fillCollor = [rgba[0], rgba[1], rgba[2], 0.5]
					if (isDashed(indicador)) customStyles.lineDash = [3]; customStyles.width = 1.5
					if (isBigDot(indicador)) { customStyles.lineDash = [1.25, 10]; customStyles.width = 5 }
					if (isBigWid(indicador)) customStyles.width = 5
					if (twoStrs) {
						const output = twoStrs.lineDash ?
							setTwoStrokes(
								name, url, projeto, [
									{ width: 10, color: rgba },
									{ width: 6, color: [ 255, 255, 255, 1 ] },
								],
								twoStrs.type,
								twoStrs.lineDash
							) :
							setTwoStrokes(
								name, url, projeto, [
									{ width: 5, color: rgba },
									{ width: 2, color: [ 255, 255, 255, 1 ] },
								],
								twoStrs.type
							)
						kmlLayers.push(output)
					}
					else if (icon) { kmlLayers.push(setIconLayer(name, url, projeto, icon.icon)) }
					else if (pattern) {
						pattern.color ? 
						kmlLayers.push(setPatternLayer(name, url, projeto, pattern.type, pattern.color)) :
						kmlLayers.push(setPatternLayer(name, url, projeto, pattern.type))
					}
					else if (!pattern || !twoStrs || !icon ){ kmlLayers.push(setLayer(name, url, projeto, customStyles))}
				}
			})
		}
	})
	return kmlLayers
}

export { returnSimples }