import React, { useRef, useEffect } from "react"
import MapView from "@arcgis/core/views/MapView"
import ArcGISMap from "@arcgis/core/Map"

import "./App.css"

const App = () => {
  const mapDiv = useRef(null)

  useEffect(() => {
    const map = new ArcGISMap({
      basemap: "topo-vector",
    })

    // eslint-disable-next-line
    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [-118, 34],
      zoom: 8,
    })
  }, [])

  return <div className="mapDiv" ref={mapDiv} />
}

export default App
