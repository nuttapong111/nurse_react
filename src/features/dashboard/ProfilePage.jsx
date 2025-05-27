import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Typography } from "antd";
import Swal from "sweetalert2";

const { Title } = Typography;
const API_URL = import.meta.env.VITE_API_URL;
const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // โหลดข้อมูลผู้ใช้ (mockup หรือดึงจาก API จริง)
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUser(data);
        form.setFieldsValue(data);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "โหลดข้อมูลผู้ใช้ไม่สำเร็จ",
          confirmButtonText: "ตกลง",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "บันทึกข้อมูลสำเร็จ",
          confirmButtonText: "ตกลง",
        });
      setUser(values);
      } else {
        throw new Error("บันทึกข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "บันทึกข้อมูลไม่สำเร็จ",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <Card style={{ width: 400 }} loading={loading}>
        <Title level={3} className="mb-4 text-center">โปรไฟล์ของฉัน</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="ชื่อ-นามสกุล" name="name" rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}> <Input /> </Form.Item>
          <Form.Item label="อีเมล" name="email" rules={[{ required: true, type: "email", message: "กรุณากรอกอีเมล" }]}> <Input disabled /> </Form.Item>
          <Form.Item label="เบอร์โทรศัพท์" name="phone"> <Input /> </Form.Item>
          <Form.Item label="ตำแหน่ง/บทบาท" name="role"> <Input disabled /> </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>บันทึกข้อมูล</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfilePage; 