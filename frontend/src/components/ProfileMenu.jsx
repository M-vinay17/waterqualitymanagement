import React,{useState} from "react";
import {useNavigate} from "react-router-dom";

function ProfileMenu(){

const navigate = useNavigate();

const [open,setOpen] = useState(false);

const username = "User";

const logout = () => {

navigate("/");

};

return(

<div style={{
position:"absolute",
top:"20px",
right:"30px"
}}>

<div
style={{
cursor:"pointer",
background:"white",
padding:"10px",
borderRadius:"5px"
}}

onClick={()=>setOpen(!open)}

>

👤 {username}

</div>

{open && (

<div style={{
background:"white",
padding:"10px",
marginTop:"5px",
borderRadius:"5px"
}}>

<button onClick={logout}>Logout</button>

</div>

)}

</div>

);

}

export default ProfileMenu;