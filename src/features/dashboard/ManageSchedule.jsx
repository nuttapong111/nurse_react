import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Select,
  Button,
  Row,
  Col,
  Table,
  InputNumber,
  Calendar,
  Badge,
  Modal,
  message,
} from "antd";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import axios from "axios";
import "dayjs/locale/th";
import Swal from "sweetalert2";
dayjs.extend(isSameOrBefore);

const { Title } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;

const generateMonthYearOptions = () => {
  const start = dayjs("2025-04-01");
  const end = dayjs().add(1, "month").startOf("month");
  const options = [];
  let current = start;
  while (current.isSameOrBefore(end, "month")) {
    options.push({
      month: current.month() + 1,
      year: current.year(),
      label: `${current.locale('th').format('MMMM')} ${current.year() + 543}`,
    });
    current = current.add(1, "month");
  }
  return options;
};

const ManageSchedule = () => {
  const refCurrentMonth = useRef();
  const monthYearOptions = generateMonthYearOptions();
  const yearOptions = [...new Set(monthYearOptions.map(opt => opt.year))];
  const latest = monthYearOptions[monthYearOptions.length - 1];

  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(latest.month);
  const [selectedYear, setSelectedYear] = useState(latest.year);
  const [selectedDates, setSelectedDates] = useState([]);
  const [shiftConfig, setShiftConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [useSameShift, setUseSameShift] = useState(false);
  const [shiftNames, setShiftNames] = useState(["เช้า", "บ่าย", "ดึก"]);
  const [shiftTimes, setShiftTimes] = useState([
    { start: "07:00", end: "15:00" },
    { start: "15:00", end: "23:00" },
    { start: "23:00", end: "07:00" },
  ]);
  const [uniformShift, setUniformShift] = useState({});

  const fetchWards = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/schedule/myward`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWards(res.data);
      if (res.data.length > 0 && !selectedWard) {
        setSelectedWard(res.data[0].id);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลวอร์ดได้",
        confirmButtonText: "ตกลง",
      });
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  useEffect(() => {
    if (!selectedWard || !selectedMonth || !selectedYear) return;
    async function fetchShiftConfig() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/setting/shift-rule/config?wardId=${selectedWard}&month=${selectedMonth}&year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && Array.isArray(res.data.shiftNames)) {
          setShiftNames(res.data.shiftNames);
          setShiftTimes(res.data.shiftTimes || Array(res.data.shiftNames?.length || 3).fill({ start: "", end: "" }));
          const obj = {};
          res.data.shiftNames.forEach(name => {
            obj[name] = { nurse: 0, assistant: 0 };
          });
          setUniformShift(obj);
        }
      } catch (err) {
        setShiftNames(["เช้า", "บ่าย", "ดึก"]);
        setShiftTimes([
          { start: "07:00", end: "15:00" },
          { start: "15:00", end: "23:00" },
          { start: "23:00", end: "07:00" },
        ]);
        setUniformShift({ "เช้า": { nurse: 0, assistant: 0 }, "บ่าย": { nurse: 0, assistant: 0 }, "ดึก": { nurse: 0, assistant: 0 } });
      }
    }
    fetchShiftConfig();
  }, [selectedWard, selectedMonth, selectedYear]);

  const onSelectDate = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const handleShiftChange = (date, shiftType, role, value) => {
    setShiftConfig((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [shiftType]: {
          ...((prev[date] && prev[date][shiftType]) || {}),
          [role]: value,
        },
      },
    }));
  };

  const handleUniformShiftChange = (shiftType, role, value) => {
    const newUniformShift = {
      ...uniformShift,
      [shiftType]: {
        ...uniformShift[shiftType],
        [role]: value,
      },
    };
    setUniformShift(newUniformShift);

    if (useSameShift) {
      const newConfig = {};
      selectedDates.forEach((date) => {
        newConfig[date] = newUniformShift;
      });
      setShiftConfig(newConfig);
    }
  };

  const handleSave = () => {
    if (!selectedWard) {
      Swal.fire({
        icon: "warning",
        title: "คำเตือน",
        text: "กรุณาเลือกวอร์ดก่อน",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    if (selectedDates.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "คำเตือน",
        text: "กรุณาเลือกวันที่ต้องการตั้งค่าเวรก่อน",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    Modal.confirm({
      title: "ยืนยันการบันทึก",
      content: "คุณต้องการบันทึกการตั้งค่าวันขึ้นเวรใช่หรือไม่?",
      okText: "บันทึก",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          setLoading(true);
          const payload = {
            wardId: selectedWard,
            year: selectedYear,
            month: selectedMonth,
            workingDates: selectedDates,
            shiftsPerDay: Object.fromEntries(shiftNames.map(name => [name, 1])),
            staffPerShift: {},
            shiftNames,
            shiftTimes,
          };

          if (useSameShift) {
            shiftNames.forEach(name => {
              payload.staffPerShift[name] = uniformShift[name] || { nurse: 0, assistant: 0 };
            });
          } else {
            const firstDate = selectedDates[0];
            const firstConfig = shiftConfig[firstDate] || {};
            shiftNames.forEach(name => {
              payload.staffPerShift[name] = firstConfig[name] || { nurse: 0, assistant: 0 };
            });
          }

          await axios.post(`${API_URL}/setting/shift-rule`, payload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          Swal.fire({
            icon: "success",
            title: "สำเร็จ",
            text: "บันทึกข้อมูลเรียบร้อยแล้ว",
            confirmButtonText: "ตกลง",
          });
        } catch (err) {
          console.error(err);
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "เกิดข้อผิดพลาดในการบันทึก",
            confirmButtonText: "ตกลง",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "วันที่",
      dataIndex: "date",
      render: (text) => dayjs(text).format("D MMM YYYY"),
    },
    ...shiftNames.flatMap((shiftType) => [
      {
        title: `${shiftType} - พยาบาล`,
        dataIndex: `${shiftType}-nurse`,
        render: (_, record) => (
          <InputNumber
            min={0}
            value={shiftConfig[record.date]?.[shiftType]?.nurse || 0}
            onChange={(val) =>
              handleShiftChange(record.date, shiftType, "nurse", val)
            }
          />
        ),
      },
      {
        title: `${shiftType} - ผู้ช่วย`,
        dataIndex: `${shiftType}-assistant`,
        render: (_, record) => (
          <InputNumber
            min={0}
            value={shiftConfig[record.date]?.[shiftType]?.assistant || 0}
            onChange={(val) =>
              handleShiftChange(record.date, shiftType, "assistant", val)
            }
          />
        ),
      },
    ]),
  ];

  const tableData = selectedDates.sort().map((date) => ({ key: date, date }));

  if (wards.length === 0) {
    return (
      <Card>
        <Title level={4}>ตั้งค่าวันขึ้นเวรในแต่ละเดือน</Title>
        <p>ไม่พบข้อมูลวอร์ด</p>
      </Card>
    );
  }

  return (
    <Card title={<Title level={4}>ตั้งค่าวันขึ้นเวรในแต่ละเดือน</Title>}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
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
        <Col span={4}>
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: "100%" }}
          >
            {monthYearOptions
              .filter((opt) => opt.year === selectedYear)
              .map((opt) => (
                <Option key={opt.month} value={opt.month}>
                  {opt.label}
                </Option>
              ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: "100%" }}
          >
            {yearOptions.map((y) => (
              <Option key={y} value={y}>
                {y + 543}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <label>
            <input
              type="checkbox"
              checked={useSameShift}
              onChange={(e) => {
                const checked = e.target.checked;
                setUseSameShift(checked);
                if (checked) {
                  const newConfig = {};
                  selectedDates.forEach((date) => {
                    newConfig[date] = uniformShift;
                  });
                  setShiftConfig(newConfig);
                }
              }}
            />{" "}
            ใช้จำนวนพยาบาลเหมือนกันทุกวัน
          </label>
        </Col>
      </Row>

      {useSameShift && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card size="small" title="ตั้งค่าจำนวนพยาบาลสำหรับทุกวัน">
              <Row gutter={[16, 16]}>
                {shiftNames.map((shiftType) => (
                  <Col span={24 / shiftNames.length} key={shiftType}>
                    <Card size="small" title={`กะ${shiftType}`}>
                      <Row gutter={[8, 8]}>
                        <Col span={12}>
                          <div>พยาบาล:</div>
                          <InputNumber
                            min={0}
                            value={uniformShift[shiftType]?.nurse || 0}
                            onChange={(val) =>
                              handleUniformShiftChange(shiftType, "nurse", val)
                            }
                          />
                        </Col>
                        <Col span={12}>
                          <div>ผู้ช่วย:</div>
                          <InputNumber
                            min={0}
                            value={uniformShift[shiftType]?.assistant || 0}
                            onChange={(val) =>
                              handleUniformShiftChange(shiftType, "assistant", val)
                            }
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      <Calendar
        fullscreen={false}
        value={dayjs(
          `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`
        )}
        onSelect={onSelectDate}
        dateCellRender={(date) =>
          selectedDates.includes(date.format("YYYY-MM-DD")) ? (
            <Badge status="processing" />
          ) : null
        }
        disabledDate={(current) => {
          if (!current) return true;
          const selectedStart = dayjs(
            `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`
          ).startOf("month");
          const selectedEnd = selectedStart.endOf("month");
          return (
            current.isBefore(selectedStart, "day") ||
            current.isAfter(selectedEnd, "day")
          );
        }}
      />

      <Table
        style={{ marginTop: 24 }}
        columns={columns}
        dataSource={tableData}
        pagination={false}
        bordered
        size="small"
      />

      <Button
        type="primary"
        style={{ marginTop: 16 }}
        onClick={handleSave}
        loading={loading}
      >
        บันทึกการตั้งค่า
      </Button>
    </Card>
  );
};

export default ManageSchedule;
