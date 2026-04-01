import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfileMenu() {

const navigate = useNavigate();

const [open,setOpen] = useState(false);

const username = "User";
const email = "user@email.com";

const logout = () => {
navigate("/");
};

return (

<>

{/* Profile Button */}

<div
style={{
position:"fixed",
top:"20px",
right:"30px",
zIndex:2000
}}
>

<button
onClick={()=>setOpen(true)}
style={{
background:"white",
border:"none",
padding:"10px 14px",
borderRadius:"8px",
cursor:"pointer",
boxShadow:"0 3px 8px rgba(0,0,0,0.2)"
}}
>

👤 {username}

</button>

</div>


{/* Profile Sidebar */}

{open && (

<div
style={{
position:"fixed",
top:"0",
right:"0",
height:"100vh",
width:"320px",
background:"white",
zIndex:3000,
boxShadow:"-4px 0 15px rgba(0,0,0,0.3)",
padding:"20px",
display:"flex",
flexDirection:"column"
}}
>

{/* Header */}

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"20px"
}}
>

<h2>My Profile</h2>

<button
onClick={()=>setOpen(false)}
style={{
border:"none",
background:"none",
fontSize:"20px",
cursor:"pointer"
}}
>

✕
</button>

</div>


{/* Avatar */}

<div
style={{
display:"flex",
flexDirection:"column",
alignItems:"center",
marginBottom:"20px"
}}
>

<div
style={{
width:"80px",
height:"80px",
borderRadius:"50%",
background:"#3b82f6",
color:"white",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"30px",
marginBottom:"10px"
}}
>

{username.charAt(0)}

</div>

<h3>{username}</h3>

<span style={{color:"gray"}}>{email}</span>

</div>


{/* Info */}

<div style={{marginTop:"10px"}}>

<p><b>Role:</b> User</p>

<p><b>Status:</b> Active</p>

</div>


{/* Logout */}

<div style={{marginTop:"auto"}}>

<button
onClick={logout}
style={{
width:"100%",
padding:"10px",
background:"#ef4444",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"bold"
}}
>

Sign Out

</button>

</div>

</div>

)}

</>

);

}

export default ProfileMenu;