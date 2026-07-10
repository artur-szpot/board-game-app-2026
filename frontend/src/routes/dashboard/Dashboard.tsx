import { useEffect } from "react"

import { selectAccessToken } from "../../store/features/currentUserSlice"
import { resetToBottomFrame } from "../../store/features/frameStackSlice"
import { useAppDispatch, useAppSelector } from "../../store/hooks"

export const Dashboard = () => {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAccessToken)

  useEffect(() => {
    dispatch(resetToBottomFrame())
  }, [dispatch])

  if (!accessToken) {
    return <p>Not logged in!</p>
  }

  return <p>{`This is the dashboard! - logged in with token ${accessToken}`}</p>
}
