import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Table,
  Button,
  DatePicker,
  Space,
  Spin,
  message,
  Empty,
  Modal,
  Form,
} from "antd";
import axios from "axios";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/th_TH";

const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;
const currentDate = new Date();

const ManageRequest = () => {
  const [wards, setWards] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedDates, setSelectedDates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/schedule/myward`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setWards(res.data))
      .catch(() => message.error("โหลดข้อมูลวอร์ดไม่สำเร็จ"));
  }, []);

  useEffect(() => {
    if (selectedWard && month && year) {
      fetchStaff();
    }
  }, [selectedWard, year, month]);

  const fetchStaff = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/setting/leaveday/${selectedWard}/${year}/${month}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setStaff(res.data))
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  };

  const getMonthYearOptions = () => {
    const result = [];
    const start = new Date(2025, 3);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2);

    while (start < end) {
      result.push({
        month: start.getMonth() + 1,
        year: start.getFullYear(),
        label: `${start.toLocaleString("th-TH", { month: "long" })} ${
          start.getFullYear() + 543
        }`,
      });
      start.setMonth(start.getMonth() + 1);
    }
    return result;
  };

  const handleAddLeave = (userId, dates) => {
    if (!selectedWard || !month || !year || !dates || dates.length === 0)
      return;

    const formattedDates = dates.map((d) => dayjs(d).format("YYYY-MM-DD"));
    console.log("saving leave:", userId, formattedDates);
    axios
      .post(
        `${API_URL}/setting/user-off`,
        { userId, year, month, dates: formattedDates },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then(() => {
        Swal.fire("สำเร็จ", "บันทึกวันหยุดเรียบร้อยแล้ว", "success");
        setEditingUserId(null);
        fetchStaff();
      })
      .catch(() => Swal.fire("ผิดพลาด", "ไม่สามารถบันทึกได้", "error"));
  };

  const handleDeleteLeave = (userId) => {
    if (!selectedWard || !month || !year) return;

    Swal.fire({
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบวันหยุดของพยาบาลคนนี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${API_URL}/setting/user-off/${userId}/${year}/${month}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then(() => {
            Swal.fire("สำเร็จ", "ลบวันหยุดเรียบร้อยแล้ว", "success");
            fetchStaff();
          })
          .catch(() => {
            Swal.fire("ผิดพลาด", "ไม่สามารถลบวันหยุดได้", "error");
          });
      }
    });
  };

  const columns = [
    {
      title: "ชื่อพยาบาล",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "วันที่หยุดที่ขอ",
      dataIndex: "leaveDates",
      key: "leaveDates",
      render: (_, record) =>
        editingUserId === record.id ? (
          <DatePicker
            locale={locale}
            multiple
            onChange={(value) =>
              setSelectedDates({ ...selectedDates, [record.id]: value })
            }
            value={selectedDates[record.id] || []}
            format="DD/MM/YYYY"
            mode="date"
            picker="date"
            disabledDate={(current) => {
              if (!current) return true;
              const selectedStart = dayjs(
                `${year}-${String(month).padStart(2, "0")}-01`
              ).startOf("month");
              const selectedEnd = selectedStart.endOf("month");
              return (
                current.isBefore(selectedStart, "day") ||
                current.isAfter(selectedEnd, "day")
              );
            }}
          />
        ) : record.leaveDates?.length ? (
          record.leaveDates.map((d) => dayjs(d).format("DD/MM/YYYY")).join(", ")
        ) : (
          "-"
        ),
    },
    {
      title: "จำนวนวันหยุด",
      key: "leaveCount",
      align: "center",
      render: (_, record) =>
        record.leaveDates?.length ? record.leaveDates.length : 0,
    },
    {
      title: "การจัดการ",
      key: "action",
      render: (_, record) => (
        <Space>
          {editingUserId === record.id ? (
            <Button
              type="primary"
              onClick={() =>
                handleAddLeave(record.id, selectedDates[record.id] || [])
              }
            >
              บันทึก
            </Button>
          ) : (
            <Button onClick={() => setEditingUserId(record.id)}>
              {record.leaveDates?.length ? "แก้ไข" : "เพิ่ม"}
            </Button>
          )}

          {record.leaveDates?.length > 0 && (
            <Button danger onClick={() => handleDeleteLeave(record.id)}>
              ลบ
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleOpenModal = () => {
    form.resetFields();
    setIsModalOpen(true);
    axios
      .get(`${API_URL}/setting/users-by-ward/${selectedWard}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setAvailableUsers(res.data))
      .catch(() => message.error("โหลดรายชื่อพยาบาลไม่สำเร็จ"));
  };

  const handleSubmitNewLeave = async () => {
    try {
      const { userId, dates } = await form.validateFields();
      handleAddLeave(userId, dates);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Validation failed", err);
    }
  };

  return (
    <Card
      title="จัดการวันหยุดของพยาบาล"
      extra={
        <Button
          type="primary"
          onClick={handleOpenModal}
          disabled={!selectedWard || !month || !year}
        >
          เพิ่มวันหยุด
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="เลือกวอร์ด"
            value={selectedWard}
            onChange={setSelectedWard}
            style={{ width: "100%" }}
          >
            {wards.map((w) => (
              <Option key={w.id} value={w.id}>
                {w.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="เลือกเดือน ปี"
            value={month && year ? `${month}-${year}` : undefined}
            onChange={(val) => {
              const [m, y] = val.split("-");
              setMonth(Number(m));
              setYear(Number(y));
            }}
            style={{ width: "100%" }}
          >
            {getMonthYearOptions().map((item) => (
              <Option
                key={`${item.month}-${item.year}`}
                value={`${item.month}-${item.year}`}
              >
                {item.label}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <div className="mt-4">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Spin size="large" tip="กำลังโหลดข้อมูล..." />
          </div>
        ) : staff.length ? (
          <Table
            dataSource={staff}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        ) : (
          <Empty description="ไม่มีข้อมูลพยาบาลหรือยังไม่ได้เลือกเดือนและวอร์ด" />
        )}
      </div>

      <Modal
        title="เพิ่มวันหยุดพยาบาล"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmitNewLeave}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="userId"
            label="เลือกพยาบาล"
            rules={[{ required: true, message: "กรุณาเลือกพยาบาล" }]}
          >
            <Select placeholder="เลือกพยาบาล">
              {availableUsers.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="dates"
            label="วันที่ต้องการหยุด"
            rules={[{ required: true, message: "กรุณาเลือกวันหยุด" }]}
          >
            <DatePicker
              locale={locale}
              format="DD/MM/YYYY"
              mode="date"
              picker="date"
              multiple
              onChange={(dates) => form.setFieldsValue({ dates })}
              disabledDate={(current) => {
                if (!current) return true;
                const selectedStart = dayjs(
                  `${year}-${String(month).padStart(2, "0")}-01`
                ).startOf("month");
                const selectedEnd = selectedStart.endOf("month");
                return (
                  current.isBefore(selectedStart, "day") ||
                  current.isAfter(selectedEnd, "day")
                );
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManageRequest;
