import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import axios from "axios";

const { Title } = Typography;
const API_URL = import.meta.env.VITE_API_URL;
const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // โหลดข้อมูลผู้ใช้ (mockup หรือดึงจาก API จริง)
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // ตัวอย่าง: สมมติ API /api/setting/me คืนข้อมูล user
        const res = await axios.get(`${API_URL}/setting/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(res.data);
        form.setFieldsValue(res.data);
      } catch (err) {
        message.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // ตัวอย่าง: สมมติ API /api/setting/me (PUT) สำหรับอัปเดตข้อมูล
      await axios.put(`${API_URL}/setting/me`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("บันทึกข้อมูลสำเร็จ");
      setUser(values);
    } catch (err) {
      message.error("บันทึกข้อมูลไม่สำเร็จ");
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