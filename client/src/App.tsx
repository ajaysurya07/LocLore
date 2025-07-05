import { Route, Routes } from 'react-router-dom'
import AuthPage from './page/AuthPage'
import Home from './page/Home'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import Auth from './page/Auth'


interface userDetailsInterface {
  userName: string,
  userId: string,
  isAuth: boolean,
}

function App() {

  const [userDetails, setUserDetails] = useState<userDetailsInterface>({
    userName: "1",
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
        <Route path ='/'  element = {
          <Auth
          updateUserDetails={updateUserDetails}
          isAuth={userDetails.isAuth} />}
            />
        <Route path='/auth' element={
          <AuthPage />
        } />
        <Route path='/home' element={<Auth
          updateUserDetails={updateUserDetails}
          isAuth={userDetails.isAuth}>
          <Home
            userDetails={userDetails}
          />
        </Auth>} />
      </Routes>

    </>
  )
}

export default App
