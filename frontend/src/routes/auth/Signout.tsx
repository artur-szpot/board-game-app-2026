import axios from "axios"
import { useEffect } from "react"
import { useNavigate } from "react-router"

import { logout } from "../../store/features/currentUserSlice"
import { useAppDispatch } from "../../store/hooks"

export const Signout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    axios
      .post(`${import.meta.env.VITE_API_URL as string}/auth/logout`)
      .catch(() => {
        // Ignore logout errors; still clear client auth state.
      })
      .finally(async () => {
        dispatch(logout())
        await navigate("/", { replace: true })
      })
  }, [dispatch, navigate])

  return <div>Signing out...</div>
}
