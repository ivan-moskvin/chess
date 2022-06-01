import { toast } from "react-toastify"
import { t } from "i18next"

export const error = (text: string) => {
  return toast(t<string>(text), { type: "error" })
}