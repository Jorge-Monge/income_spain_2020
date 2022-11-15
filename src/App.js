import React, { Fragment, useState, createRef, useRef, useEffect } from "react"
import createMapView from "./utils/map"
import Dropdown from "./components/Dropdown"
import Picklist from "./components/Picklist"
//import BasemapToggle from "@arcgis/core/widgets/BasemapToggle"

import classes from "./App.modules.css"

const App = () => {
  const [mapView, setMapView] = useState()

  const mapRef = useRef(null)

  const onListItemPicked = (e) => {
    console.log("Event:", e)
  }

  useEffect(() => {
    let myView

    if (!mapView) {
      console.log("Creating the map view")
      myView = createMapView(mapRef.current)
      myView.when(() => {
        setMapView(myView)
      })
    }
  }, [mapView])

  useEffect(() => {
    console.log("In useEffect. mapView:", mapView)

    if (mapView?.ready) {
      console.log("mapView ready:", mapView.ready)
      mapView.when(() => {
        console.log("mapView UI:", mapView.ui)

        // let d = document.createElement("div")
        // let c = document.createTextNode("Hola")
        // d.appendChild(c)
        // d.className = "tempDiv"
        // d.id = "tempDiv"

        // mapView.ui.add(d, "top-right")
      })
    }
  }, [mapView])

  return (
    <React.Fragment>
      <div className="mapDiv" ref={mapRef} />
      <div class="viewTopRight">
        <Picklist onItemPicked={onListItemPicked} />
      </div>
    </React.Fragment>
  )
}

export default App
