import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useEffect, } from 'react'
import type { AppDispatch } from '../store/store'
import { CheckAuth } from '../store/Auth'


const Auth = ({ updateUserDetails, isAuth, children }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
     if(location.pathname === ""){
          if(isAuth){
               return navigate("/home");
          }else{
               return navigate("/auth");
          }
     }


   
    useEffect(() => {


    // if(!isAuth && location.pathname !== "auth"){
    //     navigate("/auth");
    //      return ;
    // }

    // if(isAuth && location.pathname === "auth"){
    //     navigate("/home");
    //     return ;
    // }
    if(isAuth)return;
                dispatch(CheckAuth())
                .then((data) => {
                    // console.log("CheckAuth data:", data.payload);
                    if (data.payload?.user?.isAuth) {
                        updateUserDetails(
                            data.payload.user.userName,
                            data.payload.user.id.toString(),
                            data.payload.user.isAuth
                        );
                        navigate('/home');
                    } else {
                        console.warn("User didn't auth!!!");
                        navigate('/auth');
                    }
                })
                .catch((err) => console.error("CheckAuth error:", err));
       
    }, [isAuth]);

    return <>{children}</>;
}
export default Auth