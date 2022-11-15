import "@esri/calcite-components/dist/components/calcite-pick-list"
import "@esri/calcite-components/dist/components/calcite-pick-list-item"
import "@esri/calcite-components/dist/components/calcite-action"
import "@esri/calcite-components/dist/components/calcite-icon"

import {
  CalcitePickList,
  CalcitePickListItem,
  CalciteAction,
} from "@esri/calcite-components-react"

import "@esri/calcite-components/dist/calcite/calcite.css"

const Picklist = ({ onItemPicked }) => {
  return (
    <CalcitePickList>
      <CalcitePickListItem
        label="Population"
        description="This is the population"
        value="one"
        icon="square" // circle, square or grip
        onCalciteListItemChange={(e) => onItemPicked(e)}
      >
        <CalciteAction slot="actions-end" icon="layer"></CalciteAction>
      </CalcitePickListItem>

      <CalcitePickListItem
        label="Population"
        description="This is the population"
        value="two"
        icon="square"
        onCalciteListItemChange={(e) => onItemPicked(e)}
      >
        <CalciteAction slot="actions-end" icon="layer"></CalciteAction>
      </CalcitePickListItem>
      <CalcitePickListItem
        label="Population"
        description="This is the population"
        value="three"
        icon="square"
        onCalciteListItemChange={(e) => onItemPicked(e)}
      >
        <CalciteAction slot="actions-end" icon="layer"></CalciteAction>
      </CalcitePickListItem>
      <CalcitePickListItem
        label="Population"
        description="This is the population"
        value="four"
        icon="square"
        onCalciteListItemChange={(e) => onItemPicked(e)}
      >
        <CalciteAction slot="actions-end" icon="layer"></CalciteAction>
      </CalcitePickListItem>
    </CalcitePickList>
  )
}

export default Picklist
