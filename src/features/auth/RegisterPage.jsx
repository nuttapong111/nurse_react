import React from "react";
import { Form, Input, Button, Typography } from "antd";
import axios from "axios";
import Swal from "sweetalert2";
import "./RegisterPage.css"; // ถ้ามี background ให้ตรงกับ class .register-bg

const { Title, Text } = Typography;
const api = import.meta.env.VITE_API_URL + "/auth/register";

const RegisterPage = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { password, confirmPassword } = values;

    if (password !== confirmPassword) {
      return Swal.fire({
        icon: "warning",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณากรอกให้ตรงกันทั้ง 2 ช่อง",
        confirmButtonText: "ตกลง",
      });
    }

    try {
      await axios.post(api, values);
      Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ",
        text: "คุณสามารถเข้าสู่ระบบได้ทันที",
        confirmButtonText: "ตกลง",
      }).then(() => {
        window.location.href = "/login";
      });
      form.resetFields();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err?.response?.data?.message || "ไม่สามารถสมัครสมาชิกได้",
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
              สร้างบัญชีผู้ใช้
            </Title>

            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="ชื่อผู้ใช้"
                name="name"
                rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
              >
                <Input size="large" />
              </Form.Item>

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

              <Form.Item
                label="ยืนยันรหัสผ่าน"
                name="confirmPassword"
                rules={[{ required: true, message: "กรุณายืนยันรหัสผ่าน" }]}
              >
                <Input.Password size="large" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  สมัครสมาชิก
                </Button>
              </Form.Item>
            </Form>

            <Text className="text-center block mt-4">
              มีบัญชีแล้ว?{" "}
              <a href="/login" className="text-blue-600">
                เข้าสู่ระบบ
              </a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
