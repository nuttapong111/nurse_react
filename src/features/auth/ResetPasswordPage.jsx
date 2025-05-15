import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./RegisterPage.css"; // ใช้สไตล์ร่วมกับ register

const { Title } = Typography;
const api = import.meta.env.VITE_API_URL + "/auth/reset-password";

const ResetPasswordPage = () => {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  useEffect(() => {
    const resetToken = searchParams.get("token");
    if (resetToken) {
      setToken(resetToken);
    } else {
      Swal.fire({
        icon: "error",
        title: "ลิงก์ไม่ถูกต้อง",
        text: "ไม่พบโทเคนรีเซ็ตรหัสผ่าน",
      });
    }
  }, []);

  const onFinish = async (values) => {
    const { password, confirmPassword } = values;
    let newPassword = password;
    console.log("password", newPassword);
    if (password !== confirmPassword) {
      return Swal.fire({
        icon: "warning",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณากรอกให้ตรงกันทั้ง 2 ช่อง",
      });
    }

    try {
      await axios.post(api, {
        token,
        newPassword,
      });
      Swal.fire({
        icon: "success",
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        text: "สามารถเข้าสู่ระบบด้วยรหัสใหม่ได้",
        confirmButtonText: "เข้าสู่ระบบ",
      }).then(() => {
        window.location.href = "/login";
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "ล้มเหลว",
        text: err?.response?.data?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้",
      });
    }
  };

  return (
    <div className="register-screen flex min-h-screen register-bg">
      <div className="register-form">
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
          <div className="w-full max-w-sm">
            <Title level={3} className="text-center text-blue-900 mb-6">
              ตั้งรหัสผ่านใหม่
            </Title>

            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="รหัสผ่านใหม่"
                name="password"
                rules={[{ required: true, message: "กรุณากรอกรหัสผ่านใหม่" }]}
              >
                <Input.Password size="large" />
              </Form.Item>

              <Form.Item
                label="ยืนยันรหัสผ่านใหม่"
                name="confirmPassword"
                rules={[{ required: true, message: "กรุณายืนยันรหัสผ่านใหม่" }]}
              >
                <Input.Password size="large" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  ยืนยันการเปลี่ยนรหัสผ่าน
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
