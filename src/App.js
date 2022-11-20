import React, { useState, useRef, useEffect } from "react"
import createMapView from "./utils/map"
import TileLayer from "@arcgis/core/layers/TileLayer"
import Legend from "@arcgis/core/widgets/Legend"
import Picklist from "./components/Picklist"
import ButtonWithIcon from "./components/ButtonWithIcon"

//import BasemapToggle from "@arcgis/core/widgets/BasemapToggle"

import loadedWebmaps from "./data/webmaps.json"

import classes from "./App.module.css"

let previousMapViewProperties = {
  center: [-3, 40],
  zoom: 5,
}

let myView, myMap

const App = () => {
  // startup map title taken from the JSON data's first element

  const [mapTitle, setMapTitle] = useState(
    loadedWebmaps.filter((obj) => obj.sortOrder === 1)[0].label
  )
  const [webMapId, setWebMapId] = useState(process.env.REACT_APP_WMID1)
  const [selectedLyrItemId, setSelectedLyrItemId] = useState(1)
  const [displayLegend, setDisplayLegend] = useState(false)
  const [showHideLegendText, setshowHideLegendText] = useState("Show legend")
  const [mapView, setMapView] = useState()

  const mapRef = useRef(null)

  const onListItemPicked = (e) => {
    // Fires when an item is selected OR unselected
    // It does NOT fire for clicks on the currently selected item
    e.preventDefault()

    // Change the webmap in accordance with the item selected in the pick list
    if (e.detail.selected) {
      setSelectedLyrItemId(e.detail.value)
      let targetEnvVar = `REACT_APP_WMID${
        webmaps.filter((w) => w.sortOrder === e.detail.value)[0].sortOrder
      }`
      let targetWebmap = process.env[targetEnvVar]
      // If target is other than the current web map
      if (targetWebmap !== webMapId) {
        setWebMapId(targetWebmap)
        setMapTitle(e.srcElement.label)
      }
    }

    // Hide the layer picklist after a click on an element
    setDisplayLayerList(false)
  }

  const webmaps = useState(loadedWebmaps)[0]
  const [displayLayerList, setDisplayLayerList] = useState(false)

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

    if (mapView && mapView.ui) {
      // Insert a Legend widget in the DOM
      if (displayLegend) {
        mapView.when(() => {
          document
            .getElementById("viewBottomRight")
            .appendChild(document.createElement("div")).id = "legendWidget"
          new Legend({
            view: mapView,
            container: "legendWidget",
          })

          // Change the text in the button
          setshowHideLegendText("Hide legend")
        })
      } else {
        // Remove the legend container

        if (document.getElementById("legendWidget")) {
          document.getElementById("legendWidget").remove()
        }
        setshowHideLegendText("Show legend")
      }
    }
  }, [displayLegend, webMapId, mapView])

  useEffect(() => {
    // No, I don't need to create a new view
    // I just need to remove, then add a layer
    if (webMapId && !mapView) {
      //eslint-disable-next-line
      let myView = createMapView(
        mapRef.current,
        webMapId,
        previousMapViewProperties
      )

      // On focus over the view, close the layer-selection picklist
      myView.on("focus", () => {
        setDisplayLayerList(false)
      })

      // On dragging over the view, close the layer-selection picklist
      myView.on("drag", () => {
        setDisplayLayerList(false)
      })

      setMapView(myView)
    } else if (webMapId && mapView) {
      myMap = mapView.map

      mapView.when(() => {
        console.log("myMap:", myMap)
        // Only 1 layer per webmap
        myMap.layers.items.forEach((l) => console.log("Layer:", l))
        let layerToRemove = myMap.layers.items[0]
        myMap.remove(layerToRemove)
        setTimeout(() => {
          let tileLayer = new TileLayer({
            // URL points to a cached tiled map service hosted on ArcGIS Server
            url: "https://tiles.arcgis.com/tiles/SEjlCWTAIsMEEXNx/arcgis/rest/services/Renta_neta_media_por_persona_2020/MapServer",
          })
          myMap.add(tileLayer)
        }, 3000)
      })
    }

    return () => {
      console.log("In cleanup function...")
      if (mapView) {
        previousMapViewProperties = {
          center: mapView.center,
          zoom: mapView.zoom,
        }
      }

      // I don't need to destroy the view now
      //myView && myView.destroy()
    }
  }, [webMapId, mapView])

  return (
    <React.Fragment>
      <div className={classes.mapDiv} ref={mapRef} />
      <div className={classes.viewTopRight}>
        <div
          className={classes.topBanner}
          onClick={() => setDisplayLayerList((prevValue) => !prevValue)}
        >
          {mapTitle && <div className={classes.mapTitle}>{mapTitle}</div>}
          <ButtonWithIcon
            className={classes.layersBtn}
            color="#fff"
            text="Select layer"
            icon="layers"
            iconSize="l"
          />
        </div>

        {displayLayerList && (
          <div className={classes.layerPicklist}>
            <Picklist
              webmaps={webmaps}
              onItemPicked={onListItemPicked}
              selectedLyrItemId={selectedLyrItemId}
            />
          </div>
        )}
      </div>

      <div
        id="viewBottomRight"
        className={classes.viewBottomRight}
        onClick={() => setDisplayLegend((prevValue) => !prevValue)}
      >
        <ButtonWithIcon
          color="#fff"
          text={showHideLegendText}
          icon="legend"
          iconSize="l"
        />
        {displayLegend && <div id="legendWidget"></div>}
      </div>
    </React.Fragment>
  )
}

export default App
