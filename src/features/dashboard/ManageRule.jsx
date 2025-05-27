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

// Mapping สำหรับแสดงผลภาษาไทย <-> key ภาษาอังกฤษ
const PRIORITY_OPTIONS = [
  { label: "วันหยุดตามที่ขอ", value: "userOffDays" },
  { label: "จำนวนเวรติดต่อกัน", value: "maxConsecutiveShifts" },
  { label: "จำนวนเวรดึกติดต่อกัน", value: "maxNightShifts" },
  {
    label: "จำนวนเวลาที่ทำงานติดต่อกันสูงสุด(ชั่วโมง)",
    value: "maxConsecutiveWorkingHours",
  },
  { label: "จำนวนเวรรวมที่แตกต่างกันของแต่ละคน", value: "maxShiftDiff" },
  {
    label: "จำนวนเวรที่แตกต่างกันของแต่ละประเภทเวร",
    value: "maxShiftDiffPerType",
  },
];

const DEFAULT_PRIORITY = [
  "userOffDays",
  "maxConsecutiveShifts",
  "maxNightShifts",
  "maxConsecutiveWorkingHours",
  "maxShiftDiff",
  "maxShiftDiffPerType",
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
  const [consecutiveShifts, setConsecutiveShifts] = useState(3);
  const [consecutiveNightShifts, setConsecutiveNightShifts] = useState(2);
  const [priority, setPriority] = useState([]);
  const [maxConsecutiveWorkingHours, setMaxConsecutiveWorkingHours] = useState(16);
  const [maxShiftDiff, setMaxShiftDiff] = useState(3);
  const [maxShiftDiffPerType, setMaxShiftDiffPerType] = useState(2);

  useEffect(() => {
    fetchWards();
  }, []);

  useEffect(() => {
    if (!selectedWard) return;
    fetchPriorityRules();
  }, [selectedWard]);

  const fetchWards = async () => {
    try {
      const response = await axios.get(`${API_URL}/schedule/myward`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setWards(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "โหลดข้อมูลวอร์ดไม่สำเร็จ",
        confirmButtonText: "ตกลง",
      });
    }
  };

  const fetchPriorityRules = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/setting/priority-setting/${selectedWard}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const received = response.data.priority || response.data.criteriaOrder || [];
      const uniqueReceived = received.filter(
        (item, idx) => received.indexOf(item) === idx
      );
      const fullPriority = [...uniqueReceived];
      DEFAULT_PRIORITY.forEach((key) => {
        if (!fullPriority.includes(key)) fullPriority.push(key);
      });
      const finalPriority = DEFAULT_PRIORITY.filter((key) => fullPriority.includes(key));
      setPriority(finalPriority);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "โหลดข้อมูลเกณฑ์ไม่สำเร็จ",
        confirmButtonText: "ตกลง",
      });
    }
  };

  const moveItem = useCallback((from, to) => {
    setPriority((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

  const handleConfirmSaveAll = () => {
    Swal.fire({
      title: "ยืนยันการบันทึก",
      text: "คุณต้องการบันทึกเกณฑ์และลำดับความสำคัญใช่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        saveAll();
      }
    });
  };

  const saveAll = () => {
    axios
      .post(
        `${API_URL}/setting/priority`,
        {
          wardId: selectedWard,
          priority,
          maxConsecutiveShifts: consecutiveShifts,
          maxNightShifts: consecutiveNightShifts,
          maxConsecutiveWorkingHours,
          maxShiftDiff,
          maxShiftDiffPerType,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() =>
        Swal.fire(
          "สำเร็จ",
          "บันทึกเกณฑ์และลำดับความสำคัญเรียบร้อยแล้ว",
          "success"
        )
      )
      .catch(() => Swal.fire("ผิดพลาด", "ไม่สามารถบันทึกได้", "error"));
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>จัดการเกณฑ์การจัดเวร</Title>

      <Card type="inner" title="เลือกวอร์ด" style={{ marginBottom: 24 }}>
        <Select
          style={{ width: "100%" }}
          placeholder="เลือกวอร์ด"
          value={selectedWard}
          onChange={setSelectedWard}
        >
          {wards.map((ward) => (
            <Option key={ward.id} value={ward.id}>
              {ward.name}
            </Option>
          ))}
        </Select>
      </Card>

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
        <RuleSettingItem
          label="จำนวนเวลาที่ทำงานติดต่อกันสูงสุด(ชั่วโมง)"
          value={maxConsecutiveWorkingHours}
          onChange={setMaxConsecutiveWorkingHours}
        />
        <RuleSettingItem
          label="จำนวนเวรรวมที่แตกต่างกันของแต่ละคน"
          value={maxShiftDiff}
          onChange={setMaxShiftDiff}
        />
        <RuleSettingItem
          label="จำนวนเวรที่แตกต่างกันของแต่ละประเภทเวร"
          value={maxShiftDiffPerType}
          onChange={setMaxShiftDiffPerType}
        />
      </Card>

      <Card type="inner" title="ลำดับความสำคัญ" style={{ marginBottom: 24 }}>
        <DndProvider backend={HTML5Backend}>
          {priority.map((item, index) => {
            const found = PRIORITY_OPTIONS.find((opt) => opt.value === item);
            return (
              <DraggableItem
                key={`${item}-${index}`}
                index={index}
                item={found ? found.label : item}
                moveItem={moveItem}
              />
            );
          })}
        </DndProvider>
      </Card>

      <Button type="primary" onClick={handleConfirmSaveAll}>
        บันทึกการตั้งค่า
      </Button>
    </div>
  );
};

export default ManageRule;
