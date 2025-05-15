import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  InputNumber,
  Typography,
  Button,
  Row,
  Col,
  Select,
  message,
} from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Swal from "sweetalert2";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const { Title } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL;

const DEFAULT_PRIORITY = [
  "วันหยุดตามที่ขอ",
  "จำนวนเวรติดต่อกัน",
  "จำนวนเวรดึกติดต่อกัน",
];

const RuleSettingItem = ({ label, value, onChange }) => (
  <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
    <Col>{label}</Col>
    <Col>
      <Button onClick={() => onChange(value - 1)}>-</Button>
      <InputNumber
        min={0}
        value={value}
        onChange={onChange}
        style={{ margin: "0 8px", width: 60 }}
      />
      <Button onClick={() => onChange(value + 1)}>+</Button>
    </Col>
  </Row>
);

const DraggableItem = ({ item, index, moveItem }) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: "PRIORITY",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [, drag] = useDrag({
    type: "PRIORITY",
    item: { index },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        padding: 10,
        marginBottom: 8,
        border: "1px solid #ddd",
        borderRadius: 4,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "move",
      }}
    >
      <span>
        {index + 1}. {item}
      </span>
      <MenuOutlined />
    </div>
  );
};

const generateMonthYearOptions = () => {
  const start = dayjs("2025-04-01");
  const end = dayjs().add(1, "month").startOf("month");

  const options = [];
  let current = start;

  while (current.isSameOrBefore(end, "month")) {
    options.push({
      month: current.month() + 1,
      year: current.year(),
    });
    current = current.add(1, "month");
  }

  return options;
};

const ManageRule = () => {
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [consecutiveShifts, setConsecutiveShifts] = useState(3);
  const [consecutiveNightShifts, setConsecutiveNightShifts] = useState(2);
  const [priority, setPriority] = useState([]);

  const monthYearOptions = generateMonthYearOptions();

  useEffect(() => {
    const latest = monthYearOptions[monthYearOptions.length - 1];
    setSelectedMonth(latest.month);
    setSelectedYear(latest.year);
  }, []);

  useEffect(() => {
    axios
      .get(`${API_URL}/schedule/myward`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setWards(res.data))
      .catch(() => message.error("โหลดข้อมูลวอร์ดไม่สำเร็จ"));
  }, []);

  useEffect(() => {
    if (!selectedWard || !selectedMonth || !selectedYear) return;

    axios
      .get(
        `${API_URL}/setting/constraint/${selectedWard}/${selectedYear}/${selectedMonth}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((res) => {
        const { consecutiveShifts, consecutiveNightShifts, maxLeavePerMonth } =
          res.data;
        setConsecutiveShifts(res.data.maxConsecutiveShifts);
        setConsecutiveNightShifts(res.data.maxNightShifts);
      })
      .catch(() => message.error("โหลดข้อมูลเกณฑ์ไม่สำเร็จ"));

    axios
      .get(
        `${API_URL}/setting/priority-setting/${selectedWard}/${selectedYear}/${selectedMonth}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((res) => {
        const received = res.data.priority;
        setPriority(
          Array.isArray(received) && received.length > 0
            ? received
            : DEFAULT_PRIORITY
        );
      })
      .catch(() => {
        message.warning("ใช้ลำดับความสำคัญค่าเริ่มต้น");
        setPriority(DEFAULT_PRIORITY);
      });
  }, [selectedWard, selectedMonth, selectedYear]);

  const moveItem = useCallback((from, to) => {
    setPriority((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

  const handleConfirmSaveRules = () => {
    Swal.fire({
      title: "ยืนยันการบันทึก",
      text: "คุณต้องการบันทึกการตั้งค่าเกณฑ์ใช่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        saveRules();
      }
    });
  };

  const handleConfirmSavePriority = () => {
    Swal.fire({
      title: "ยืนยันการบันทึก",
      text: "คุณต้องการบันทึกลำดับความสำคัญใช่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        savePriority();
      }
    });
  };

  const saveRules = () => {
    axios
      .post(
        `${API_URL}/setting/constraint`,
        {
          wardId: selectedWard,
          year: selectedYear,
          month: selectedMonth,
          consecutiveShifts,
          consecutiveNightShifts,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => Swal.fire("สำเร็จ", "บันทึกเกณฑ์เรียบร้อยแล้ว", "success"))
      .catch(() => Swal.fire("ผิดพลาด", "ไม่สามารถบันทึกเกณฑ์ได้", "error"));
  };

  const savePriority = () => {
    axios
      .post(
        `${API_URL}/setting/priority`,
        {
          wardId: selectedWard,
          year: selectedYear,
          month: selectedMonth,
          priority,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() =>
        Swal.fire("สำเร็จ", "บันทึกลำดับความสำคัญเรียบร้อยแล้ว", "success")
      )
      .catch(() =>
        Swal.fire("ผิดพลาด", "ไม่สามารถบันทึกลำดับความสำคัญได้", "error")
      );
  };

  return (
    <Card title={<Title level={4}>จัดการเกณฑ์</Title>}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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
            placeholder="เดือน"
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: "100%" }}
          >
            {monthYearOptions
              .filter((opt) => opt.year === selectedYear)
              .map((opt) => (
                <Option key={opt.month} value={opt.month}>
                  เดือน {opt.month}
                </Option>
              ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder="ปี"
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: "100%" }}
          >
            {[...new Set(monthYearOptions.map((opt) => opt.year))].map(
              (year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              )
            )}
          </Select>
        </Col>
      </Row>

      <Card type="inner" title="ตั้งค่าเกณฑ์" style={{ marginBottom: 24 }}>
        <RuleSettingItem
          label="จำนวนเวรติดต่อกัน"
          value={consecutiveShifts}
          onChange={setConsecutiveShifts}
        />
        <RuleSettingItem
          label="จำนวนเวรดึกติดต่อกัน"
          value={consecutiveNightShifts}
          onChange={setConsecutiveNightShifts}
        />
      </Card>

      <Card type="inner" title="ลำดับความสำคัญ" style={{ marginBottom: 24 }}>
        <DndProvider backend={HTML5Backend}>
          {priority.map((item, index) => (
            <DraggableItem
              key={`${item}-${index}`}
              index={index}
              item={item}
              moveItem={moveItem}
            />
          ))}
        </DndProvider>
      </Card>

      <Row gutter={[16, 16]} justify="end">
        <Col>
          <Button
            type="primary"
            onClick={handleConfirmSaveRules}
            disabled={!selectedWard}
          >
            บันทึกเกณฑ์
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={handleConfirmSavePriority}
            disabled={!selectedWard}
          >
            บันทึกลำดับความสำคัญ
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default ManageRule;
