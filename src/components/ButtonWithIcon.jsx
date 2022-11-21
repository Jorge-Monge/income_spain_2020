import "@esri/calcite-components/dist/components/calcite-icon"
import { CalciteIcon } from "@esri/calcite-components-react"

const ButtonWithIcon = ({ color, text, icon, iconSize, className }) => {
  return (
    <div
      className={className}
      style={{
        width: "max-content",
        minWidth: "150px",
        padding: "5px",
        backgroundColor: color,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <span style={{ padding: "10px", fontWeight: "bold" }}>{text}</span>
      <CalciteIcon icon={icon} scale={iconSize} />
    </div>
  )
}

export default ButtonWithIcon
