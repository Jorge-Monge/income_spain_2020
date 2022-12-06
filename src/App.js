import React, { useState, useRef, useEffect, useCallback } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import createMapView from "./utils/map"
import createLegend from "./utils/legend"
import mapItems from "./data/mapItems.json"
import featServiceInfo from "./data/featService.json"

import TileLayer from "@arcgis/core/layers/TileLayer"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import Graphic from "@arcgis/core/Graphic"
import Picklist from "./components/Picklist"
import ButtonWithIcon from "./components/ButtonWithIcon"
//import JmLogo from "./components/JmLogo"
import QueryResultsTable from "./components/QueryResultsTable"
import Modal from "./components/Modal"
import LanguageSwitcher from "./components/LanguageSwitcher"
import { CalciteIcon } from "@esri/calcite-components-react"

import classes from "./App.module.css"

let previousMapViewProperties = {
  center: [-3, 39],
  zoom: 5,
}

// Marker which is inserted when user clicks on a location
const symbol = {
  type: "picture-marker", // autocasts as new PictureMarkerSymbol()
  url: "https://i.ibb.co/cTFXSVN/icons8-place-marker-24.png",
  width: "24px",
  height: "24px",
}

let myMap
let graphicsLayer // ArcGIS GraphicLayer instance
let attribBeingMapped // Attribute in the tile layer supportin the choropletic map being displayed at the moment
let toastStartupInfoMessage = "" // Information toast at startup

// There is a series of attributes with names like "NOTA1", "NOTA2", ... "NOTA9"
const fieldNotesAttribs = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => `NOTA${num}`)

// Query launched against the feature services upon click events
const spatQuerySkeleton = {
  spatialRelationship: "intersects",
  outFields: [
    "DATO1",
    "DATO2",
    "DATO3",
    "DATO4",
    "DATO5",
    "DATO6",
    "DATO7",
    "DATO8",
    "DATO9",
    "NMUN",
    ...fieldNotesAttribs,
  ],
  returnGeometry: false,
}

const obtainMapVariableFromLayer = (layerTitle, mapItems) => {
  /* This function gets a layer title, the content of a config. file, and returns the name of the attribute being mapped */

  return mapItems.filter((obj) => obj.layer_title === layerTitle)[0].attribute
}

const getMapTitleFromLayerTitle = (layerTitle, lang) => {
  let selItem = mapItems.filter((o) => o.layer_title === layerTitle)[0]
  return lang === "es" ? selItem.label : selItem.label_en
}

// Default to English if trouble grabbing the language from browser
let startupLanguage
let labelKeyName // Name of the "ken" in 'mapItems.json' containing the string for the map title
try {
  startupLanguage = navigator.languages[0].trim().slice(0, 2)
  // ATTENTION. Remove below.
  //startupLanguage = "es"
  if (startupLanguage === "en") {
    labelKeyName = "label_en"
  } else {
    startupLanguage = "es"
    labelKeyName = "label"
  }
  // dummy
} catch {
  startupLanguage = "en"
}

