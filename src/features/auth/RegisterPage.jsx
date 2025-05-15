
import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import axios from "axios";

const api = import.meta.env.VITE_API_URL + "/auth/register";

const Register = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const res = await axios.post(api, values);
      message.success("ลงทะเบียนสำเร็จ");
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error(err?.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card title="สมัครสมาชิก" style={{ width: 400 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="ชื่อผู้ใช้"
            name="name"
            rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="อีเมล"
            name="email"
            rules={[
              { required: true, message: "กรุณากรอกอีเมล" },
              { type: "email", message: "รูปแบบอีเมลไม่ถูกต้อง" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="รหัสผ่าน"
            name="password"
            rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              สมัครสมาชิก
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
