import React from "react";
import { Card, Row, Col } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
const HomePage = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "ข้อมูลบุคลากร",
      description: "จัดการข้อมูลพนักงานพยาบาล",
      icon: <UserOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
      path: "/staff",
    },
    {
      title: "ตารางเวร",
      description: "ดูตารางเวรการทำงาน",
      icon: <CalendarOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
      path: "/schedule",
    },
    {
      title: "ตัวชี้วัดผล",
      description: "ดูดัชนีวัดผลการปฏิบัติงาน",
      icon: <BarChartOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
      path: "/performance",
    },
    {
      title: "จัดการตารางเวร",
      description: "กำหนดและแก้ไขตารางเวร",
      icon: <FileDoneOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
      path: "/manage-schedule",
    },
  ];

  return (
    <div className="dashboard-bg d-flex align-items-center justify-content-center py-5">
      <div className="container-fluid">
        <Row gutter={[24, 24]}>
          {cards.map((card, index) => (
            <Col key={index} xs={24} sm={12} md={12} lg={12}>
              <Card
                hoverable
                onClick={() => navigate(card.path)}
                className="shadow-sm"
                style={{ borderRadius: 12 }}
              >
                <div className="d-flex align-items-center">
                  <div className="me-3">{card.icon}</div>
                  <div>
                    <h5 className="mb-1">{card.title}</h5>
                    <small className="text-muted">{card.description}</small>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default HomePage;
