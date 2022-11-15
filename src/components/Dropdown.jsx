import "@esri/calcite-components/dist/components/calcite-button"
import "@esri/calcite-components/dist/components/calcite-icon"
import "@esri/calcite-components/dist/components/calcite-dropdown"
import "@esri/calcite-components/dist/components/calcite-dropdown-group"
import "@esri/calcite-components/dist/components/calcite-dropdown-item"

import {
  CalciteButton,
  CalciteDropdown,
  CalciteDropdownGroup,
  CalciteDropdownItem,
} from "@esri/calcite-components-react"

import "@esri/calcite-components/dist/calcite/calcite.css"

const Dropdown = () => {
  return (
    <CalciteDropdown open={undefined}>
      <CalciteButton slot="dropdown-trigger">Change map</CalciteButton>
      <CalciteDropdownGroup selectionMode="single" groupTitle="Web maps:">
        <CalciteDropdownItem disabled={true}>Item 1</CalciteDropdownItem>
        <CalciteDropdownItem>Item 2</CalciteDropdownItem>
        <CalciteDropdownItem>Item 3</CalciteDropdownItem>
      </CalciteDropdownGroup>
    </CalciteDropdown>
  )
}

export default Dropdown
