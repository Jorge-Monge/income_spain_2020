import MapView from "@arcgis/core/views/MapView"
import WebMap from "@arcgis/core/WebMap"

const createMapView = (viewContainer, previousMapViewProperties) => {
  const map = new WebMap({
    basemap: process.env.REACT_APP_BASEMAP,
  })

  return new MapView({
    container: viewContainer,
    map,
    center: previousMapViewProperties.center,
    zoom: previousMapViewProperties.zoom,
  })
}

export default createMapView
