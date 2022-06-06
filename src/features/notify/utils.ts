import { toast } from "react-toastify"
import { t } from "i18next"
import "./Notify.css"
import { ToastContainerProps } from "react-toastify/dist/types"

/**
 * Gets notification config
 */
export const getNotificationConfig = (): ToastContainerProps => ({
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: false,
  rtl: false,
  theme: "dark",
  closeOnClick: true,
  newestOnTop: true,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
})

/**
 * Displays error
 * @param text
 */
export const error = (text: string) => {
  return toast(t<string>(text), { type: "error" })
}
