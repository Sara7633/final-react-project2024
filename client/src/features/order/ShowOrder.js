
import { Dialog } from "primereact/dialog";
import React, { useState } from "react"
const ShowOrder=(props)=>{
    const [visible,setVisible]=useState(true)
    return(<>
    <Dialog visible={visible} onHide={()=>setVisible(false)}>
    <h1>llllllllll</h1>
   </Dialog> </>)
}

export default ShowOrder