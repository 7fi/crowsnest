import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function EmailSignInForm() {
  const [emailValue, setEmailValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [isValidPassword, setIsValidPassword] = useState(false)

  const navigate = useNavigate()

  const onChangePswd = (e) => {
    const password = e.target.value
    // 8 characters, 1 capital, 1 lowercase, 1 number
    var passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    if (passwordRegExp.test(password)) {
      setPasswordValue(password)
      setIsValidPassword(true)
    } else if (password.length < 25) {
      setPasswordValue(password)
      setIsValidPassword(false)
    } else {
      setIsValidPassword(false)
    }
  }
  const onChangeEmail = (e) => {
    const email = e.target.value.toLowerCase()
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setEmailValue(email)
      setIsValidEmail(true)
    } else {
      setEmailValue(email)
      setIsValidEmail(false)
    }
  }

  const onCreate = async () => {
    const auth = getAuth()
    createUserWithEmailAndPassword(auth, emailValue, passwordValue)
      .then((userCredential) => {
        // const user = userCredential.user
      })
      .catch((error) => {
        console.error(error)
        // const errorCode = error.code
        // const errorMessage = error.message
        toast.error(error.message)
      })
  }

  const onSignin = async () => {
    const auth = getAuth()
    signInWithEmailAndPassword(auth, emailValue, passwordValue)
      .then((userCredential) => {
        // const user = userCredential.user
      })
      .catch((error) => {
        console.error(error)
        // const errorCode = error.code
        // const errorMessage = error.message
        toast.error(error.message)
      })
    // navigate('/enter')
  }

  return (
    <section className='contentBox'>
      <form className='emailForm'>
        <input type='email' placeholder='example@mail.com' value={emailValue} onChange={onChangeEmail}></input>
        <input type='password' placeholder='password' value={passwordValue} onChange={onChangePswd}></input>
        <button type='submit' disabled={!isValidEmail || !isValidPassword} onClick={onSignin}>
          Sign in
        </button>
        <button type='submit' disabled={!isValidEmail || !isValidPassword} onClick={onCreate}>
          Create Account
        </button>
      </form>
    </section>
  )
}
