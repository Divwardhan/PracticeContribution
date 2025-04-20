import React from 'react'
import axios from 'axios'

const Imagefetch = () => {
    const visitorImage=async ()=>{
        try{
        const response = await axios.post("http://localhost:5000/detect-faces", {
            visitorId : "v1"
        })
        console.log(response.data)
    }
    catch(err){
        console.log(err)
    }
    }


    return (
    <div onClick={visitorImage}>imagefetch</div>
  )
}

export default Imagefetch