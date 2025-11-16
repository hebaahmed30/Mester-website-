import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Cookies from "cookie-universal";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cookies = Cookies();

  // استرجاع بيانات الكورس من state
  const course = location.state?.course;

  const [studentName, setStudentName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>
          لم يتم اختيار أي كورس.{" "}
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 underline"
          >
            ارجع
          </button>
        </p>
      </div>
    );
  }

  const handlePayment = () => {
    const token = cookies.get("token");

    if (!token) {
      return navigate(
        `/login?redirect=/paymob-payment/${course.courseId}`
      );
    }

    // هنا ممكن ترسل بيانات الطالب + الكورس للباك إند أو لبوابة الدفع
    console.log("Student Info:", { studentName, address, phone, course });

    navigate(`/paymob-payment/${course.courseId}`);
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 dark:bg-gray-900 p-6 pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">
          صفحة الدفع
        </h1>

        {/* تفاصيل الكورس */}
        <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {course.courseName}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            {course.courseDescription}
          </p>
          <p className="text-gray-800 dark:text-gray-200 font-bold">
            السعر: {course.coursePrice} جنيه
          </p>
        </div>

        {/* نموذج بيانات الطالب */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="الاسم بالكامل"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700"
          />
          <input
            type="text"
            placeholder="العنوان"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded px-3 py-2 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700"
          />
          <input
            type="tel"
            placeholder="رقم التليفون"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700"
          />
        </div>

        {/* زر الدفع */}
        <button
          onClick={handlePayment}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          ادفع الآن
        </button>
      </div>
    </div>
  );
};

export default Checkout;
