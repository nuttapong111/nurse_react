// ManageWard.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, Card } from "antd";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const ManageWard = () => {
  const [wards, setWards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWards = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/schedule/myward`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setWards(res.data);
    } catch (err) {
      Swal.fire("ผิดพลาด", "ไม่สามารถโหลดวอร์ดได้", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const openModal = (record = null) => {
    setEditId(record ? record.id : null);
    setIsModalOpen(true);
    form.setFieldsValue({ name: record?.name || "" });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editId) {
        await axios.put(`${API_URL}/setting/ward/${editId}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        Swal.fire("สำเร็จ", "แก้ไขวอร์ดเรียบร้อยแล้ว", "success");
      } else {
        await axios.post(`${API_URL}/setting/createward`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        Swal.fire("สำเร็จ", "เพิ่มวอร์ดเรียบร้อยแล้ว", "success");
      }
      setIsModalOpen(false);
      fetchWards();
      form.resetFields();
    } catch (err) {
      Swal.fire(
        "ผิดพลาด",
        err?.response?.data?.message || "เกิดข้อผิดพลาด",
        "error"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/setting/ward/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire("สำเร็จ", "ลบวอร์ดเรียบร้อยแล้ว", "success");
      fetchWards();
    } catch (err) {
      Swal.fire("ผิดพลาด", "ไม่สามารถลบได้", "error");
    }
  };

  const columns = [
    {
      title: "ชื่อวอร์ด",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "การจัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openModal(record)}>
            แก้ไข
          </Button>
          <Button
            danger
            type="link"
            onClick={() => {
              Swal.fire({
                title: "คุณแน่ใจหรือไม่?",
                text: "การลบวอร์ดนี้ไม่สามารถย้อนกลับได้",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "ลบ",
                cancelButtonText: "ยกเลิก",
              }).then((result) => {
                if (result.isConfirmed) {
                  handleDelete(record.id);
                }
              });
            }}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="จัดการวอร์ด">
      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        เพิ่มวอร์ด
      </Button>
      <Table
        dataSource={wards}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
      />

      <Modal
        title={editId ? "แก้ไขวอร์ด" : "เพิ่มวอร์ดใหม่"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="ชื่อวอร์ด"
            name="name"
            rules={[{ required: true, message: "กรุณากรอกชื่อวอร์ด" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManageWard;
