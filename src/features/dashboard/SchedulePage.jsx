// Schedule.jsx
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Select,
  Input,
  Button,
  Card,
  Empty,
  Space,
  Spin,
  Table,
  Calendar,
  Card as AntdCard,
} from "antd";
import axios from "axios";
import {
  FileExcelOutlined,
  FileImageOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import dayjs from 'dayjs';
import { io } from 'socket.io-client';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;
const currentDate = new Date();

const SchedulePage = () => {
  const [wardList, setWardList] = useState([]);
  const [ward, setWard] = useState(null);
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [nurseQuery, setNurseQuery] = useState("");
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendarData, setCalendarData] = useState({});
  const [calendarValue, setCalendarValue] = useState(dayjs());
  const [progress, setProgress] = useState(0);
  const [progressOpen, setProgressOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);

  // ฟังก์ชันแปลง schedules เป็นรูปแบบที่ Table ต้องการ
  function transformSchedules(schedules) {
    const grouped = {};
    schedules.forEach(item => {
      const dateStr = item.date.split('T')[0];
      const key = `${item.name}_${dateStr}`;
      if (!grouped[key]) {
        grouped[key] = {
          nurseName: item.name,
          date: dateStr,
          morning: null,
          afternoon: null,
          night: null,
        };
      }
      if (item.shiftType === 'morning') grouped[key].morning = '✔️';
      if (item.shiftType === 'evening' || item.shiftType === 'afternoon') grouped[key].afternoon = '✔️';
      if (item.shiftType === 'night') grouped[key].night = '✔️';
    });
    return Object.values(grouped);
  }

  // ฟังก์ชันแปลง schedules เป็นรูปแบบ { [date]: { morning: [], afternoon: [], night: [] } }
  function groupByDateAndShift(schedules) {
    const result = {};
    schedules.forEach(item => {
      const dateStr = item.date.split('T')[0];
      if (!result[dateStr]) {
        result[dateStr] = { morning: [], afternoon: [], night: [] };
      }
      if (item.shiftType === 'morning') result[dateStr].morning.push(item.name);
      if (item.shiftType === 'evening' || item.shiftType === 'afternoon') result[dateStr].afternoon.push(item.name);
      if (item.shiftType === 'night') result[dateStr].night.push(item.name);
    });
    return result;
  }

  useEffect(() => {
    if (Array.isArray(data)) {
      setTableData(transformSchedules(data));
    } else {
      setTableData([]);
    }
  }, [data]);

  useEffect(() => {
    axios
      .get(`${API_URL}/schedule/myward`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setWardList(res.data))
      .catch(() =>
        Swal.fire("ผิดพลาด", "ไม่สามารถโหลดข้อมูลวอร์ดได้", "error")
      );
  }, []);

  useEffect(() => {
    if (ward && year && month) {
      setLoading(true);
      axios
        .get(`${API_URL}/schedule/${ward}/${year}/${month}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          if (Array.isArray(res.data.schedules) && res.data.schedules.length > 0) {
            setData(res.data.schedules);
          } else {
            setData([]);
          }
        })
        .catch(() => setData([]))
        .finally(() => setLoading(false));
    }
  }, [ward, year, month]);

  useEffect(() => {
    setCalendarData(groupByDateAndShift(data));
  }, [data]);

  useEffect(() => {
    if (month && year) {
      setCalendarValue(dayjs(`${year}-${month}-01`));
    }
  }, [month, year]);

  // เชื่อมต่อ socket.io เมื่อ component mount
  useEffect(() => {
    const s = io('http://localhost:3000');
    setSocket(s);
    s.on('connect', () => {
      setSocketId(s.id);
    });
    s.on('schedule-progress', (percent) => {
      setProgress(percent);
    });
    return () => {
      s.disconnect();
    };
  }, []);

  const getMonthYearOptions = () => {
    const result = [];
    const start = new Date(2025, 3);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2);

    while (start < end) {
      result.push({
        month: start.getMonth() + 1,
        year: start.getFullYear(),
        label: `${start.toLocaleString("th-TH", {
          month: "long",
        })} ${start.getFullYear() + 543}`,
      });
      start.setMonth(start.getMonth() + 1);
    }
    return result;
  };

  const handleExport = async (type) => {
    if (!ward || !year || !month)
      return Swal.fire("แจ้งเตือน", "กรุณาเลือกข้อมูลให้ครบก่อน", "warning");
    const endpoint =
      type === "excel"
        ? `${API_URL}/schedule/${ward}/${year}/${month}/export`
        : `${API_URL}/schedule/${ward}/${year}/${month}/image`;
    // ใช้ fetch เพื่อแนบ header แล้วดาวน์โหลดไฟล์
    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        type === "excel"
          ? `schedule_${ward}_${year}_${month}.xlsx`
          : `schedule_${ward}_${year}_${month}.jpg`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      Swal.fire("ผิดพลาด", "ไม่สามารถดาวน์โหลดไฟล์ได้", "error");
    }
  };

  const handleGenerate = async () => {
    if (!ward || !year || !month)
      return Swal.fire(
        "แจ้งเตือน",
        "กรุณาเลือกข้อมูลให้ครบก่อนสร้างตารางเวร",
        "warning"
      );
    try {
      setProgress(0);
      setProgressOpen(true);
      await axios.post(
        `${API_URL}/schedule/auto-generate`,
        {
          wardId: ward,
          year,
          month,
          socketId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProgressOpen(false);
      Swal.fire("สำเร็จ", "สร้างตารางเวรสำเร็จ", "success");
      setTimeout(() => {
        axios
          .get(`${API_URL}/schedule/${ward}/${year}/${month}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((res) => {
            if (Array.isArray(res.data.schedules) && res.data.schedules.length > 0) {
              setData(res.data.schedules);
            } else {
              setData([]);
            }
          });
      }, 800);
    } catch (err) {
      setProgressOpen(false);
      Swal.fire("ผิดพลาด", "ไม่สามารถสร้างตารางเวรได้", "error");
    }
  };

  const filteredData = tableData?.filter((row) =>
    row.nurseName?.includes(nurseQuery)
  );

  function dateCellRender(value) {
    const dateStr = value.format('YYYY-MM-DD');
    const shifts = calendarData[dateStr];
    if (!shifts) return null;
    return (
      <div style={{ fontSize: 12 }}>
        <div style={{
          background: '#e3f2fd', // ฟ้าอ่อน
          borderRadius: 4,
          marginBottom: 2,
          padding: '2px 4px'
        }}>
          <b>เช้า:</b> {shifts.morning.length ? shifts.morning.join(', ') : '-'}
        </div>
        <div style={{
          background: '#fff3e0', // ส้มอ่อน
          borderRadius: 4,
          marginBottom: 2,
          padding: '2px 4px'
        }}>
          <b>บ่าย:</b> {shifts.afternoon.length ? shifts.afternoon.join(', ') : '-'}
        </div>
        <div style={{
          background: '#ede7f6', // ม่วงอ่อน
          borderRadius: 4,
          padding: '2px 4px'
        }}>
          <b>ดึก:</b> {shifts.night.length ? shifts.night.join(', ') : '-'}
        </div>
      </div>
    );
  }

  const columns = [
    {
      title: "ชื่อพยาบาล",
      dataIndex: "nurseName",
      key: "nurseName",
    },
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "กะเช้า",
      dataIndex: "morning",
      key: "morning",
      render: (val) => val || "-",
    },
    {
      title: "กะบ่าย",
      dataIndex: "afternoon",
      key: "afternoon",
      render: (val) => val || "-",
    },
    {
      title: "กะดึก",
      dataIndex: "night",
      key: "night",
      render: (val) => val || "-",
    },
  ];

  return (
    <Card title="ตารางเวร">
      <Row gutter={[12, 12]} align="middle" wrap>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="เลือกวอร์ด"
            style={{ width: "100%" }}
            value={ward}
            onChange={setWard}
          >
            {wardList.map((w) => (
              <Option key={w.id} value={w.id}>
                {w.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="เลือกเดือน ปี"
            style={{ width: "100%" }}
            value={month && year ? `${month}-${year}` : undefined}
            onChange={(val) => {
              const [m, y] = val.split("-");
              setMonth(Number(m));
              setYear(Number(y));
            }}
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
        <Col xs={24} md={12} className="d-flex justify-content-end">
          <Space wrap>
            <Button
              icon={<FileExcelOutlined />}
              onClick={() => handleExport("excel")}
              style={{ backgroundColor: "#e6f7ff", color: "#1890ff" }}
            >
              ส่งออก Excel
            </Button>
            <Button
              icon={<FileImageOutlined />}
              onClick={() => handleExport("image")}
              style={{ backgroundColor: "#fff7e6", color: "#fa8c16" }}
            >
              บันทึกรูป
            </Button>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={handleGenerate}
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              สร้างตารางเวร
            </Button>
          </Space>
        </Col>
      </Row>

      <AntdCard title="ตารางเวรแบบปฏิทิน" style={{ marginBottom: 24 }}>
        <Calendar
          dateCellRender={dateCellRender}
          value={calendarValue}
          headerRender={() => null}
        />
      </AntdCard>

      <Dialog open={progressOpen} maxWidth="xs" fullWidth>
        <DialogContent>
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ marginBottom: 12 }}>กำลังสร้างตารางเวร... {progress}%</div>
            <LinearProgress variant="determinate" value={progress} />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SchedulePage;
