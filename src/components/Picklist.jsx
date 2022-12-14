import "@esri/calcite-components/dist/components/calcite-pick-list"
import "@esri/calcite-components/dist/components/calcite-action"
import "@esri/calcite-components/dist/components/calcite-icon"

import PicklistItem from "./PicklistItem"

import { CalcitePickList } from "@esri/calcite-components-react"

const Picklist = ({
  mapItems,
  onItemPicked,
  selectedLyrItemId,
  className,
  classNameChildren,
  language,
}) => {
  const labelLangDependant = language === "es" ? "label" : "label_en"
  return (
    <CalcitePickList className={className}>
      {mapItems.map((i) => (
        <PicklistItem
          className={classNameChildren}
          key={i.sortOrder}
          label={i[labelLangDependant]}
          value={i.sortOrder}
          selected={i.sortOrder === selectedLyrItemId ? true : undefined} // Gotcha about false values becoming truthy: https://developers.arcgis.com/calcite-design-system/frameworks/
          icon="square" // circle, square or grip
          onItemPicked={onItemPicked}
        />
      ))}
    </CalcitePickList>
  )
}

export default Picklist
