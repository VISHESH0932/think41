import React, { useState,useEffect} from 'react'
import './App.css'

const imageCropper = () =>{
  const [imageSrc,setImageSrc]=useState(null);
  const[crop,setCrop]=useState({x:0 ,y:0,width:0,height:0});
  const[output,setOutput]=useState(null);
  const[imageDetails,setImageDetails]=useState(null);

  const imageRef=useRef(null);
  const canvasRef=useRef(null);
  
}

function App() {
  

  return (
   
  )
}

export default App
