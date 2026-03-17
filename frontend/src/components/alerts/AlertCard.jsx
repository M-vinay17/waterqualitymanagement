import React from "react"

const AlertCard = ({alert}) => {

return (

<div className={`alert-card ${alert.severity}`}>

<h4>{alert.station}</h4>

<p>
{alert.parameter} : {alert.value}
</p>

<span className="alert-time">
{alert.time}
</span>

</div>

)

}
    
export default AlertCard
