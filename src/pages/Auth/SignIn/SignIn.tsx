import { FC, FormEvent, useEffect, useState } from "react"
import { setError, signin } from "../../../store/actions/authActions"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import Message from "../../../components/UI/Message"

const SignIn: FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()
  const { error } = useAppSelector((state: RootState) => state.auth)

  useEffect(() => {
    return () => {
      if (error) {
        dispatch(setError(""))
      }
    }
  }, [error, dispatch])

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()
    if (error) {
      dispatch(setError(""))
    }
    setLoading(true)
    dispatch(signin({ email, password }, () => setLoading(false)))
  }

  return (
    <section className="section">
      <div className="container">
        <h2 className="has-text-centered is-size-2 mb-3">Sign In</h2>
        <form className="form" onSubmit={submitHandler}>
          {error && <Message type="danger" msg={error} />}
          <Input
            type="email"
            name="up_email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder="Email address"
            label="Email address"
          />
          <Input
            type="password"
            name="up_password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="Password"
            label="Password"
          />
          <Button
            text={loading ? "Loading..." : "Sign In"}
            className="is-primary is-fullwidth mt-5"
            disabled={loading}
          />
        </form>
      </div>
    </section>
  )
}

export default SignIn
