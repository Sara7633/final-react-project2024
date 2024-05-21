import { Button } from "primereact/button"
import { Checkbox } from "primereact/checkbox"
import { Dialog } from "primereact/dialog"
import { Dropdown } from "primereact/dropdown"
import { InputTextarea } from "primereact/inputtextarea"
import { Toast } from "primereact/toast"
import React, { useEffect, useRef, useState } from "react"
import { useAddOrderMutation } from "./ordersApiSlice"
import { useGetProductsQuery } from "../product/productsApiSlice"
import { InputNumber } from "primereact/inputnumber"
import { useGetUsersQuery } from "../manager/usersApiSlice"

const AddOrder = () => {

    const [nedarimplus,setNedarimplus]=useState(false)
    const [_id,set_id]=useState('')
    const [userName,setUserName]=useState('')
    const [price,setPrice]=useState(0)
    const [paid,setPaid]=useState(false)
    const [payment,setPayment]=useState('מזומן')
    const [comment,setComment]=useState('')
    const [productsList,setProductsList]=useState([])

    const [addOrder] = useAddOrderMutation()
    const [orderDialog, setOrderDialog] = useState(false)
    const toast = useRef(null);
    const { data: products, isLoading: isLoad, isError: isErr, error: err, isSuccess } = useGetProductsQuery()
    const { data, isLoading, isError, error } = useGetUsersQuery()
    useEffect(() => {
        if (isSuccess) {
            const newList = []
            products.map(p => {
                newList.push({ prod: p, quantity: 0 })
            })
            setProductsList(newList)
        }
    }, [products])


    useEffect(()=>{
        
        if(payment=='נדרים פלוס'){
        setNedarimplus(true)
        setPrice(pre=>Math.fround(pre*1.02))
        }
        else if(nedarimplus){
            setPrice(prev=>prev/1.02)
            setNedarimplus(false)
        }
    },[payment])
    if (isLoad) return <h1>Loading</h1>
    if (isErr) return <h2>{err}</h2>
    if (isLoading) return <h1>Loading</h1>
    if (isError) return <h2>{error}</h2>

    const usernames = data.map(e => e.userName)
    const saveOrd = async () => {
        let newPrice = 0

        const newList = productsList.filter(p => Number(p.quantity) > 0)
        setProductsList(a=>newList)
        newList.map(async p => {
            newPrice = newPrice+Number(p.quantity) * Number(p.prod.price)
            
        })
        
        setPrice(newPrice)
        if(payment=='נדרים פלוס'){
            const { error: err } = await addOrder({_id,userName,price:(newPrice+7)*1.02,paid,payment,comment,productsList:newList,completed:true})
            if (!err) {
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'ההזמנה נוצרה בהצלחה', life: 3000 });
            }
            else toast.current.show({ severity: 'error', summary: 'Error', detail: 'ההזמנה נכשלה', life: 3000 });
            setOrderDialog(false);
        }
        else{
            const { error: err } = await addOrder({_id,userName,price:(newPrice+7),paid,payment,comment,productsList:newList,completed:true})
            if (!err) {
                toast.current.show({ severity: 'success', summary: 'Successful', detail: 'ההזמנה נוצרה בהצלחה', life: 3000 });
            }
            else toast.current.show({ severity: 'error', summary: 'Error', detail: 'ההזמנה נכשלה', life: 3000 });
            setOrderDialog(false);
        }
        
        
    };
    const handleChange = (prod) => {
        const quantity = Number(document.getElementById(prod.name).getElementsByTagName('input')[0].ariaValueNow)
        let newList = productsList
        newList.map(p => {
            if (prod == p.prod)
                p.quantity = quantity
        })
        setProductsList(newList);
    }

    const dialogFooter = (
        <React.Fragment>
            <Button label="ביטול" icon="pi pi-times" outlined onClick={() => setOrderDialog(false)} />
            <Button label="אישור" icon="pi pi-check" onClick={()=>saveOrd()} />
        </React.Fragment>
    )
    return (
        <>
            <Button label="הוספת הזמנה" icon="pi pi-plus" severity="success" onClick={() => setOrderDialog(true)} />
            <Toast ref={toast} />
            <Dialog visible={orderDialog} style={{ direction: 'rtl' }} header="הוסף הזמנה" modal className="p-fluid" footer={dialogFooter} onHide={() => setOrderDialog(false)}>
                <div className="field">
                    <label htmlFor="name" className="font-bold">
                        שם משתמש
                    </label>
                    <Dropdown name="userName" value={userName} onChange={(e) => { setUserName(e.target.value) }}
                        rules={{ required: 'שדה חובה' }}
                        options={usernames}
                        className="w-full md:w-14rem" />
                </div>
                {products.map(e => {
                    return <div>
                        <div>{e.name}</div>
                        <InputNumber value={0} defaultValue={0} min={0} id={e.name} onChange={() => handleChange(e)}></InputNumber>
                    </div>
                })}
                <div className="field">
                    <label className="mb-3 font-bold">תשלום</label>
                    <Checkbox name="paid" checked={paid} onChange={(e) => { setPaid(e.checked) }} />
                    <label htmlFor="paid">האם שולם</label>
                    <div className="field">
                        <div> <label className="font-bold" htmlFor="payment">אמצעי תשלום</label></div>
                        <Dropdown name="payment" value={payment} onChange={(e) =>  setPayment(e.target.value) }
                            options={['נדרים פלוס', "צ'ק", 'מזומן']}
                            className="w-full md:w-14rem" />
                    </div>
                    <div className="field">
                        <label className="mb-3 font-bold">הוספת הערה</label>
                        <span className="p-float-label">
                            <InputTextarea id="description" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} cols={20} />
                        </span>
                    </div>
                </div>
            </Dialog ></>)
}
export default AddOrder