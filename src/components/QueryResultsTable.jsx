import "@esri/calcite-components/dist/components/calcite-icon"
import { CalciteIcon } from "@esri/calcite-components-react"

import JmLogo from "./JmLogo"
import classes from "./QueryResultsTable.module.css"

const fieldNames = [
  {
    dato1: {
      es: "Renta neta media por persona",
      en: "Average income per person",
    },
  },
  {
    dato2: {
      es: "Renta neta media por hogar",
      en: "Average income per household",
    },
  },
  {
    dato3: {
      es: "Poblacion con ingresos por unidad de consumo por debajo de 7.500 Euros",
      en: "Population (%) with income per consumption unit less than 7500 €",
    },
  },
  {
    dato4: {
      es: "Poblacion con ingresos por unidad de consumo por debajo del 60% de la mediana",
      en: "Population (%) with income per consumption unit smaller than 60% of the median",
    },
  },
  {
    dato5: {
      es: "Poblacion con ingresos por unidad de consumo por encima del 200% de la mediana",
      en: "Population (%) with income per consumption unit greater than 200% of the median",
    },
  },
  {
    dato6: {
      es: "Poblacion menor de 18 años con ingresos por unidad de consumo por debajo del 60% de la mediana",
      en: "Population (%) under 18 with income per consumption unit less than 60% of the median",
    },
  },
  {
    dato7: { es: "Poblacion menor de 18 años", en: "Population (%) under 18" },
  },
  {
    dato8: {
      es: "Poblacion de 65 y más años",
      en: "Population (%) with ages 65 or more",
    },
  },
  { dato9: { es: "Índice de Gini", en: "Gini Index" } },
]

const cleanSortObject = (dataObj, language) => {
  /* Very dataset-specific function to reorder attributes and aggregate them. */

  const queryResultsObj = dataObj.results

  // Go from dictionaries having 'dato1' as keys to others having 'Porcentaje de...' as keys
  let datoTypeFieldsRenamed = fieldNames.map((o, idx) => {
    let out, valLangDependant
    for (const [k, v] of Object.entries(o)) {
      valLangDependant = v[language]
      let actualValue = queryResultsObj[k]
      // Sometimes, the value is null, in which case, we need to use the explicative text contained in fields like "nota1", "nota2", etc.
      if (!actualValue) {
        // i.e. an empty string
        actualValue = queryResultsObj[`nota${k.slice(-1)}`]
        // Handling English
        if (language === "en" && actualValue.includes("secreto")) {
          actualValue =
            "Data hidden for privacy reasons, due to the small size of the geographical unit"
        }
      } else {
        // "dato1", "dato2", etc. contain some value. Then we need to append the units, depending on the attribute
        if ([0, 1].includes(idx)) {
          actualValue = `${actualValue} €`
        } else if ([2, 3, 4, 5, 6, 7].includes(idx)) {
          actualValue = `${actualValue} %`
        }
      }

      const valueLocaleString = actualValue.toLocaleString("es-ES")
      out = [valLangDependant, valueLocaleString] // The loop runs only once, since 'o' will always have only 1 key
    }

    return out
  })

  const municipLangDependant = language === "es" ? "Municipio" : "Municipality"
  const levelTermLangDependant = language === "es" ? "Nivel" : "Level"
  // This would be "Municipios" | "Distitos" | "Secciones" and their equivalent in English
  const levelValue =
    queryResultsObj["Nivel"] ||
    queryResultsObj["Nivel1"] ||
    queryResultsObj["Nivel2"]
  let levelValueLangDependant
  switch (levelValue) {
    case "Municipios":
      levelValueLangDependant =
        language === "en" ? "Municipalities" : levelValue
      break
    case "Distritos":
      levelValueLangDependant = language === "en" ? "Districts" : levelValue
      break
    case "Secciones":
      levelValueLangDependant =
        language === "en" ? "Census sections" : levelValue
      break
    default:
      levelValueLangDependant = ""
  }
  let output = [
    [municipLangDependant, queryResultsObj["NMUN"]],
    [levelTermLangDependant, levelValueLangDependant],
    ...datoTypeFieldsRenamed,
  ]

  return output
}

const flagMapVariableDataArray = (dataArray, attribBeingMapped, language) => {
  /* Accepts an array with the results of the query, as well as the attribute being represented in the choropletic map, and it returns the same input array, but each element enriched with a 'flag' property. This attribute flags, within all the attributes for the given location, which one is being represented in the choropletic map. */

  if (language === "en") {
    fieldNames.forEach((o) => {})
    let targetAttribEnEs = fieldNames.find(
      (o) => Object.values(o)[0].es === attribBeingMapped
    )
    attribBeingMapped = Object.values(targetAttribEnEs)[0].en
  }

  let output = dataArray.map((subArray) => {
    let flag = subArray[0] === attribBeingMapped ? true : undefined
    return [...subArray, flag]
  })

  return output
}

//
// REACT COMPONENT

//

const QueryResultsTable = ({ data, onClose, language }) => {
  let items

  // ERROR HANDLING
  if (data && Object.keys(data).includes("ERROR")) {
    items = (
      <li key={0} className={`${classes.queryRow} ${classes.errorMessage}`}>
        <div className={classes.queryValue}>{data.ERROR}</div>
      </li>
    )
  } else if (data && Object.keys(data).includes("NODATA")) {
    items = (
      <li key={0} className={`${classes.queryRow} ${classes.infoMessage}`}>
        <div className={classes.queryValue}>{data.NODATA}</div>
      </li>
    )
  }

  // NO ERROR NOR ABSENCE OF DATA
  else if (data) {
    // Lots of very data-specific massaging to sort and rename attribute names, and string-modify attribute values (append the € and % characters)
    const cleanSortedDataArray = cleanSortObject(data, language)

    // cleanSortedDataArray looks like [["Municipio", "Madrid"], ["Nivel", "Distritos"], ...]

    // Now, let's flag the attribute linked to the variable in the map, getting something like
    // [["Municipio", "Madrid", undefined], ["Nivel", "Distritos", undefined], ["Renta media por persona", "20154.35 €", true]...]

    // "Main attribute", i.e. the one appearing in the chropleth map
    const attribBeingMapped = data.attribBeingMapped
    const flaggedDataArray = flagMapVariableDataArray(
      cleanSortedDataArray,
      attribBeingMapped,
      language
    )

    items = flaggedDataArray.map(([name, value, flag], idx) => {
      let rowClassName =
        flag === true
          ? `${classes.queryRow} ${classes.selected}`
          : classes.queryRow

      return (
        <li key={idx} className={rowClassName}>
          <div className={classes.queryName}>{name}</div>
          <div className={classes.queryValue}>{value}</div>
        </li>
      )
    })
  }

  return (
    <div className={classes.queryResultCtner}>
      <div className={classes.queryResultInnerCtnerLogo}>
        {!data && (
          <JmLogo scale={0.12} color="black" className={classes.pageLogo} />
        )}
      </div>
      <div className={classes.queryResultInnerCtnerData}>
        {data && (
          <ul>
            {items}
            <CalciteIcon
              className={classes.closeWidgetIcon}
              icon={"x-circle"}
              scale={"m"}
              onClick={onClose}
            />
          </ul>
        )}
      </div>
    </div>
  )
}

export default QueryResultsTable
