import React from "react";
import { Form, Input, Button, Typography } from "antd";
import axios from "axios";
import Swal from "sweetalert2";
import "./LoginPage.css"; // ใช้ style เดียวกับ Register

const { Title, Text } = Typography;
const api = import.meta.env.VITE_API_URL + "/auth/login";

// 🔵 Forgot password popup
const handleForgotPassword = () => {
  Swal.fire({
    title: "ลืมรหัสผ่าน?",
    text: "กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน",
    input: "email",
    inputPlaceholder: "your@email.com",
    showCancelButton: true,
    confirmButtonText: "ส่งลิงก์รีเซ็ต",
    cancelButtonText: "ยกเลิก",
    preConfirm: async (email) => {
      try {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + "/auth/forgot-password",
          { email }
        );
        return res.data;
      } catch (error) {
        Swal.showValidationMessage(
          error?.response?.data?.message || "ไม่สามารถส่งอีเมลได้"
        );
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "ส่งอีเมลสำเร็จ",
        text: "กรุณาตรวจสอบกล่องอีเมลของคุณ",
      });
    }
  });
};

const LoginPage = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    console.log("✅ กรอกค่ามาแล้ว:", values); // Debug ตรงนี้

    try {
      const res = await axios.post(api, values);

      // ✅ บันทึก token ลง localStorage ก่อน redirect
      localStorage.setItem("token", res.data.token); // ต้องให้ backend ส่ง token กลับมา

      Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        text: "กำลังนำคุณเข้าสู่ระบบ...",
        confirmButtonText: "ตกลง",
      }).then(() => {
        window.location.href = "/schedule"; // ✅ เปลี่ยนเส้นทางหลัง login
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: err?.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        confirmButtonText: "ปิด",
      });
    }
  };

  return (
    <div className="register-screen flex min-h-screen register-bg">
      <div className="register-form">
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
          <div className="w-full max-w-sm">
            <Title level={1} className="text-center text-blue-900 mb-6">
              ระบบสร้างตารางเวร
            </Title>
            <Title level={3} className="text-center text-blue-900 mb-6">
              เข้าสู่ระบบ
            </Title>

            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="อีเมล"
                name="email"
                rules={[
                  { required: true, message: "กรุณากรอกอีเมล" },
                  { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
                ]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="รหัสผ่าน"
                name="password"
                rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
              >
                <Input.Password size="large" />
              </Form.Item>

              <div className="text-right mb-4">
                <a
                  className="text-blue-600 text-sm cursor-pointer"
                  onClick={handleForgotPassword}
                >
                  ลืมรหัสผ่าน?
                </a>
              </div>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  เข้าสู่ระบบ
                </Button>
              </Form.Item>
            </Form>

            <Text className="text-center block mt-4">
              ยังไม่มีบัญชี?{" "}
              <a href="/register" className="text-blue-600">
                สมัครสมาชิก
              </a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
