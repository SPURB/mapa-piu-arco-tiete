import 'ol/ol.css'
import docReady from 'document-ready'
import Map from 'ol/Map'
import View from 'ol/View'
import { ScaleLine, ZoomSlider} from 'ol/control'
import { getProjectData } from './layers/helpers'
import { createBaseInfos, returnBases } from './layers/bases'
import { returnSimples } from './layers/simples'
import {
	projetos,
	mapaData,
	simples,
	cores,
	bases,
	apiGet
} from './model'

import {
	createList,
	createMapsBtns,
	listCreated,
	createMapInfo,
	switchlayers,
	fitToId,
	createBaseInfo,
	createCommentBox,
	createGoBackParticipe
} from './domRenderers';

import { 
	commentBoxEvents,
	commentBoxSubmit,
	goBackParticipe,
	toggleMapMobile, 
	mapsBtnClickEvent,
	sidebarGoHome, 
	sidebarNavigate, 
	sideBarToggleFonte,
	closeObjectInfo, 
	mapObserver,
	layersController,
	tabsResetListeners
} from './eventListeners'
import seta from './img/seta.svg'

docReady(() => {
	let state = {
		projectSelected: false, // project clicked at map or right sidebar?
		mapSelected: false,
		idConsulta: 62, // id_consulta
		consultaFetch: false, // the Consultas table data from fetch. This is setted by addCommentBox after first load
		baseLayerObj: { id: 0, indicador: 'A1' }, // project main layer id,
		baseLayerObjects: [], // other bases. ex. -> {id: 202, indicador: 'A34'},
		bing: true,
		appUrl: process.env.APP_URL
	}

	const baseInfos = createBaseInfos(projetos, state.baseLayerObj.id, state.baseLayerObjects)
	const baseLayers = returnBases({ info: baseInfos.info, id: state.baseLayerObj.id, indicador: state.baseLayerObj.indicador }, baseInfos.infos, state.appUrl, cores, state.bing ) // open layer's BASE's layers
	const baseLayer = baseLayers.find(layer => layer.values_.projectIndicador === state.baseLayerObj.indicador)
	const simplesLayers = returnSimples(projetos, simples, state.appUrl, cores)

	const allLayers = [ ...simplesLayers ]
	const allLayersData = [ ...simples.default ]
	let indicadoresBases = state.baseLayerObjects.map( item => item.indicador )
	indicadoresBases.unshift(state.baseLayerObj.indicador)

	const isPortrait = window.matchMedia("(orientation: portrait)").matches // Boolean -> innerHeight < innerWidth
	const fitPadding = isPortrait ? [0, 0, 0, 0] : [0, 0, 0, 0] // padding for fit(extent, { padding: fitPadding }) and fitToId(..,.., fitPadding)

	let view = new View({
		center: [ -5194452.629090,-2694347.919281 ],
		projection: 'EPSG:3857',
		zoom: 7,
		minZoom: 12.7,
		maxZoom: 19
	})

	let appmap = new Map({
		title:'projetos',
		layers: baseLayers,
		loadTilesWhileAnimating: true,
		target: 'map',
		view: view,
		controls:[] // remove defaults (compass, +- zoom buttons, attribution)
	})

	/*
	* Create DOM elements
	*/
	const addPannels = new Promise (resolve => {
		setTimeout(() => {
			resolve(
				createBaseInfo(getProjectData(state.baseLayerObj.id, bases), projetos), // sidebar first load
				createList(allLayersData, cores),
				createMapsBtns(mapaData, "#mapas", "mapas-"),
				createGoBackParticipe('go-back-participe', seta,'Texto da consulta')
			)
		},0)
	})
	.then(()=>{
		goBackParticipe('go-back-participe', `${window.location.origin}/arco-tiete-2`)
	})

	const addCommentBox = apiGet('consultas', state.idConsulta) //fetch from api
		.then(consulta => {
			const isOpen = Number(consulta.ativo) // consulta.ativo is '0' or '1'
			state.consultaFetch = consulta
			createCommentBox("baseInfo", state.projectSelected, isOpen)

			return isOpen
		})
		.then(formState => {
			if(formState) {
				commentBoxEvents('baseInfo'),
				commentBoxSubmit('baseInfo', state.idConsulta, 0, 'Mapa base')
			}		
		})
		.catch(error => error)

	/*
	* Create all other event listeners
	*/
	let pannelListeners = new Promise( (resolve, reject) => {
		setTimeout(() => {
			try{
				resolve(
					// sidebar
					sidebarGoHome(allLayers, baseLayer, view, fitPadding, appmap),
					sidebarNavigate(0),
					sideBarToggleFonte(),
					layersController(listCreated, allLayers, cores, view, fitPadding, state, appmap, allLayersData),
					mapsBtnClickEvent(mapaData,"#mapas", appmap, allLayers, indicadoresBases, state, baseLayer),
					closeObjectInfo('mapInfo', 'closeMapInfo'),
					closeObjectInfo('info', 'closeInfo'),

					// map
					toggleMapMobile(), 
					mapObserver(isPortrait, appmap)
				)
			}
			catch(error) { reject(error) }

		}, 1)
	})

	/*
	* Fit the view to base layer and run hash location map
	*/
	const firstLoad = new Promise( (resolve, reject) => {
		const baseLayer = baseLayers.find( layer => layer.values_.projectId === state.baseLayerObj.id)
		setTimeout(() => {
			try { resolve(fitToId(view, baseLayer, fitPadding)) }
			catch (error) { reject(error) }
		}, 1500 )
	})
	.then(() =>{
		let hashLocation = window.location.hash.replace("#","")
		hashLocation = Number(hashLocation)
		const mapDataLocated = mapaData.find(data => data.id === hashLocation)

		if(mapDataLocated) {
			const validLayers = mapDataLocated.layers
				.map(indicador => allLayers.find(layer => layer.get("projectIndicador") === indicador))
				.filter(layer => layer !== undefined)

			switchlayers(true, validLayers, appmap)
			createMapInfo(mapDataLocated)

			// <form mapas>
			createCommentBox("mapInfoCommentbox", state.mapSelected, Number(state.consultaFetch.ativo))

			state.mapSelected = true
			sidebarNavigate(2)
			document.getElementById('mapas-' + mapDataLocated.id).classList.add('active')
		}
		return mapDataLocated

	})
	.then(data => {

		tabsResetListeners(['baseInfo', 'legenda-projetos'], '#mapInfo')

		if (state.consultaFetch.ativo === '1'){
			// <form mapas>
			commentBoxEvents('mapInfoCommentbox'),
			commentBoxSubmit('mapInfoCommentbox', state.idConsulta, data.id, data.name)
		}
	})

	const addControls = new Promise ( (resolve, reject) => {
		setTimeout(() => {
			try { resolve(appmap.addControl(new ScaleLine()), appmap.addControl(new ZoomSlider())) }
			catch (error) { reject(error) }
		}, 1)
	})

	/*
	* Ordered app initiation chain. This is done just once
	*/
	Promise.all([
		/*
		 * Create DOM elements
		*/
		addPannels,
		addCommentBox
	])
	/*
	* Then chain event listeners
	*/
	.then( () => pannelListeners )
	/*
	 * and map events
	*/
	.then( () => firstLoad )
	.then( () => addControls )
	// TODO: fetch comments of state.idConsulta
	.catch( error => { 
		throw new Error(error)
	})
})
