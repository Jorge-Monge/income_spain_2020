import classes from "./LanguageSwitcher.module.css"

const LanguageSwitcher = ({ onChange, lang }) => {
  return (
    <form>
      <div className={classes.langInputBlock}>
        <input
          type="radio"
          id="english"
          name="lang_selection"
          value="en"
          checked={lang === "en"}
          onChange={(e) => onChange(e)}
        />
        <label htmlFor="english">English</label>
      </div>

      <div className={classes.langInputBlock}>
        <input
          type="radio"
          id="spanish"
          name="lang_selection"
          value="es"
          checked={lang === "es"}
          onChange={(e) => onChange(e)}
        />
        <label htmlFor="spanish">Español</label>
      </div>
    </form>
  )
}

export default LanguageSwitcher
