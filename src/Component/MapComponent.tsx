import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMap, MarkerProps } from 'react-leaflet';
import { Alert, Button } from '@mui/material';
import { Check, CheckOutlined, Map, MapOutlined, MapsHomeWork, WorkHistory, WorkOff } from '@mui/icons-material';
import useStyles from '../style';
import Swal from 'sweetalert2';
import { useUser } from '../Context/userContext';
const MapComponent = () => {
  const [position, setPosition] = useState<any>([0,0]); // ตำแหน่งเริ่มต้น (ละติจูด, ลองจิจูด)
  const {setLocation} = useUser();

  useEffect(() => {
    if (!navigator.geolocation) {
      Swal.fire('Error','Geolocation is not supported by your browser','error')
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({latitude:position.coords.latitude,longitude:position.coords.longitude})
        // console.log('position',position)
        setPosition([
           position.coords.latitude,
           position.coords.longitude]);
      },
      (err) => {
      }
    );
  }, []);

  const mapOptions = {
    center: position,
    zoom: 15,
    maxZoom: 18,
    minZoom: 5,

  };


  // useEffect(() => {
  //   map.setView(position);
  // }, [position, map]);


  const RenderMap = ()=>{
    return <MapContainer {...mapOptions} style={{ height: 350 }} >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position}  >
        <Popup>จุดเช็คอิน!</Popup>
      </Marker>
    </MapContainer>
  }

  return (<>
    <RenderMap />

  </>
  );
}
export default MapComponent;
