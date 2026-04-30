import { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "./../Context/ThemeContext";
import { BASEURL, ADDGRADETOSTUDENT } from "../API/API";
import sendRequestGet from "../Shared/sendRequestGet";
import sendRequest from "../Shared/sendRequest";
import SpinnerModal from "../Shared/SpinnerModal";
import { toast } from "react-toastify";

const ExamResultsDetail = () => {
    const { examId } = useParams();
    const [exam, setExam] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState([]);
    const { isDarkMode } = useContext(ThemeContext);
    const [loading, setLoading] = useState(true);
    const [gradingLoading, setGradingLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "تفاصيل نتائج الامتحان";
        return () => {
            document.title = "Default Title";
        };
    }, []);

    useEffect(() => {
        const fetchExamResults = async () => {
            try {
                setLoading(true);

                // جلب تفاصيل الامتحان
                const examResponse = await sendRequestGet(`${BASEURL}/Exams/${examId}`);

                if (examResponse.status === 200) {
                    setExam(examResponse.data);
                }

                // محاولة جلب الطلاب الذين أدوا الامتحان
              const resultsResponse = await sendRequestGet(`${BASEURL}/Admin/exam-results`);

if (resultsResponse.status === 200 && Array.isArray(resultsResponse.data)) {

    const filtered = resultsResponse.data.filter(r => r.examId == examId);

    const studentsFormatted = filtered.map(item => ({
        id: item.studentId,
        firstName: item.studentName,
        lastName: "",
        email: "",
        submissionDate: new Date().toISOString(),
        currentGrade: item.totalGrade,
        status: "graded",
        answers: item.answers
    }));

    setStudents(studentsFormatted);

} else {
    setStudents([]);
}
            } catch (error) {
                console.error("Error fetching exam results:", error);
                toast.error("حدث خطأ في تحميل نتائج الامتحان");
                navigate("/dashboard/exam-results");
            } finally {
                setLoading(false);
            }
        };

        if (examId) {
            fetchExamResults();
        }
    }, [examId, navigate]);

   const handleViewStudentAnswers = async (student) => {
    setSelectedStudent(student);
    setStudentAnswers(student.answers || []);
};
    const handleGiveGrade = async (studentId, grade, feedback = "") => {
        try {
            setGradingLoading(true);

          
            try {
                const gradeData = {
                    examId: parseInt(examId),
                    studentId: studentId,
                    grade: grade,
                    feedback: feedback
                };

                const response = await sendRequest(BASEURL, "Exams/grade", "POST", gradeData);

                if (response.status === 200 || response.status === 201) {
                    toast.success("تم إعطاء الدرجة بنجاح");
                    // تحديث قائمة الطلاب
                    setStudents(prev => prev.map(student =>
                        student.id === studentId
                            ? { ...student, currentGrade: grade, status: "graded" }
                            : student
                    ));
                } else {
                    throw new Error(`Failed with status: ${response.status}`);
                }
            } catch (examGradeError) {
                console.log("Exam grade endpoint failed, trying assignment endpoint");

                // إذا فشل، نجرب endpoint التكليفات
                const assignmentGradeData = {
                    studentId: studentId,
                    assignmentId: parseInt(examId), // استخدام examId كـ assignmentId مؤقتاً
                    grade: grade
                };

                const response = await sendRequest(BASEURL, ADDGRADETOSTUDENT, "POST", assignmentGradeData);

                if (response.status === 200 || response.status === 201) {
                    toast.success("تم إعطاء الدرجة بنجاح");
                    setStudents(prev => prev.map(student =>
                        student.id === studentId
                            ? { ...student, currentGrade: grade, status: "graded" }
                            : student
                    ));
                } else {
                    throw new Error(`Assignment grade failed with status: ${response.status}`);
                }
            }
        } catch (error) {
            console.error("Error giving grade:", error);
            toast.error("حدث خطأ في إعطاء الدرجة: " + (error.message || "Unknown error"));
        } finally {
            setGradingLoading(false);
        }
    };

    const calculateTotalEarned = (answers) => {
        return answers.reduce((total, answer) => total + (answer.earnedDegree || 0), 0);
    };

    const calculateTotalPossible = (answers) => {
        return answers.reduce((total, answer) => total + (answer.questionDegree || 0), 0);
    };

    if (loading) {
        return <SpinnerModal isLoading={true} />;
    }

    if (!exam) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className="text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                        لم يتم العثور على الامتحان
                    </h2>
                    <button
                        onClick={() => navigate("/dashboard/exam-results")}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        العودة لقائمة الامتحانات
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <SpinnerModal isLoading={gradingLoading} />
            <div className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate("/dashboard/exam-results")}
                            className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isDarkMode
                                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            ← العودة لقائمة الامتحانات
                        </button>

                        <div className={`rounded-2xl shadow-xl p-6 ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
                            }`}>
                            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                📊 طلاب امتحان: {exam.name}
                            </h1>
                            <p className={`text-lg mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                عرض الطلاب الذين أدوا الامتحان وإجاباتهم لإعطائهم درجات
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <span className={`px-3 py-1 rounded-full ${isDarkMode ? "bg-green-600 text-white" : "bg-green-100 text-green-800"}`}>
                                    👥 {Array.isArray(students) ? students.length : 0} طالب أدى الامتحان
                                </span>
                                <span className={`px-3 py-1 rounded-full ${isDarkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"}`}>
                                    ⏱️ {exam.time} دقيقة
                                </span>
                                <span className={`px-3 py-1 rounded-full ${isDarkMode ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-800"}`}>
                                    ❓ {exam.questions?.length || 0} سؤال
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Students List */}
                        <div className={`rounded-2xl shadow-xl p-6 ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
                            }`}>
                            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                الطلاب الذين أدوا الامتحان
                            </h2>

                            <div className="space-y-4">
                                {Array.isArray(students) && students.length > 0 ? students.map((student) => (
                                    <div
                                        key={student.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${selectedStudent?.id === student.id
                                            ? isDarkMode ? "border-blue-500 bg-blue-900/20" : "border-blue-500 bg-blue-50"
                                            : isDarkMode ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-gray-50"
                                            }`}
                                        onClick={() => handleViewStudentAnswers(student)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className={`font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                                    {student.firstName} {student.lastName}
                                                </h3>
                                                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                    {student.email}
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                                                    تاريخ التسليم: {new Date(student.submissionDate).toLocaleString('ar-EG')}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                {student.currentGrade !== null ? (
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${isDarkMode ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
                                                        }`}>
                                                        {student.currentGrade} درجة
                                                    </span>
                                                ) : (
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${isDarkMode ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-800"
                                                        }`}>
                                                        لم يتم التصحيح
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <div className={`text-4xl mb-4`}>📝</div>
                                        <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                            لا يوجد طلاب أدوا هذا الامتحان بعد
                                        </h3>
                                        <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                            سيظهر الطلاب هنا عندما يكملوا الامتحان
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Student Answers */}
                        <div className={`rounded-2xl shadow-xl p-6 ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
                            }`}>
                            {selectedStudent ? (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                            إجابات {selectedStudent.firstName} {selectedStudent.lastName}
                                        </h2>

                                        <GradingForm
                                            student={selectedStudent}
                                            totalEarned={calculateTotalEarned(studentAnswers)}
                                            totalPossible={calculateTotalPossible(studentAnswers)}
                                            onGrade={handleGiveGrade}
                                            isDarkMode={isDarkMode}
                                        />
                                    </div>

                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {studentAnswers.map((answer, index) => (
                                            <div
                                                key={answer.questionId}
                                                className={`p-4 rounded-lg border ${answer.isCorrect
                                                    ? isDarkMode ? "border-green-600 bg-green-900/20" : "border-green-200 bg-green-50"
                                                    : isDarkMode ? "border-red-600 bg-red-900/20" : "border-red-200 bg-red-50"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className={`font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                                        السؤال {index + 1}
                                                    </h4>
                                                    <span className={`px-2 py-1 rounded text-sm font-bold ${answer.isCorrect
                                                        ? isDarkMode ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
                                                        : isDarkMode ? "bg-red-600 text-white" : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {answer.earnedDegree}/{answer.questionDegree}
                                                    </span>
                                                </div>

                                                <p className={`mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                    {answer.questionText}
                                                </p>

                                                <div className="grid grid-cols-1 gap-2">
                                                    <div>
                                                        <span className={`text-sm font-bold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                            إجابة الطالب:
                                                        </span>
                                                        <span className={`ml-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                            {answer.studentAnswer}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <span className={`text-sm font-bold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                                            الإجابة الصحيحة:
                                                        </span>
                                                        <span className={`ml-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                            {answer.correctAnswer}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className={`text-6xl mb-4`}>👆</div>
                                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                        اختر طالباً لعرض إجاباته
                                    </h3>
                                    <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                        اضغط على اسم الطالب من القائمة لعرض إجاباته وإعطائه درجة
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Component for grading form
const GradingForm = ({ student, totalEarned, totalPossible, onGrade, isDarkMode }) => {
    const [grade, setGrade] = useState(student.currentGrade || totalEarned || '');
    const [feedback, setFeedback] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (grade === '' || grade < 0) {
            toast.error("يرجى إدخال درجة صحيحة");
            return;
        }

        onGrade(student.id, parseFloat(grade), feedback);
        setShowForm(false);
        setFeedback('');
    };

    return (
        <div>
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-lg hover:from-green-500 hover:to-blue-600 transition-all duration-200"
                >
                    📝 إعطاء درجة
                </button>
            ) : (
                <div className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-gray-100"}`}>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className={`block text-sm font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                الدرجة (من {totalPossible})
                            </label>
                            <input
                                type="number"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                min="0"
                                max={totalPossible}
                                step="0.5"
                                className={`w-full px-3 py-2 border rounded-lg ${isDarkMode
                                    ? "bg-gray-800 border-gray-600 text-white"
                                    : "bg-white border-gray-300 text-gray-900"
                                    }`}
                                placeholder={`مقترح: ${totalEarned}`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                ملاحظات (اختياري)
                            </label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={2}
                                className={`w-full px-3 py-2 border rounded-lg ${isDarkMode
                                    ? "bg-gray-800 border-gray-600 text-white"
                                    : "bg-white border-gray-300 text-gray-900"
                                    }`}
                                placeholder="ملاحظات للطالب..."
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200"
                            >
                                حفظ
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ExamResultsDetail;
