import Legend from "@arcgis/core/widgets/Legend"

const createLegend = (mapView, targetLayer, mapItems, locale) => {
  /* This function receives an instance of the ArcGIS MapView class, as well as the content of a configuration file and the locale (English or Spanish), and returns a Legend where the layer and sublayer names have been appropriately translated. This is a very dataset-specific function.
   */

  const sublayerNames = [
    { en: "Level: Census sections", es: "Nivel: Secciones censales" },
    { en: "Level: Districts", es: "Nivel: Distritos" },
    { en: "Level: Municipalities", es: "Nivel: Municipios" },
    { en: "Municipal Boundaries", es: "Contornos Municipales" },
  ]
  if (locale === "en") {
    // Parse the config. file and get the layer label in English
    var legendTitle_EN = mapItems.filter(
      (obj) => obj.layer_title === targetLayer.title
    )[0].label_en

    // And translate all the sublayer titles from ES to EN
    targetLayer.sublayers.items.forEach((sl) => {
      const sublayerTitle_ES = sl.title
      const sublayerTitle_EN = sublayerNames.filter(
        (i) => i.es === sublayerTitle_ES
      )[0].en
      sl.title = sublayerTitle_EN
    })
  } else if (locale === "es") {
    try {
      // Only works when locale becomes ES after having been EN, not when ES from the start
      // Translate all the sublayer titles from EN to ES
      targetLayer.sublayers.items.forEach((sl) => {
        const sublayerTitle_EN = sl.title
        const sublayerTitle_ES = sublayerNames.filter(
          (i) => i.en === sublayerTitle_EN
        )[0].es
        sl.title = sublayerTitle_ES
      })
    } catch {
      // When the locale was ES from the beginning, we can leave the legend alone
    }
  }

  return new Legend({
    view: mapView,
    layerInfos: [
      {
        layer: targetLayer,
        title: locale === "es" ? targetLayer.title : legendTitle_EN,
      },
    ],
  })
}

export default createLegend
