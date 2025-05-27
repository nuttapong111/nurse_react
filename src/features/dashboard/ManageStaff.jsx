// manage-staff.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
} from "antd";
import axios from "axios";
import Swal from "sweetalert2";

const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [wards, setWards] = useState([]);
  const [filteredWard, setFilteredWard] = useState(null);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${API_URL}/setting/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStaff(res.data);
    } catch {
      console.log("ผิดพลาด", "ไม่สามารถโหลดข้อมูลพยาบาลได้", "error");
    }
  };

  const fetchWards = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/schedule/myward`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setWards(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "โหลดข้อมูลวอร์ดไม่สำเร็จ",
        confirmButtonText: "ตกลง",
      });
    }
  };

  useEffect(() => {
    fetchWards();
    fetchStaff();
  }, []);

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      await axios.post(`${API_URL}/setting/createuser`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire("สำเร็จ", "เพิ่มพยาบาลสำเร็จ", "success");
      form.resetFields();
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) {
      Swal.fire(
        "ผิดพลาด",
        err?.response?.data?.message || "เกิดข้อผิดพลาด",
        "error"
      );
    }
  };

  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      await axios.put(`${API_URL}/setting/user/${editId}`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire("สำเร็จ", "แก้ไขข้อมูลพยาบาลสำเร็จ", "success");
      form.resetFields();
      setIsModalOpen(false);
      fetchStaff();
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
      await axios.delete(`${API_URL}/setting/user/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      Swal.fire("สำเร็จ", "ลบพยาบาลสำเร็จ", "success");
      fetchStaff();
    } catch (err) {
      Swal.fire("ผิดพลาด", "ไม่สามารถลบได้", "error");
    }
  };

  const openModal = (record = null) => {
    setEditId(record ? record.id : null);
    setIsModalOpen(true);
    form.setFieldsValue({
      name: record?.name || "",
      role: record?.role || undefined,
      wardId: record?.wardId || undefined,
    });
  };

  const filteredData = staff.filter(
    (item) =>
      (!filteredWard || item.wardId === filteredWard) &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "ชื่อพยาบาล",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "ตำแหน่ง",
      dataIndex: "role",
      key: "role",
      render: (text) => (text === "nurse" ? "พยาบาล" : "ผู้ช่วยพยาบาล"),
    },
    {
      title: "วอร์ด",
      key: "ward",
      render: (_, record) => record.ward?.name || "-",
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
                text: "การลบพยาบาลนี้ไม่สามารถย้อนกลับได้",
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
    <Card title="จัดการพยาบาล">
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="เลือกวอร์ด"
          style={{ width: 200 }}
          allowClear
          onChange={setFilteredWard}
        >
          {wards.map((w) => (
            <Option key={w.id} value={w.id}>
              {w.name}
            </Option>
          ))}
        </Select>
        <Input.Search
          placeholder="ค้นหาชื่อพยาบาล"
          onSearch={setSearch}
          allowClear
          style={{ width: 250 }}
        />
        <Button type="primary" onClick={() => openModal()}>
          เพิ่มพยาบาล
        </Button>
      </Space>
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => record.id}
      />

      <Modal
        title={editId ? "แก้ไขข้อมูลพยาบาล" : "เพิ่มพยาบาลใหม่"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={editId ? handleEdit : handleAdd}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="ชื่อพยาบาล"
            name="name"
            rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="ตำแหน่ง"
            name="role"
            rules={[{ required: true, message: "กรุณาระบุตำแหน่ง" }]}
          >
            <Select placeholder="เลือกตำแหน่ง">
              <Option value="nurse">พยาบาล</Option>
              <Option value="assistant">ผู้ช่วยพยาบาล</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="วอร์ด"
            name="wardId"
            rules={[{ required: true, message: "กรุณาเลือกวอร์ด" }]}
          >
            <Select placeholder="เลือกวอร์ด">
              {wards.map((w) => (
                <Option key={w.id} value={w.id}>
                  {w.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManageStaff;
