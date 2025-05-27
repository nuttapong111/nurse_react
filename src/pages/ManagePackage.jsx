import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";

const sidebarStyle = {
  position: "fixed",
  left: 0,
  top: 0,
  height: "100vh",
  width: 200,
  background: "#181c22",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "32px 0 0 0",
  zIndex: 10,
};
const sidebarItem = {
  width: "100%",
  padding: "16px 32px",
  fontSize: 18,
  fontWeight: 600,
  color: "#fff",
  textDecoration: "none",
  background: "none",
  border: "none",
  textAlign: "left",
  cursor: "pointer",
};
const logoutBtn = {
  ...sidebarItem,
  color: "#ff5252",
  marginTop: "auto",
};
const contentStyle = {
  marginLeft: 220,
  maxWidth: 900,
  padding: 32,
};

const ManagePackage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [form] = Form.useForm();

  // เช็ค token ถ้าไม่มีให้ redirect ไปหน้า login
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin/login";
    } else {
      fetchPackages();
    }
  }, []);

  // ดึงข้อมูลแพ็คเกจทั้งหมด
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payment/packages`,
        {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        }
      );
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการดึงข้อมูลแพ็คเกจ",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setLoading(false);
    }
  };

  // เพิ่ม/แก้ไขแพ็คเกจ
  const handleSubmit = async (values) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payment/packages`,
        {
          method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "เพิ่มแพ็คเกจสำเร็จ",
          confirmButtonText: "ตกลง",
        });
        setModalVisible(false);
        fetchPackages();
      } else {
        throw new Error("เพิ่มแพ็คเกจไม่สำเร็จ");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        confirmButtonText: "ตกลง",
      });
    }
  };

  // ลบแพ็คเกจ
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payment/packages/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "ลบแพ็คเกจสำเร็จ",
          confirmButtonText: "ตกลง",
        });
        fetchPackages();
      } else {
        throw new Error("ลบแพ็คเกจไม่สำเร็จ");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        confirmButtonText: "ตกลง",
      });
    }
  };

  // เปิด modal สำหรับแก้ไข
  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    form.setFieldsValue({
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      description: pkg.description,
    });
    setModalVisible(true);
  };

  // เปิด modal สำหรับเพิ่มใหม่
  const handleAdd = () => {
    setEditingPackage(null);
    form.resetFields();
    setModalVisible(true);
  };

  const columns = [
    {
      title: "ชื่อแพ็คเกจ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "ราคา",
      dataIndex: "price",
      key: "price",
      render: (price) => `฿${price.toLocaleString()}`,
    },
    {
      title: "ระยะเวลา (วัน)",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "รายละเอียด",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <div className="space-x-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="คุณแน่ใจหรือไม่ที่จะลบแพ็คเกจนี้?"
            onConfirm={() => handleDelete(record.id)}
            okText="ใช่"
            cancelText="ไม่"
          >
            <Button danger icon={<DeleteOutlined />}>
              ลบ
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <div style={{ background: "#23272f", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <a href="/admin/dashboard" style={sidebarItem}>
          Dashboard
        </a>
        <a href="/admin/users" style={sidebarItem}>
          User Management
        </a>
        <a href="/admin/package" style={sidebarItem}>
          Package Management
        </a>
        <a href="/admin/payment-approve" style={sidebarItem}>
          Payment Approve
        </a>
        <button onClick={handleLogout} style={logoutBtn}>
          Logout
        </button>
      </div>
      {/* Main Content */}
      <div style={contentStyle}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">จัดการแพ็คเกจ</h1>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              เพิ่มแพ็คเกจ
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={packages}
            loading={loading}
            rowKey="id"
          />

          <Modal
            title={editingPackage ? "แก้ไขแพ็คเกจ" : "เพิ่มแพ็คเกจ"}
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              form.resetFields();
            }}
            footer={null}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="name"
                label="ชื่อแพ็คเกจ"
                rules={[{ required: true, message: "กรุณากรอกชื่อแพ็คเกจ" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="price"
                label="ราคา"
                rules={[{ required: true, message: "กรุณากรอกราคา" }]}
              >
                <InputNumber
                  min={0}
                  formatter={(value) =>
                    `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/฿\s?|(,*)/g, "")}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                name="duration"
                label="ระยะเวลา (วัน)"
                rules={[{ required: true, message: "กรุณากรอกระยะเวลา" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="description" label="รายละเอียด">
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item className="mb-0 text-right">
                <Button
                  className="mr-2"
                  onClick={() => {
                    setModalVisible(false);
                    form.resetFields();
                  }}
                >
                  ยกเลิก
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingPackage ? "บันทึก" : "เพิ่ม"}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default ManagePackage;
