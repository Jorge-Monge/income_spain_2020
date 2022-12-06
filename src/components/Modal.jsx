import "@esri/calcite-components/dist/components/calcite-icon"
import { CalciteIcon } from "@esri/calcite-components-react"

import classes from "./Modal.module.css"

const text_ES = (
  <div className={classes.textCtner}>
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
    <section>
      <span>Jorge Monge</span>
      <br />
      <span>gis@jorgemonge.ca</span>
    </section>
  </div>
)

const text_EN = (
  <div className={classes.textCtner}>
    <section>
      Web application mapping some age and income variables in Spain in 2020, as
      provided by the{" "}
      <a href="https://www.ine.es/">Spanish Institute of Statistics (INE)</a>.
    </section>
    <section>
      As per a news note distributed by the Institute, "The Atlas of the
      Household Income 2020" provides information on income levels per person
      and per household, as well as their geographical characteristics. This
      information is complemented with some demographic indicators. It has been
      built with data coming from the Spanish Revenue Agency (AEAT) and others.
      Income data is allocated to the location of residence, and the
      geographical units are municipalities, districts, and census sections.
    </section>
    <section>
      This web application consumes tile and REST services published by the
      Spanish Institute of Statistics (INE), and has been built with React and
      the ArcGIS Javascript API. Esta aplicación consume servicios de teselas y
      servicios RESP publicados
    </section>
    <br />
    <section>
      <span>Jorge Monge</span>
      <br />
      <span>gis@jorgemonge.ca</span>
    </section>
  </div>
)

const Modal = ({ onClose, language }) => {
  return (
    <div className={classes.modalCtner}>
      <div className={classes.innerModalCtner}>
        {language === "es" ? text_ES : text_EN}
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
