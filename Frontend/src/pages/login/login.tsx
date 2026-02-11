import "./login.css"

const Login = () => {
    return (
        <div className="login-container">
            <h1>Login Page</h1>
            <input name="username" placeholder="Username" />
            <br></br>
            <input name="password" placeholder="Password" type="password"/>

            <div className="button-row">
                <button>Login</button>
                <button>Register</button>
            </div>
            <button>Bypass Login</button>
        </div>
    )
}

export default Login;