import React from 'react'
import LoginForm from '../../components/LoginForm'

const Login = ({ userType }) => {
  return (
    <LoginForm userType={userType} />
  )
}

export default Login