const App = () => {
  const [lang, setLang] = useState(startupLanguage)
  // startup map title taken from the JSON data's first element
  const [mapTitle, setMapTitle] = useState(
    mapItems.filter((obj) => obj.sortOrder === 1)[0][labelKeyName]
  )
  const [tileLayerUrl, setTileLayerUrl] = useState()
  const [selectedLyrItemId, setSelectedLyrItemId] = useState(1)
  const [displayLegend, setDisplayLegend] = useState(false)
  const [mapView, setMapView] = useState()
  const [displayLayerList, setDisplayLayerList] = useState(false)
  const [queriedRecordInfo, setQueriedRecordInfo] = useState()
  const [openRecordInfoWidget, setOpenRecordInfoWidget] = useState()
  const [showModal, setShowModal] = useState(false)

  const mapRef = useRef(null)
  const prevLangRef = useRef()
  const prevLayerUrlRef = useRef()

  const langSwitcherChangeHandler = (e) => {
    if (e.target.checked) {
      setLang(e.target.value)
    }
  }

  const onListItemPicked = (e) => {
    /* Fires when a layer is selected in the layer list.
     It does NOT fire for clicks on the currently selected item.
     This function basically sets the value of the local state 'tileLayerUrl'
     */

    e.preventDefault()

    onRecordInfoWidgetClose()

    // Change the tile layer in accordance with the item selected in the pick list
    if (e.detail.selected) {
      setSelectedLyrItemId(e.detail.value)
      let targetEnvVar = `REACT_APP_TLID${
        mapItems.filter((w) => w.sortOrder === e.detail.value)[0].sortOrder
      }`
      let targetTileLayer = process.env[targetEnvVar]
      setTileLayerUrl(targetTileLayer)
      setMapTitle(e.srcElement.label)

      // If the Legend was showing, recreate it
      if (displayLegend) {
        mapView.ui.empty("bottom-left")

        // It seems that "layerview-create" event number keeps growing as we select
        // other layers in the dropdown list. All events, somehow, seem to point only
        // to the active layer, so we'll shortcut at count = 1
        let count = 1
        mapView.on("layerview-create", (e) => {
          if (count === 1) {
            const legend = createLegend(mapView, e.layer, mapItems, lang)
            mapView.ui.add(legend, "bottom-left")
          }

          count++
        })
      }
    }

    // Hide the layer picklist after a click on an element
    setDisplayLayerList(false)
  }

  const clearGraphicsFromView = useCallback(() => {
    mapView.graphics.removeAll()
  }, [mapView])

  const onRecordInfoWidgetClose = (e) => {
    setOpenRecordInfoWidget(false)
    clearGraphicsFromView()
  }

  useEffect(() => {
    /* Changes the map title (in the header section) when the language changes */

    mapView &&
      mapView.when(() => {
        mapView.layerViews.items.forEach((lv) => {
          if (lv.layer.type === "tile") {
            setMapTitle(getMapTitleFromLayerTitle(lv.layer.title, lang))
          }
        })
      })

    prevLangRef.current = lang
  }, [mapView, lang])

  // Create the map view
  useEffect(() => {
    //eslint-disable-next-line
    let myView = createMapView(mapRef.current, previousMapViewProperties)

    myView.ui.empty("top-left")

    myMap = myView.map

    // graphics layer for the markers which appear on click events
    graphicsLayer = new GraphicsLayer({ title: "markers" })

    myMap.add(graphicsLayer)

    myView.when(() => {
      myView.map.basemap.baseLayers.items.forEach((bl) => {
        bl.popupEnabled = false
        bl.sublayers.items.forEach((sl) => {
          sl.popupEnabled = false
        })
      })

      setMapView(myView)
    })
  }, [])

  // Info message displayed upon view creation as well as when upon changes in the language.
  useEffect(() => {
    if (mapView && mapView.scale > 18489200) {
      toastStartupInfoMessage =
        lang === "es"
          ? "Una vez amplíe el mapa ligeramente, puede pulsar en un área y obtener información detallada sobre ella"
          : "Once you zoom in a little, you can click on an area and obtain detailed information about it"

      toast.info(toastStartupInfoMessage, {
        theme: "light",
        icon: "ℹ️",
        autoClose: 5000,
        type: "info",
        toastId: "info upon first rendering",
      })
    }
  }, [mapView, lang])

  useEffect(() => {
    /* Handle the showing and hiding of the Legend widget. Not triggered by the selection of a different layer. */

    mapView &&
      mapView.when(() => {
        mapView.ui.empty("bottom-left")

        if (displayLegend) {
          const targetLayer = mapView.map.layers.items.find(
            (l) => l.title !== "markers"
          )
          const legend = createLegend(mapView, targetLayer, mapItems, lang)

          mapView.ui.add(legend, "bottom-left")
        } else {
          mapView.ui.empty("bottom-left")
        }
      })
  }, [displayLegend, mapView, lang])

  // Add events to the map view, when it's ready
  useEffect(() => {
    /* When the View is ready, define its click event handler: query the appropriate feature service to retrieve the attributes */

    if (mapView) {
      mapView.when(() => {
        mapView.on("click", (e) => {
          // TOASTIFY WARNING
          // Is the zoom level enough to query a feature service? If not, show a notification

          if (mapView.scale > 18489200) {
            let toastMessage =
              lang === "es"
                ? "Para poder obtener información detallada de una zona, necesita ampliar más el mapa"
                : "In order to get information from a given area, you need to zoom in more"
            toast.error(toastMessage, {
              theme: "light",
              icon: "✋",
              autoClose: 5000,
              type: "error",
              toastId: "out of scale toast",
            })
          } else {
            // View scale is right to proceed
            // All feature services return all 9 data (but only for the given geographical unit: municipal, census districts, census sections, etc.)
            // Sublayer 1: municipal, 2: districts, 3: sections
            // Depending on the scale levels => choose a sublayer or the other

            clearGraphicsFromView()
            setQueriedRecordInfo()

            // DISPLAY A MARKER on the clicked position
            const { x, y, spatialReference } = e.mapPoint
            const geometry = {
              type: "point",
              x,
              y,
              spatialReference,
            }

            let picMarkerGraphic = new Graphic({
              symbol,
              geometry,
            })

            mapView.graphics.add(picMarkerGraphic)

            const subLayer = featServiceInfo.sublayers.filter((sl) => {
              return sl.minScale > mapView.scale && mapView.scale >= sl.maxScale
            })[0]

            if (!subLayer) {
              // Click when zoomed out too much
              // ATTENTION
              // Implement toastify
              console.error(
                "ERROR: Unable to determine feature service sub-layer"
              )
              return
            }

            // Open the record info widget, even if blank at the moment
            setOpenRecordInfoWidget(true)

            const featServiceUrl = process.env.REACT_APP_QUERY_FEAT_SERVICE
            let featLayer = new FeatureLayer({
              url: `${featServiceUrl}${subLayer.id}`,
            })

            // Slightly modify the query out fields depending on the selected feature service
            let newField = ""
            switch (subLayer.id) {
              case 1:
                newField = "Nivel"
                break
              case 2:
                newField = "Nivel1"
                break
              case 3:
                newField = "Nivel2"
                break
              default:
                newField = ""
            }

            // Starting with the basic spatial query, 'spatQuerySkeleton', add 1 field (named either 'Nivel', or 'Nivel1', or 'Nivel2')
            let spatQuery = {
              ...spatQuerySkeleton,
              outFields: [...spatQuerySkeleton.outFields, newField],
            }

            const startMilSecs = Date.now()
            featLayer
              .queryFeatures({ ...spatQuery, geometry: e.mapPoint })
              .then((results) => {
                // Send the result to the state, be it for an area that returned data or for an area for which the result was void
                if (results.features.length) {
                  // Enrich the returned data with info about which attribute is the one appearing in the choropleth map
                  let queryResultsObj = results.features[0].attributes
                  const endMilSecs = Date.now()

                  // If time invested is less than 3 secs, force to wait
                  setTimeout(() => {
                    setQueriedRecordInfo({
                      results: queryResultsObj,
                      attribBeingMapped,
                    })
                  }, 1500 - (endMilSecs - startMilSecs))
                } else {
                  setQueriedRecordInfo({
                    NODATA:
                      "Ubicación sin datos disponibles. Por favor seleccione otra.",
                  })
                }
              })
              .catch((error) => {
                setQueriedRecordInfo({
                  ERROR:
                    "Error al obtener datos del Instituto Nacional de Estadística. Por favor refresque la página del navegador pulsando la tecla 'F5'",
                })
              })
          }
        })

        // On focus over the view, close the layer-selection picklist
        mapView.on("focus", () => {
          setDisplayLayerList(false)
        })

        // On dragging over the view, close the layer-selection picklist
        mapView.on("drag", () => {
          setDisplayLayerList(false)
        })
      })
    }
  }, [mapView, clearGraphicsFromView, lang])

  /* At startup, add the initial tile layer. Then when a new layer is selected, remove the old layer and add the new to the map view */
  useEffect(() => {
    if (mapView) {
      // Remove the old tile layer first
      let url
      if (!tileLayerUrl) {
        url = process.env.REACT_APP_TLID1
      } else {
        url = tileLayerUrl
        mapView.when(() => {
          let layerToRemove = myMap.layers.items.filter(
            (l) => l.title !== "markers"
          )[0]
          if (layerToRemove) {
            myMap.remove(layerToRemove)
          }
        })
      }

      // Add the tile layer
      let tileLayer = new TileLayer({ url })
      myMap.add(tileLayer)
      tileLayer.opacity = 0.8

      // Send an array of attribute-identifying keywords to the 'attribBeingMapped' variable
      mapView.whenLayerView(tileLayer).then(() => {
        let tileLayerTitle = mapView.layerViews.items.find(
          (lv) => lv.layer.title !== "markers"
        ).layer.title

        attribBeingMapped = obtainMapVariableFromLayer(tileLayerTitle, mapItems)
      })

      //console.log("** prevLayerUrlRef.current", prevLayerUrlRef.current)

      //console.log("** tilelayerUrl:", tileLayerUrl)
      prevLayerUrlRef.current = url
    }

    return () => {
      if (mapView) {
        previousMapViewProperties = {
          center: mapView.center,
          zoom: mapView.zoom,
        }
      }
    }
  }, [mapView, tileLayerUrl])

  let layerBtnTxt = lang === "en" ? "Layers" : "Capas"
  let legendBtnTxt = lang === "en" ? "Legend" : "Leyenda"
  return (
    <React.Fragment>
      <div className={classes.titleLogoCtner}>
        <div className={classes.pageTitleCtner}>
          <div className={classes.infoIcon}>
            <CalciteIcon
              onClick={() => setShowModal((oldValue) => !oldValue)}
              className={classes.infoBtn}
              color="#fff"
              icon="information"
              iconSize="l"
            />
          </div>
          {mapTitle && <div className={classes.pageTitle}>{mapTitle}</div>}
        </div>
        {/* Removing the author logo */}
        {/* <div className={classes.logoCtner}>
          <a href="https://jorgemonge.ca">
            <JmLogo scale={0.12} color="white" className={classes.pageLogo} />
          </a>
        </div> */}
        <LanguageSwitcher lang={lang} onChange={langSwitcherChangeHandler} />
      </div>

      <div id={"mapDiv"} className={classes.mapDiv} ref={mapRef}>
        <div className={classes.toolsLayerPicklistCtner}>
          <div className={classes.toolsCtner}>
            <ButtonWithIcon
              onClick={() => setDisplayLayerList((prevValue) => !prevValue)}
              className={classes.layersBtn}
              color="#fff"
              text={layerBtnTxt}
              icon="layers"
              iconSize="l"
              borderRadius="5px"
            />

            <ButtonWithIcon
              onClick={() => setDisplayLegend((prevValue) => !prevValue)}
              className={classes.legendBtn}
              color="#fff"
              text={legendBtnTxt}
              icon="legend"
              iconSize="l"
              borderRadius="5px"
            />
          </div>
          {displayLayerList && (
            <Picklist
              className={classes.layerPicklist}
              mapItems={mapItems}
              classNameChildren={classes.layerPicklist}
              onItemPicked={onListItemPicked}
              selectedLyrItemId={selectedLyrItemId}
              language={lang}
            />
          )}
        </div>
        <ToastContainer className={classes.toastifyTopRight} />
        {openRecordInfoWidget && (
          <QueryResultsTable
            data={queriedRecordInfo}
            onClose={onRecordInfoWidgetClose}
            language={lang}
          />
        )}
      </div>
      {showModal && (
        <Modal language={lang} onClose={() => setShowModal(false)} />
      )}
    </React.Fragment>
  )
}

export default App
