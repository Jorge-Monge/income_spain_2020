import classes from "./QueryResultsTable.module.css"

const fieldNames = [
  { DATO1: "Renta neta media por persona" },
  { DATO2: "Renta neta media por hogar" },
  {
    DATO3:
      "Poblacion con ingresos por unidad de consumo por debajo del 7.500 Euros",
  },
  {
    DATO4:
      "Poblacion con ingresos por unidad de consumo por debajo 60% de la mediana",
  },
  {
    DATO5:
      "Poblacion con ingresos por unidad de consumo por encima 200% de la mediana",
  },
  {
    DATO6:
      "Poblacion con ingresos por unidad de consumo por debajo 60% de la mediana",
  },
  { DATO7: "Porcentaje de poblacion menor de 18 años" },
  { DATO8: "Porcentaje de poblacion de 65 y mas años" },
  { DATO9: "Indice de Gini" },
]

const cleanSortObject = (dataObj) => {
  /* Very dataset-specific function to reorder attributes and aggregate them. */

  // Go from dictionaries having 'DATO1' as keys to others having 'Porcentaje de...' as keys
  let datoTypeFieldsRenamed = fieldNames.map((o, idx) => {
    let out
    for (const [k, v] of Object.entries(o)) {
      let actualValue = dataObj[k]
      // Sometimes, the value is null, in which case, we need to use the explicative text contained in fields like "NOTA1", "NOTA2", etc.
      if (!actualValue) {
        // i.e. an empty string
        actualValue = dataObj[`NOTA${k.slice(-1)}`]
      } else {
        // "DATO1", "DATO2", etc. contain some value. Then we need to append the units, depending on the attribute
        if ([1, 2].includes(idx)) {
          actualValue = `${actualValue} €`
        } else if ([3, 4, 5, 6, 7, 8]) {
          actualValue = `${actualValue} %`
        }
      }
      out = [v, actualValue] // The loop runs only once, since 'o' will always have only 1 key
    }

    return out
  })

  return [
    ["Municipio", dataObj["NMUN"]],
    ["Nivel", dataObj["Nivel"] || dataObj["Nivel1"] || dataObj["Nivel2"]],
    ...datoTypeFieldsRenamed,
  ]
}

//
// REACT COMPONENT
//

const QueryResultsTable = ({ data, onClose }) => {
  const cleanSortedDataArray = cleanSortObject(data)
  console.log(cleanSortedDataArray)

  const items = cleanSortedDataArray.map(([name, value], idx) => {
    return (
      <li key={idx} className={classes.queryRow}>
        <div className={classes.queryName}>{name}</div>
        <div className={classes.queryValue}>{value}</div>
      </li>
    )
  })

  return (
    data && (
      <ul className={classes.queryResultCtner} onClick={onClose}>
        {items}
      </ul>
    )
  )
}

export default QueryResultsTable
