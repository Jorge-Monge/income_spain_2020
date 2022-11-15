import MapView from "@arcgis/core/views/MapView"
import WebMap from "@arcgis/core/WebMap"
//import PopupTemplate from "@arcgis/core/PopupTemplate"

const createMapView = (viewContainer) => {
  const map = new WebMap({
    portalItem: {
      id: "711ea17ce6fa468699d749cb36ac0fb4",
    },
    basemap: "dark-gray-vector",
  })

  let myView = new MapView({
    container: viewContainer,
    map,
    center: [-3, 40],
    zoom: 5,
  })

  return myView

  //   myView.when(() => {
  //     const uniqueLayer = map.layers.items[0]
  //     myView.whenLayerView(uniqueLayer).then(() => {
  //       // Census sections layer
  //       const items = uniqueLayer.allSublayers.items
  //       items.forEach((item, index) => {
  //         if (index > 0) {
  //           item.popupEnabled = false
  //         }
  //       })

  //       const sectionsLevelLyr = uniqueLayer.allSublayers.items[0]

  //       sectionsLevelLyr.popupTemplate = new PopupTemplate({
  //         title: "Municipio: {NMUN}",
  //         content: [
  //           {
  //             type: "fields",
  //             fieldInfos: [{ fieldName: "NMUN", label: "Municipio:" }],
  //           },
  //         ],
  //       })
  //     })
  //   })
}

export default createMapView
