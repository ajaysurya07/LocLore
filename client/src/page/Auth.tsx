import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useEffect, } from 'react'
import type { AppDispatch } from '../store/store'
import { CheckAuth } from '../store/Auth'


const Auth = ({ updateUserDetails, isAuth, children }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();


    // if(!isAuth){
    //      return navigate("/");
    // }
    

    useEffect(() => {
        if (!isAuth) {
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
                        navigate('/');
                    }
                })
                .catch((err) => console.error("CheckAuth error:", err));
        } else {
            navigate('/home');
        }
    }, [isAuth, dispatch, navigate, updateUserDetails]);

    return <>{children}</>;
}
export default Auth