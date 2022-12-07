import Legend from "@arcgis/core/widgets/Legend"

const createLegend = (mapView, targetLayer, mapItems, locale) => {
  /* This function receives an instance of the ArcGIS MapView class, an instance of a TileLayer, as well as the content of a configuration file and the locale (English or Spanish), and returns a Legend where the layer and sublayer names have been appropriately translated. This is a very dataset-specific function.
   */

  const sublayerNames = [
    { en: "Level: Census sections", es: "Nivel: Secciones censales" },
    { en: "Level: Districts", es: "Nivel: Distritos" },
    { en: "Level: Municipalities", es: "Nivel: Municipios" },
    { en: "Municipal Boundaries", es: "Contornos Municipales" },
  ]

  // Parse the config. file and filter out the relevant item (the one corresponding to the layer being 'legended')
  const layerObj = mapItems.filter(
    (obj) => obj.layer_title === targetLayer.title
  )[0]

  const legendTitle = locale === "es" ? layerObj.label : layerObj.label_en

  // Sublayer titles may (or not) have been previously modified by this code (meaning we don't know at this point whether they are in EN or ES)
  targetLayer.sublayers.items.forEach((sl) => {
    const targetSublayerItem = sublayerNames.filter((i) => {
      return i.es === sl.title || i.en === sl.title
    })[0]
    sl.title = locale === "es" ? targetSublayerItem.es : targetSublayerItem.en
  })

  return new Legend({
    view: mapView,
    layerInfos: [
      {
        layer: targetLayer,
        title: legendTitle,
      },
    ],
  })
}

export default createLegend
