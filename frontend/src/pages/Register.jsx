import React,{useState} from "react";
import {Link,useNavigate} from "react-router-dom";

function Register(){

const navigate = useNavigate();

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const [errors,setErrors] = useState({});

const validate = () => {

let newErrors = {};

if(!name){
newErrors.name="Name required";
}

if(!email){
newErrors.email="Email required";
}

if(password.length<6){
newErrors.password="Password must be 6 characters";
}

setErrors(newErrors);

return Object.keys(newErrors).length===0;

};

const handleSubmit = (e) => {

e.preventDefault();

if(validate()){

alert("Registration successful");

navigate("/");

}

};

return(

<div className="page-container">

<div className="header">Water Quality Monitor</div>

<div className="form-card">

<h2>Register</h2>

<form onSubmit={handleSubmit}>

<input
type="text"
placeholder="Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

{errors.name && <div className="error">{errors.name}</div>}

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

<button type="submit">Register</button>

</form>

<p style={{marginTop:"10px"}}>

Already have account? <Link to="/">Login</Link>

</p>

</div>

</div>

);

}

export default Register;