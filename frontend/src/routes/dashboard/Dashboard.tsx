import { selectAccessToken } from "../../store/features/currentUserSlice"
import { useAppSelector } from "../../store/hooks"

export const Dashboard = () => {
  const accessToken = useAppSelector(selectAccessToken)

  if (!accessToken) {
    return <p>Not logged in!</p>
  }

  return <p>{`This is the dashboard! - logged in with token ${accessToken}`}</p>
}
