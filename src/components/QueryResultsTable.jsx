import "@esri/calcite-components/dist/components/calcite-icon"
import { CalciteIcon } from "@esri/calcite-components-react"

import JmLogo from "./JmLogo"
import classes from "./QueryResultsTable.module.css"

const fieldNames = [
  { DATO1: "Renta neta media por persona" },
  { DATO2: "Renta neta media por hogar" },
  {
    DATO3:
      "Poblacion con ingresos por unidad de consumo por debajo de 7.500 Euros",
  },
  {
    DATO4:
      "Poblacion con ingresos por unidad de consumo por debajo del 60% de la mediana",
  },
  {
    DATO5:
      "Poblacion con ingresos por unidad de consumo por encima del 200% de la mediana",
  },
  {
    DATO6:
      "Poblacion menor de 18 años con ingresos por unidad de consumo por debajo del 60% de la mediana",
  },
  { DATO7: "Poblacion menor de 18 años" },
  { DATO8: "Poblacion de 65 y más años" },
  { DATO9: "Índice de Gini" },
]

const cleanSortObject = (dataObj) => {
  /* Very dataset-specific function to reorder attributes and aggregate them. */

  const queryResultsObj = dataObj.results

  // Go from dictionaries having 'DATO1' as keys to others having 'Porcentaje de...' as keys
  let datoTypeFieldsRenamed = fieldNames.map((o, idx) => {
    let out
    for (const [k, v] of Object.entries(o)) {
      let actualValue = queryResultsObj[k]
      // Sometimes, the value is null, in which case, we need to use the explicative text contained in fields like "NOTA1", "NOTA2", etc.
      if (!actualValue) {
        // i.e. an empty string
        actualValue = queryResultsObj[`NOTA${k.slice(-1)}`]
      } else {
        // "DATO1", "DATO2", etc. contain some value. Then we need to append the units, depending on the attribute
        if ([0, 1].includes(idx)) {
          actualValue = `${actualValue} €`
        } else if ([2, 3, 4, 5, 6, 7].includes(idx)) {
          actualValue = `${actualValue} %`
        }
      }

      const valueLocaleString = actualValue.toLocaleString("es-ES")
      out = [v, valueLocaleString] // The loop runs only once, since 'o' will always have only 1 key
    }

    return out
  })

  return [
    ["Municipio", queryResultsObj["NMUN"]],
    [
      "Nivel",
      queryResultsObj["Nivel"] ||
        queryResultsObj["Nivel1"] ||
        queryResultsObj["Nivel2"],
    ],
    ...datoTypeFieldsRenamed,
  ]
}

const flagMapVariableDataArray = (dataArray, attribBeingMapped) => {
  //console.log("mapVariable:", attribBeingMapped)
  let output = dataArray.map((subArray) => {
    let flag = subArray[0] === attribBeingMapped ? true : undefined
    return [...subArray, flag]
  })

  return output
}

//
// REACT COMPONENT

//

const QueryResultsTable = ({ data, onClose }) => {
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
    const cleanSortedDataArray = cleanSortObject(data)

    // cleanSortedDataArray looks like [["Municipio", "Madrid"], ["Nivel", "Distritos"], ...]
    // Now, let's flag the attribute linked to the variable in the map, getting something like
    // [["Municipio", "Madrid", undefined], ["Nivel", "Distritos", undefined], ["Renta media por persona", "20154.35 €", true]...]

    // "Main attribute", i.e. the one appearing in the chropleth map
    const attribBeingMapped = data.attribBeingMapped

    const flaggedDataArray = flagMapVariableDataArray(
      cleanSortedDataArray,
      attribBeingMapped
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
      <div className={classes.queryResultInnerCtner}>
        {!data && (
          <JmLogo scale={0.12} color="black" className={classes.pageLogo} />
        )}
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
