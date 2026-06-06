import { Formik } from "formik"
import type React from "react"

import axios from "axios"
import type { LoginDto } from "../../dto/login.dto"
import { login, selectAccessToken } from "../../store/features/currentUserSlice"
import { useAppDispatch, useAppSelector } from "../../store/hooks"

type SignupForm = {
  username: string
  email: string
  password: string
  repeatPassword: string
}

const initialValues: SignupForm = {
  username: "",
  email: "",
  password: "",
  repeatPassword: "",
}

export const Signup: React.FC = () => {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAccessToken)

  if (accessToken) {
    return (
      <div>
        Currently signed in. Please sign out if you wish to sign up another
        account.
      </div>
    )
  }

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validate={values => {
          const errors: Partial<SignupForm> = {}
          const { username, email, password, repeatPassword } = values
          if (!username) {
            errors.username = "Required"
          }
          if (!email) {
            errors.email = "Required"
          } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            errors.email = "Invalid email address"
          }
          if (!password) {
            errors.password = "Required"
          }
          if (!repeatPassword) {
            errors.repeatPassword = "Required"
          } else if (password !== repeatPassword) {
            errors.repeatPassword = "Does not match"
          }
          return errors
        }}
        onSubmit={(values, { setSubmitting }) => {
          axios
            .post<LoginDto>(
              `${import.meta.env.VITE_API_URL as string}/auth/signup`,
              {
                username: values.username,
                email: values.email,
                password: values.password,
              },
            )
            .then(data => {
              alert(JSON.stringify(data))
              dispatch(login(data.data))
            })
            .catch(() => {
              alert("oooops")
              // Nothing for now; just stay on the signup page. TODO: show an error message.
            })
          setTimeout(() => {
            setSubmitting(false)
          }, 400)
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                name="username"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.username}
                placeholder="username"
              />
              {errors.username && touched.username && errors.username}
            </div>
            <div>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
                placeholder="e-mail"
              />
              {errors.email && touched.email && errors.email}
            </div>
            <div>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.password}
                placeholder="password"
              />
              {errors.password && touched.password && errors.password}
            </div>
            <div>
              <input
                type="password"
                name="repeatPassword"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.repeatPassword}
                placeholder="repeat password"
              />
              {errors.repeatPassword &&
                touched.repeatPassword &&
                errors.repeatPassword}
            </div>
            <div>
              <button type="submit" disabled={isSubmitting}>
                Sign up
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  )
}
