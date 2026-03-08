import React from "react";
import {MapContainer,TileLayer,Marker,Popup} from "react-leaflet";

function StationMap({stations}){

const coords=[
{lat:17.385,lng:78.4867},
{lat:17.395,lng:78.496},
{lat:17.37,lng:78.48},
{lat:17.36,lng:78.47}
];

return(

<MapContainer
center={[17.385,78.4867]}
zoom={12}
style={{height:"400px",width:"85%",margin:"40px auto"}}
>

<TileLayer
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

{stations.map((s,i)=>(

<Marker key={i} position={[coords[i].lat,coords[i].lng]}>

<Popup>

<b>{s.station}</b>

<br/>

pH: {s.ph}

<br/>

Temperature: {s.temp}

<br/>

Turbidity: {s.turbidity}

</Popup>

</Marker>

))}

</MapContainer>

);

}

export default StationMap;