import "@esri/calcite-components/dist/components/calcite-pick-list-item"
import { CalcitePickListItem } from "@esri/calcite-components-react"

const PicklistItem = ({ label, value, selected, icon, onItemPicked }) => {
  return (
    <CalcitePickListItem
      label={label}
      value={value}
      selected={selected}
      icon={icon}
      onCalciteListItemChange={(e) => onItemPicked(e)}
    />
  )
}

export default PicklistItem
