import { useState } from 'react'
import {Login} from '../components/Login';
import {SignUp} from '../components/SignUp';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);

    return (
        <main>
            <h1>Loclore</h1>
            {isLogin ? (
                <Login onPageChange={() => setIsLogin(false)} />
            ) : (
                <SignUp onPageChange={() => setIsLogin(true)} />
            )}
        </main>
    )
}

export default AuthPage