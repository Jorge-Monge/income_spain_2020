import "@esri/calcite-components/dist/components/calcite-icon"
import { CalciteIcon } from "@esri/calcite-components-react"

import classes from "./Modal.module.css"

const text = (
  <div>
    <section>
      Applicación web que permite visualizar sobre un mapa de España variables
      relacionadas con el "Atlas de distribución de renta. 2020" del{" "}
      <a href="https://www.ine.es/">
        Instituto Nacional de Estadística de España (INE)
      </a>
      .
    </section>
    <section>
      Según nota de prensa del INE, "El Atlas de Distribución de Renta de los
      Hogares (ADRH) proporciona indicadores de nivel y distribución de renta
      por persona y hogar, completándose dicha información con indicadores de
      tipo demográfico. Para la elaboración de los indicadores de ingresos, el
      INE utiliza datos tributarios de la Agencia Tributaria y las Haciendas
      Forales, adscribiéndose los ingresos al lugar donde reside el perceptor.
      El nivel más detallado de los datos es el de sección censal."
    </section>
    <section>
      Esta aplicación consume servicios de teselas y servicios RESP publicados
      por el INE, y ha sido realizada con React y la API de Javascript de Esri.
    </section>
    <br />
    <span>Jorge Monge</span>
    <br />
    <span>gis@jorgemonge.ca</span>
  </div>
)

const Modal = ({ onClose }) => {
  return (
    <div className={classes.modalCtner}>
      <div className={classes.innerModalCtner}>
        {text}
        <CalciteIcon
          className={classes.closeWidgetIcon}
          icon={"x-circle"}
          scale={"m"}
          onClick={onClose}
        />
      </div>
    </div>
  )
}

export default Modal
