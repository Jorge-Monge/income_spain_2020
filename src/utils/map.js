import MapView from "@arcgis/core/views/MapView"
import WebMap from "@arcgis/core/WebMap"
import Basemap from "@arcgis/core/Basemap"

// in this case the portalItem has to be a webmap
const basemap = new Basemap({
  portalItem: {
    id: process.env.REACT_APP_BASEMAP,
  },
})

const createMapView = (viewContainer, previousMapViewProperties) => {
  const map = new WebMap({
    basemap,
    portalItem: { id: "3a9cc3041067491f845e76f0f3625ab1" },
  })

  return new MapView({
    container: viewContainer,
    map,
    center: previousMapViewProperties.center,
    zoom: previousMapViewProperties.zoom,
  })
}

export default createMapView
