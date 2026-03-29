import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { BASEURL } from "../componet/API/API"

export default function PaymentResult() {

  const [params] = useSearchParams()
  const orderId = params.get("orderId") || params.get("order")

  const [status, setStatus] = useState("checking")

  useEffect(() => {

    if (!orderId) return

    const interval = setInterval(() => {

      fetch(`${BASEURL}/api/paymob/payment-status/${orderId}`)
        .then(res => res.json())
        .then(data => {

          if (data.status === "Paid") {
            setStatus("success")
            clearInterval(interval)
          }

          if (data.status === "Failed") {
            setStatus("failed")
            clearInterval(interval)
          }

        })

    }, 2000) // كل ثانيتين

    return () => clearInterval(interval)

  }, [orderId])

  if (status === "checking")
    return <h2>جاري التحقق من الدفع...</h2>

  if (status === "success")
    return <h2>تم الدفع بنجاح وتم إضافتك للكورس ✅</h2>

  return <h2>فشل الدفع ❌</h2>
}