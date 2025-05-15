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
  message,
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
      const res = await axios.get(`${API_URL}/schedule/myward`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setWards(res.data);
    } catch {
      message.error("โหลดข้อมูลวอร์ดไม่สำเร็จ");
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
    },
    {
      title: "วอร์ด",
      key: "ward",
      render: (_, record) => record.ward?.name || "-",
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
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          เพิ่มพยาบาล
        </Button>
      </Space>
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => record.id}
      />

      <Modal
        title="เพิ่มพยาบาลใหม่"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleAdd}
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
