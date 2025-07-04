import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Reminder_form from './components/Reminder_form'
import AuthPage from './page/AuthPage'
import Home from './page/Home'
import { useSelector } from 'react-redux'
// import type { RootState } from '@reduxjs/toolkit/query'
import { useEffect, useState } from 'react'
import Auth from './page/Auth'


interface userDetailsInterface {
  userName: string,
  userId: string,
  isAuth: boolean,
}

function App() {

  const [userDetails, setUserDetails] = useState<userDetailsInterface>({
    userName: "",
    userId: "",
    isAuth: false
  });



  // useEffect(() => {
  //   console.log("userDetails updated:", userDetails);
  // }, [userDetails]);

  const updateUserDetails = (userName: string, userId: string, isAuth: boolean) => {
    setUserDetails({
      userName,
      userId,
      isAuth
    });
  }

  const {
    isLoading, user
  } = useSelector((state: any) => state.auth)

  useEffect(() => {
    console.log("user from state  : ", user);
  }, [user])

  if (isLoading) return <div>...isLoading</div>

  return (
    <>
      <Routes>
        <Route path='/' element={<AuthPage />} />
        <Route path='/home' element={<Auth
          updateUserDetails={updateUserDetails}
          isAuth={userDetails.isAuth}>
          <Header />
          <Home
            userDetails={userDetails}
          />
          <Reminder_form />
        </Auth>} />
      </Routes>

    </>
  )
}

export default App
