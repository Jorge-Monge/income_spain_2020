import MapView from "@arcgis/core/views/MapView"
import WebMap from "@arcgis/core/WebMap"

//import PopupTemplate from "@arcgis/core/PopupTemplate"

const createMapView = (viewContainer, previousMapViewProperties) => {
  console.log("Previous map view properties:", previousMapViewProperties)

  const map = new WebMap({
    basemap: "dark-gray-vector",
  })

  let myView = new MapView({
    container: viewContainer,
    map,
    center: previousMapViewProperties.center,
    zoom: previousMapViewProperties.zoom,
  })

  return myView
}

export default createMapView
