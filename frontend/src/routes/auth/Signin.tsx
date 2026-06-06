import axios from "axios"
import { Formik } from "formik"
import type React from "react"

import { type LoginDto } from "../../dto/login.dto"
import { login, selectAccessToken } from "../../store/features/currentUserSlice"
import { useAppDispatch, useAppSelector } from "../../store/hooks"

type SigninForm = {
  email: string
  password: string
}

// TODO: remove these initial values (for now included for ease of early testing)
const initialValues: SigninForm = {
  email: "test@example.com",
  password: "this-will-be-hashed",
}

export const Signin: React.FC = () => {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAccessToken)

  if (accessToken) {
    // TODO: make sing out a link, make pretty
    return (
      <div>
        Already signed in. Please sign out if you wish to sign in as another
        user.
      </div>
    )
  }

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validate={values => {
          const errors: Partial<SigninForm> = {}
          if (!values.email) {
            errors.email = "Required"
          } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
          ) {
            errors.email = "Invalid email address"
          }
          if (!values.password) {
            errors.password = "Required"
          }
          return errors
        }}
        onSubmit={(values, { setSubmitting }) => {
          axios
            .post<LoginDto>(
              `${import.meta.env.VITE_API_URL as string}/auth/login`,
              {
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
              <button type="submit" disabled={isSubmitting}>
                Sign in
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  )
}
