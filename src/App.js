import React, { useState, useRef, useEffect } from "react"
import createMapView from "./utils/map"
import TileLayer from "@arcgis/core/layers/TileLayer"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import Legend from "@arcgis/core/widgets/Legend"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import Graphic from "@arcgis/core/Graphic"
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

let myMap, graphicsLayer

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
  const [tileLayerUrl, setTileLayerUrl] = useState()
  const [selectedLyrItemId, setSelectedLyrItemId] = useState(1)
  const [displayLegend, setDisplayLegend] = useState(false)
  const [mapView, setMapView] = useState()
  const [displayLayerList, setDisplayLayerList] = useState(false)
  const [queriedRecordInfo, setQueriedRecordInfo] = useState()

  const mapRef = useRef(null)

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
    setQueriedRecordInfo()
  }

  // useEffect(() => {
  //   /* When the mapView changes, remove the legend container if it exists */
  //   if (mapView && mapView.ui) {
  //     if (document.getElementById("legendWidget")) {
  //       document.getElementById("legendWidget").remove()
  //     }
  //   }
  // }, [mapView])

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

  useEffect(() => {
    /* Handle the showing and hiding of the Legend widget */

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

  // Add events to the map view, when it's ready
  useEffect(() => {
    /* When the View is ready, define its click event handler: query the appropriate feature service to retrieve the attributes */

    if (mapView) {
      mapView.when(() => {
        mapView.on("click", (e) => {
          // All feature services return all 9 data (but only for the given geographical unit: municipal, census districts, census sections, etc.)
          // Sublayer 1: municipal, 2: districts, 3: sections
          // Depending on the scale levels => choose a sublayer or the other

          mapView.graphics.removeAll()

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

          featLayer
            .queryFeatures({ ...spatQuery, geometry: e.mapPoint })
            .then((results) => {
              // Send the result to the state, be it for an area that returned data or for an area for which the result was void
              if (results.features.length) {
                setQueriedRecordInfo(results.features[0].attributes)
              } else {
                setQueriedRecordInfo()
              }

              // Display a marker on the clicked position
              const { x, y, spatialReference } = e.mapPoint
              const geometry = {
                type: "point",
                x,
                y,
                spatialReference,
              }

              const symbol = {
                type: "picture-marker", // autocasts as new PictureMarkerSymbol()
                url: "https://i.ibb.co/cTFXSVN/icons8-place-marker-24.png",
                width: "24px",
                height: "24px",
              }

              let picMarkerGraphic = new Graphic({
                symbol,
                geometry,
              })

              mapView.graphics.add(picMarkerGraphic)
            })
            .catch((error) => {
              console.error(
                "ERROR: Issue when fetching data from feature service. Please refresh the page."
              )
            })
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
  }, [mapView])

  /* At startup, add the initial tile layer. Then when a new layer is selected, remove the old layer and add the new to the map view */
  useEffect(() => {
    if (mapView) {
      let url

      if (!tileLayerUrl) {
        url = process.env.REACT_APP_TLID1
      } else {
        // If switching the tile layer, remove the old tile layer first
        url = tileLayerUrl
        mapView.when(() => {
          let layerToRemove = myMap.layers.items.filter(
            (l) => l.title !== "markers"
          )[0]

          myMap.remove(layerToRemove)
        })
      }

      let tileLayer = new TileLayer({ url })
      myMap.add(tileLayer)
      tileLayer.opacity = 0.8
    }

    return () => {
      if (mapView) {
        previousMapViewProperties = {
          center: mapView.center,
          zoom: mapView.zoom,
        }
      }
    }
  }, [mapView, tileLayerUrl]) //mapView,

  return (
    <React.Fragment>
      <div className={classes.titleLogoCtner}>
        <div className={classes.pageTitleCtner}>
          {mapTitle && <div className={classes.pageTitle}>{mapTitle}</div>}
        </div>
        <div className={classes.logoCtner}>
          <a href="https://jorgemonge.ca">
            <JmLogo scale={0.12} color="white" className={classes.pageLogo} />
          </a>
        </div>
      </div>

      <div id={"mapDiv"} className={classes.mapDiv} ref={mapRef}>
        <div className={classes.toolsLayerPicklistCtner}>
          <div className={classes.toolsCtner}>
            <ButtonWithIcon
              onClick={() => setDisplayLayerList((prevValue) => !prevValue)}
              className={classes.layersBtn}
              color="#fff"
              text="Capas"
              icon="layers"
              iconSize="l"
              borderRadius="5px"
            />

            <ButtonWithIcon
              onClick={() => setDisplayLegend((prevValue) => !prevValue)}
              color="#fff"
              text="Leyenda"
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
            />
          )}
        </div>
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
