import "@esri/calcite-components/dist/components/calcite-pick-list"
import "@esri/calcite-components/dist/components/calcite-action"
import "@esri/calcite-components/dist/components/calcite-icon"

import PicklistItem from "./PicklistItem"

import { CalcitePickList } from "@esri/calcite-components-react"

const Picklist = ({ webmaps, onItemPicked, selectedLyrItemId }) => {
  return (
    <CalcitePickList>
      {webmaps.map((i) => (
        <PicklistItem
          key={i.sortOrder}
          webmapId={i.id}
          label={i.label}
          description={i.description}
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
