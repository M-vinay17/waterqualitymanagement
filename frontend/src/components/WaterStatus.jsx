import React from "react";

function getStatus(ph, turbidity){

if(ph >= 6.5 && ph <= 8.5 && turbidity <= 5){
return {label:"Safe",color:"#2ecc71"};
}

if(turbidity <= 10){
return {label:"Warning",color:"#f39c12"};
}

return {label:"Danger",color:"#e74c3c"};

}

function WaterStatus({ph,turbidity}){

const status = getStatus(ph,turbidity);

return(

<div style={{
marginTop:"10px",
padding:"5px",
borderRadius:"5px",
background:status.color,
color:"white"
}}>

Status: {status.label}

</div>

);

}

export default WaterStatus;