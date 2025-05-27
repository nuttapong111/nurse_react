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
import CircularProgress from '@mui/material/CircularProgress';

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
  const [shiftNames, setShiftNames] = useState(["เช้า", "บ่าย", "ดึก"]);

  // ฟังก์ชันแปลง schedules เป็นรูปแบบที่ Table ต้องการ (dynamic shiftNames)
  function transformSchedules(schedules) {
    const grouped = {};
    schedules.forEach(item => {
      const dateStr = item.date.split('T')[0];
      const key = `${item.name}_${dateStr}`;
      if (!grouped[key]) {
        grouped[key] = {
          nurseName: item.name,
          date: dateStr,
        };
        shiftNames.forEach(name => {
          grouped[key][name] = null;
        });
      }
      if (shiftNames.includes(item.shiftType)) {
        grouped[key][item.shiftType] = '✔️';
      }
    });
    return Object.values(grouped);
  }

  // ฟังก์ชัน groupByDateAndShift แบบ dynamic shiftNames
  function groupByDateAndShift(schedules) {
    const result = {};
    schedules.forEach(item => {
      const dateStr = item.date.split('T')[0];
      if (!result[dateStr]) {
        result[dateStr] = {};
        shiftNames.forEach(name => {
          result[dateStr][name] = [];
        });
      }
      if (shiftNames.includes(item.shiftType)) {
        result[dateStr][item.shiftType].push(item.name);
      }
    });
    return result;
  }

  useEffect(() => {
    if (Array.isArray(data)) {
      setTableData(transformSchedules(data));
    } else {
      setTableData([]);
    }
  }, [data, shiftNames]);

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
  }, [data, shiftNames]);

  useEffect(() => {
    if (month && year) {
      setCalendarValue(dayjs(`${year}-${month}-01`));
    }
  }, [month, year]);

  // เชื่อมต่อ socket.io เมื่อ component mount
  useEffect(() => {
    // ใช้ environment variable ถ้ามี ไม่งั้น fallback เป็น localhost
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    const s = io(SOCKET_URL);
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

  // ดึง shiftNames จาก backend ตาม wardId
  useEffect(() => {
    if (!ward) return;
    async function fetchShiftNames() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/setting/shift-rule/config?wardId=${ward}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data && Array.isArray(res.data.shiftNames)) {
          setShiftNames(res.data.shiftNames);
        }
      } catch {
        setShiftNames(["เช้า", "บ่าย", "ดึก"]);
      }
    }
    fetchShiftNames();
  }, [ward, month, year]);

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

  const monthYearOptions = getMonthYearOptions();
  const yearOptions = [...new Set(monthYearOptions.map(opt => opt.year))];

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

    // ตรวจสอบว่ามีการตั้งค่าเวรในเดือนที่เลือกหรือไม่
    try {
      const token = localStorage.getItem("token");
      const configRes = await axios.get(
        `${API_URL}/setting/shift-rule/config?wardId=${ward}&month=${month}&year=${year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!configRes.data || !configRes.data.shiftNames || configRes.data.shiftNames.length === 0) {
        return Swal.fire({
          icon: "warning",
          title: "ยังไม่ได้ตั้งค่าเวร",
          text: "กรุณาตั้งค่ากฎการจัดเวรสำหรับเดือนที่เลือกก่อน",
          confirmButtonText: "ไปตั้งค่า",
          showCancelButton: true,
          cancelButtonText: "ยกเลิก"
        }).then((result) => {
          if (result.isConfirmed) {
            // นำทางไปยังหน้าตั้งค่าเวร
            window.location.href = `/dashboard/setting/shift-rule?wardId=${ward}&month=${month}&year=${year}`;
          }
        });
        return;
      }

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
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProgressOpen(false);
      Swal.fire("สำเร็จ", "สร้างตารางเวรสำเร็จ", "success");
      setTimeout(() => {
        axios
          .get(`${API_URL}/schedule/${ward}/${year}/${month}`, {
            headers: {
              Authorization: `Bearer ${token}`,
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
      const errorMessage = err.response?.data?.message || "ไม่สามารถสร้างตารางเวรได้";
      const errorDetails = err.response?.data?.details;
      
      Swal.fire({
        icon: "error",
        title: errorMessage,
        text: errorDetails,
        confirmButtonText: "ตกลง",
      });
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
        {shiftNames.map((name, idx) => (
          <div key={name} style={{
            background: idx % 2 === 0 ? '#e3f2fd' : '#fff3e0',
          borderRadius: 4,
          marginBottom: 2,
          padding: '2px 4px'
        }}>
            <b>{name}:</b> {shifts[name]?.length ? shifts[name].join(', ') : '-'}
        </div>
        ))}
      </div>
    );
  }

  // columns ของ Table แบบ dynamic shiftNames
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
    ...shiftNames.map(name => ({
      title: name,
      dataIndex: name,
      key: name,
      render: (val) => val || "-",
    })),
  ];

  return (
    <Card title="ตารางเวร">
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Space wrap>
            <Select
              value={ward}
              onChange={setWard}
              style={{ width: 200 }}
              placeholder="เลือกวอร์ด"
            >
              {wardList.map((w) => (
                <Option key={w.id} value={w.id}>
                  {w.name}
                </Option>
              ))}
            </Select>
            <Select
              value={year}
              onChange={setYear}
              style={{ width: 120 }}
              placeholder="เลือกปี"
            >
              {yearOptions.map((y) => (
                <Option key={y} value={y}>
                  {y + 543}
                </Option>
              ))}
            </Select>
            <Select
              value={month}
              onChange={setMonth}
              style={{ width: 120 }}
              placeholder="เลือกเดือน"
            >
              {monthYearOptions
                .filter((opt) => opt.year === year)
                .map((opt) => (
                  <Option key={opt.month} value={opt.month}>
                    {opt.label}
                  </Option>
                ))}
            </Select>
          </Space>
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
            {/* <Button
              icon={<FileImageOutlined />}
              onClick={() => handleExport("image")}
              style={{ backgroundColor: "#fff7e6", color: "#fa8c16" }}
            >
              บันทึกรูป
            </Button> */}
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

      <AntdCard title="หมายเหตุ" style={{ marginBottom: 24 }}>
        <div style={{ padding: '16px' }}>
          <h4 style={{ marginBottom: '16px' }}>วิธีการสร้างตารางเวร :</h4>
          <ol style={{ paddingLeft: '20px', marginBottom: 0 }}>
            <li style={{ marginBottom: '8px' }}>สร้าง ward</li>
            <li style={{ marginBottom: '8px' }}>เพิ่มบุคคลากร เข้าไปยัง ward</li>
            <li style={{ marginBottom: '8px' }}>เพิ่มวันหยุดที่บุคคลากรต้องการในแต่ละเดือน</li>
            <li style={{ marginBottom: '8px' }}>ตั้งค่าการจัดเวร</li>
            <li style={{ marginBottom: '8px' }}>ตั้งค่าจำนวนเวรในแต่ละวัน</li>
            <li style={{ marginBottom: '8px' }}>ใส่รายละเอียดวันที่ขึ้นเวร</li>
          </ol>
        </div>
      </AntdCard>

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
            <div style={{ marginBottom: 12 }}>กำลังสร้างตารางเวร...</div>
            <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 8 }}>
              <CircularProgress
                variant="determinate"
                value={progress}
                size={80}
                thickness={5}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 'bold',
                }}
              >
                {progress}%
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SchedulePage;
