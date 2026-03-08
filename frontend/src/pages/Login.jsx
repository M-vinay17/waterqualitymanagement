import React,{useState} from "react";
import {Link,useNavigate} from "react-router-dom";

function Login(){

const navigate = useNavigate();

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const [errors,setErrors] = useState({});

const validate = () => {

let newErrors = {};

if(!email){
newErrors.email = "Email is required";
}

if(!password){
newErrors.password = "Password is required";
}

setErrors(newErrors);

return Object.keys(newErrors).length === 0;

};

const handleSubmit = (e) => {

e.preventDefault();

if(validate()){
navigate("/dashboard");
}

};

return(

<div className="page-container">

<div className="header">Water Quality Monitor</div>

<div className="form-card">

<h2>Login</h2>

<form onSubmit={handleSubmit}>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

{errors.email && <div className="error">{errors.email}</div>}

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

{errors.password && <div className="error">{errors.password}</div>}

<button type="submit">Login</button>

</form>

<p style={{marginTop:"10px"}}>

Don't have account? <Link to="/register">Register</Link>

</p>

</div>

</div>

);

}

export default Login;