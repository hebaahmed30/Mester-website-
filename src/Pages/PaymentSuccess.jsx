import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { BASEURL } from "../componet/API/API";

const PaymentSuccess = () => {

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");

  useEffect(() => {

    const checkPayment = async () => {

      if (!orderId) return;

      const res = await fetch(`${BASEURL}/PayMob/payment-status/${orderId}`);
      const data = await res.json();

      if (data.status === "Paid") {
        window.location.href = "/my-courses";
      }

    };

    checkPayment();

  }, [orderId]);

  return (
    <div style={{textAlign:"center", marginTop:"120px"}}>
      <h2>تم الدفع بنجاح 🎉</h2>
      <p>جاري تفعيل الكورس...</p>
    </div>
  );
};

export default PaymentSuccess;