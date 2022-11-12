import React, { useRef, useEffect } from "react"
import MapView from "@arcgis/core/views/MapView"
import ArcGISMap from "@arcgis/core/Map"
import WebMap from "@arcgis/core/WebMap"
import PopupTemplate from "@arcgis/core/PopupTemplate"

import "./App.css"

let uniqueLayer

const App = () => {
  const mapDiv = useRef(null)

  const clickOnView = () => {
    console.log("click:", uniqueLayer)
    //uniqueLayer.popup.content = "Hola"
    uniqueLayer.popup.open()
  }

  useEffect(() => {
    // this works fine
    // let map = new ArcGISMap({
    //   basemap: "topo-vector",
    // })

    //ine map: 711ea17ce6fa468699d749cb36ac0fb4
    //redlands map: aa1d3f80270146208328cf66d022e09c
    const map = new WebMap({
      portalItem: {
        id: "711ea17ce6fa468699d749cb36ac0fb4",
      },
      basemap: "satellite",
      apikey: "",
    })

    // eslint-disable-next-line
    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [-3, 40],
      zoom: 13,
    })

    view.when(() => {
      uniqueLayer = map.layers.items[0]
      console.log("Unique layer:", uniqueLayer)

      view.whenLayerView(uniqueLayer).then(() => {
        const sublayers = uniqueLayer.allSublayers.items

        let sectionsLevelLyr = sublayers[0]
        console.log("Sections layer:", sectionsLevelLyr)
        sectionsLevelLyr.popupEnabled = true
        sectionsLevelLyr.popupTemplate = new PopupTemplate({
          content: "Hola, Carlos",
        })
      })

      //uniqueLayer.popupEnabled = false
      //uniqueLayer.opacity = 0.5
      //console.log("Popup template:", uniqueLayer.popupTemplate)
      // uniqueLayer.popupTemplate = new PopupTemplate({
      //   content: "Hola",
      // })
      //view.on("click", () => clickOnView)
    })

    return () => view && view.destroy()
  }, [])

  return <div className="mapDiv" ref={mapDiv} />
}

export default App
