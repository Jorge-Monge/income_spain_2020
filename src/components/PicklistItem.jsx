import "@esri/calcite-components/dist/components/calcite-pick-list-item"
import { CalcitePickListItem } from "@esri/calcite-components-react"

const PicklistItem = ({
  webmapId,
  label,
  description,
  value,
  selected,
  icon,
  onItemPicked,
}) => {
  return (
    <CalcitePickListItem
      webmapId={webmapId}
      label={label}
      description={description}
      value={value}
      selected={selected}
      icon={icon}
      onCalciteListItemChange={(e) => onItemPicked(e)}
    />
  )
}

export default PicklistItem
