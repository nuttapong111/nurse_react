import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  Input,
  Button,
  Row,
  Col,
  Empty,
  Space,
} from "antd";
import {
  FileExcelOutlined,
  FileImageOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

const { Option } = Select;

const SchedulePage = () => {
  const [schedule, setSchedule] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [search, setSearch] = useState("");

  // ✅ โหลดรายชื่อพยาบาล & ตารางเวรเมื่อเลือกเดือน/ปี
  useEffect(() => {
    if (month && year) {
      loadSchedule();
    }
  }, [month, year]);

  const loadSchedule = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/schedule?month=${month}&year=${year}`
      );
      setSchedule(res.data);
      setFiltered(res.data);
    } catch (err) {
      setSchedule([]);
      setFiltered([]);
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/schedule/export-excel?month=${month}&year=${year}`,
        { responseType: "blob" }
      );
      saveAs(res.data, `ตารางเวร_${month}_${year}.xlsx`);
    } catch (err) {
      console.error("Export Excel Failed", err);
    }
  };

  const handleExportImage = async () => {
    const table = document.getElementById("schedule-table");
    if (!table) return;
    const canvas = await html2canvas(table);
    canvas.toBlob((blob) => {
      if (blob) saveAs(blob, `ตารางเวร_${month}_${year}.png`);
    });
  };

  const handleSearch = (value) => {
    const filteredData = schedule.filter((s) =>
      s.nurseName.toLowerCase().includes(value.toLowerCase())
    );
    setFiltered(filteredData);
    setSearch(value);
  };

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
      title: "เวร",
      dataIndex: "shift",
      key: "shift",
    },
  ];

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <Card title="ตารางเวร" bordered={false}>
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Select
            placeholder="เลือกเดือน"
            value={month}
            onChange={(val) => setMonth(val)}
            style={{ width: "100%" }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <Option key={i + 1} value={i + 1}>
                เดือน {i + 1}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <Select
            placeholder="เลือกปี"
            value={year}
            onChange={(val) => setYear(val)}
            style={{ width: "100%" }}
          >
            {years.map((y) => (
              <Option key={y} value={y}>
                ปี {y + 543}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <Input
            placeholder="ค้นหาชื่อพยาบาล"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col span={6}>
          <Space>
            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
              ส่งออก Excel
            </Button>
            <Button icon={<FileImageOutlined />} onClick={handleExportImage}>
              บันทึกรูป
            </Button>
          </Space>
        </Col>
      </Row>

      {filtered.length === 0 ? (
        <Empty
          description={
            month && year
              ? "ไม่มีข้อมูลตารางเวร กรุณาสร้างตารางเวรก่อน"
              : "กรุณาเลือกเดือนและปี"
          }
        />
      ) : (
        <div id="schedule-table">
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={false}
          />
        </div>
      )}
    </Card>
  );
};

export default SchedulePage;
