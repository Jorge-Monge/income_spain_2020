import React, { useState, useRef, useEffect } from "react"
import createMapView from "./utils/map"
import TileLayer from "@arcgis/core/layers/TileLayer"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import Legend from "@arcgis/core/widgets/Legend"
//import Popup from "@arcgis/core/widgets/Popup"
import Picklist from "./components/Picklist"
import ButtonWithIcon from "./components/ButtonWithIcon"
import JmLogo from "./components/JmLogo"
import QueryResultsTable from "./components/QueryResultsTable"

//import BasemapToggle from "@arcgis/core/widgets/BasemapToggle"

import mapItems from "./data/mapItems.json"
import featServiceInfo from "./data/featService.json"

import classes from "./App.module.css"

let previousMapViewProperties = {
  center: [-3, 39],
  zoom: 4,
}

let myMap

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

const App = () => {
  // startup map title taken from the JSON data's first element

  const [mapTitle, setMapTitle] = useState(
    mapItems.filter((obj) => obj.sortOrder === 1)[0].label
  )
  const [tileLayerUrl, setTileLayerUrl] = useState(process.env.REACT_APP_TLID1)
  const [selectedLyrItemId, setSelectedLyrItemId] = useState(1)
  const [displayLegend, setDisplayLegend] = useState(false)
  const [mapView, setMapView] = useState()
  const [displayLayerList, setDisplayLayerList] = useState(false)
  const [queriedRecordInfo, setQueriedRecordInfo] = useState()

  const mapRef = useRef(null)
  const upperBandCtnerRef = useRef()

  const onListItemPicked = (e) => {
    // Fires when an item is selected OR unselected
    // It does NOT fire for clicks on the currently selected item
    e.preventDefault()

    // Change the tile layer in accordance with the item selected in the pick list
    if (e.detail.selected) {
      setSelectedLyrItemId(e.detail.value)
      let targetEnvVar = `REACT_APP_TLID${
        mapItems.filter((w) => w.sortOrder === e.detail.value)[0].sortOrder
      }`
      let targetTileLayer = process.env[targetEnvVar]
      // If target is other than the current web map
      if (targetTileLayer !== tileLayerUrl) {
        setTileLayerUrl(targetTileLayer)
        setMapTitle(e.srcElement.label)
      }
    }

    // Hide the layer picklist after a click on an element
    setDisplayLayerList(false)
  }

  const onRecordInfoWidgetClose = (e) => {
    console.log("Closing record info widget...")
    setQueriedRecordInfo()
  }

  useEffect(() => {
    /* When the mapView changes, remove the legend container if it exists */
    if (mapView && mapView.ui) {
      if (document.getElementById("legendWidget")) {
        document.getElementById("legendWidget").remove()
      }
    }
  }, [mapView])

  useEffect(() => {
    /* Handle the showing and hiding of the Legend widget */

    // If legend widget already created, remove its container beforehand
    // if (document.getElementById("legendWidget")) {
    //   document.getElementById("legendWidget").remove()
    // }

    mapView &&
      mapView.when(() => {
        mapView.ui.empty("bottom-left")

        if (displayLegend) {
          mapView.ui.add(
            new Legend({
              view: mapView,
            }),
            "bottom-left"
          )
        } else {
          mapView.ui.empty("bottom-left")
        }
      })
  }, [displayLegend, tileLayerUrl, mapView])

  useEffect(() => {
    /* When the View is ready, define its click event handler: query the appropriate feature service to retrieve the attributes */

    if (mapView) {
      mapView.when(() => {
        mapView.on("click", (e) => {
          // All feature services return all 9 data (but only for the given geographical unit: municipal, census districts, census sections, etc.)
          // Sublayer 1: municipal, 2: districts, 3: sections
          // Depending on the scale levels => choose a sublayer or the other

          const subLayer = featServiceInfo.sublayers.filter((sl) => {
            return sl.minScale > mapView.scale && mapView.scale >= sl.maxScale
          })[0]

          if (!subLayer) {
            // Click when zoomed out too much
            console.error(
              "ERROR: Unable to determine feature service sub-layer"
            )
            return
          }

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

          console.log(
            "scale, url, spatQuery",
            mapView.scale,
            featServiceUrl,
            spatQuery
          )
          featLayer
            .queryFeatures({ ...spatQuery, geometry: e.mapPoint })
            .then((results) => {
              // Send the result to the state, be it for an area that returned data or for an area for which the result was void
              if (results.features.length) {
                setQueriedRecordInfo(results.features[0].attributes)
              } else {
                setQueriedRecordInfo()
              }
            })
            .catch((error) => {
              console.error(
                "ERROR: Issue when fetching data from feature service. Please refresh the page."
              )
            })
        })
      })
    }
  }, [mapView])

  useEffect(() => {
    /* Create the startup map view. Then, when a new layer is selected, remove the old layer and add the new to the map view */

    if (tileLayerUrl && !mapView) {
      //eslint-disable-next-line
      let myView = createMapView(mapRef.current, previousMapViewProperties)

      myView.ui.empty("top-left")

      myMap = myView.map
      let tileLayer = new TileLayer({
        // URL points to a cached tiled map service hosted on ArcGIS Server
        url: "https://tiles.arcgis.com/tiles/SEjlCWTAIsMEEXNx/arcgis/rest/services/Renta_neta_media_por_persona_2020/MapServer",
      })

      myMap.add(tileLayer)

      // On focus over the view, close the layer-selection picklist
      myView.on("focus", () => {
        setDisplayLayerList(false)
      })

      // On dragging over the view, close the layer-selection picklist
      myView.on("drag", () => {
        setDisplayLayerList(false)
      })

      setMapView(myView)
    } else if (tileLayerUrl && mapView) {
      mapView.when(() => {
        // Only 1 layer per webmap

        let layerToRemove = myMap.layers.items[0]
        myMap.remove(layerToRemove)

        let tileLayer = new TileLayer({
          // URL points to a cached tiled map service hosted on ArcGIS Server
          url: tileLayerUrl,
        })
        myMap.add(tileLayer)
      })
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

  return (
    <React.Fragment>
      <div className={classes.upperBandCtner} ref={upperBandCtnerRef}>
        <div className={classes.pageTools}>
          <ButtonWithIcon
            onClick={() => setDisplayLayerList((prevValue) => !prevValue)}
            className={classes.layersBtn}
            color="#fff"
            text="Capas"
            icon="layers"
            iconSize="l"
          />

          <ButtonWithIcon
            onClick={() => setDisplayLegend((prevValue) => !prevValue)}
            color="#fff"
            text="Leyenda"
            icon="legend"
            iconSize="l"
          />

          {mapTitle && <div className={classes.pageTitle}>{mapTitle}</div>}
        </div>

        <div className={classes.upperBandRight}>
          <JmLogo scale={0.15} color="white" className={classes.pageLogo} />
        </div>
      </div>

      {displayLayerList && (
        <div className={classes.layerPicklistCtner}>
          <Picklist
            mapItems={mapItems}
            classNameChildren={classes.layerPicklist}
            onItemPicked={onListItemPicked}
            selectedLyrItemId={selectedLyrItemId}
          />
        </div>
      )}

      <div id={"mapDiv"} className={classes.mapDiv} ref={mapRef}>
        {queriedRecordInfo && (
          <QueryResultsTable
            data={queriedRecordInfo}
            onClose={onRecordInfoWidgetClose}
          />
        )}
      </div>
    </React.Fragment>
  )
}

export default App
