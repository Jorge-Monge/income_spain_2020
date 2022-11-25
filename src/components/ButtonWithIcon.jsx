import "@esri/calcite-components/dist/components/calcite-icon"
import { CalciteIcon } from "@esri/calcite-components-react"

const ButtonWithIcon = ({
  color,
  text,
  icon,
  iconSize,
  className,
  borderRadius,
  onClick,
}) => {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: "max-content",
        backgroundColor: color,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        borderRadius,
      }}
    >
      <span style={{ padding: "10px", fontWeight: "bold" }}>{text}</span>
      <CalciteIcon icon={icon} scale={iconSize} />
    </div>
  )
}

export default ButtonWithIcon
