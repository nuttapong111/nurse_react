import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Image, Tag, Space, Typography, Input, Card, Row, Col, Divider } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";

const { Title } = Typography;
const sidebarStyle = {
  position: "fixed",
  left: 0,
  top: 0,
  height: "100vh",
  width: 200,
  background: "#181c22",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "32px 0 0 0",
  zIndex: 10,
};
const sidebarItem = {
  width: "100%",
  padding: "16px 32px",
  fontSize: 18,
  fontWeight: 600,
  color: "#fff",
  textDecoration: "none",
  background: "none",
  border: "none",
  textAlign: "left",
  cursor: "pointer",
};
const logoutBtn = {
  ...sidebarItem,
  color: "#ff5252",
  marginTop: "auto",
};
const contentStyle = {
  marginLeft: 220,
  maxWidth: 900,
  padding: 32,
};
const PaymentApproval = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [proofHistory, setProofHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/admin/login";
    } else {
      fetchPayments();
    }
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/payment/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          },
        }
      );
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดึงข้อมูลได้",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (referenceId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/payment/approve/${referenceId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "APPROVED" }),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "อนุมัติการชำระเงินสำเร็จ",
          confirmButtonText: "ตกลง",
        });
        fetchPayments();
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถอนุมัติได้",
          confirmButtonText: "ตกลง",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถอนุมัติได้",
        confirmButtonText: "ตกลง",
      });
    }
  };

  const openRejectModal = (payment) => {
    setSelectedPayment(payment);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({ icon: "warning", title: "กรุณากรอกเหตุผลการปฏิเสธ" });
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/payment/approve/${selectedPayment.referenceId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "REJECTED", rejectReason }),
        }
      );
      if (response.ok) {
        Swal.fire({ icon: "success", title: "สำเร็จ", text: "ปฏิเสธการชำระเงินสำเร็จ" });
        setRejectModalVisible(false);
        fetchPayments();
      } else {
        Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถปฏิเสธได้" });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถปฏิเสธได้" });
    }
  };

  const fetchProofHistory = async (referenceId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/payment/history/${referenceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      const data = await response.json();
      setProofHistory(data.proofImage || []);
    } catch (err) {
      setProofHistory([]);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      PENDING: { color: "warning", text: "รอการชำระเงิน" },
      VERIFYING: { color: "processing", text: "กำลังตรวจสอบ" },
      PAID: { color: "success", text: "ชำระเงินสำเร็จ" },
      REJECTED: { color: "error", text: "ถูกปฏิเสธ" },
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "วันที่",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("th-TH"),
    },
    {
      title: "ผู้ใช้",
      dataIndex: ["user", "name"],
      key: "userName",
    },
    {
      title: "แพ็คเกจ",
      dataIndex: ["package", "name"],
      key: "packageName",
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `฿${amount.toLocaleString()}`,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "หลักฐาน",
      key: "proof",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => openPreviewModal(record)}
        >
          ดูหลักฐาน
        </Button>
      ),
    },
    {
      title: "การดำเนินการ",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.status === "VERIFYING" && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.referenceId)}
              >
                อนุมัติ
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => openRejectModal(record)}
              >
                ปฏิเสธ
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  // ฟังก์ชันแปลง path ให้เป็น absolute URL
  const getProofImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    let apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
    if (url.startsWith("/uploads")) return apiUrl + url;
    return apiUrl + "/uploads/" + url;
  };

  const openPreviewModal = (payment) => {
    setSelectedPayment(payment);
    setPreviewVisible(true);
    fetchProofHistory(payment.referenceId);
  };

  return (
    <div style={{ background: "#23272f", minHeight: "100vh" }}>
      <div style={sidebarStyle}>
        <a href="/admin/dashboard" style={sidebarItem}>
          Dashboard
        </a>
        <a href="/admin/users" style={sidebarItem}>
          User Management
        </a>
        <a href="/admin/package" style={sidebarItem}>
          Package Management
        </a>
        <a href="/admin/payment-approve" style={sidebarItem}>
          Payment Approve
        </a>
        <button onClick={handleLogout} style={logoutBtn}>
          Logout
        </button>
      </div>
      <div style={contentStyle}>
        <Title level={2}>อนุมัติการชำระเงิน</Title>
        <Table
          columns={columns}
          dataSource={payments}
          loading={loading}
          rowKey="id"
        />

        <Modal
          title="หลักฐานการชำระเงิน"
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={null}
          width={800}
        >
          {selectedPayment && (
            <div>
              <Card bordered={false} style={{ background: '#f6f8fa', marginBottom: 16 }}>
                <Row gutter={[16, 8]}>
                  <Col span={12}><b>ผู้ใช้:</b> {selectedPayment.user.name}</Col>
                  <Col span={12}><b>แพ็คเกจ:</b> {selectedPayment.package.name}</Col>
                </Row>
                <Row gutter={[16, 8]}>
                  <Col span={12}><b>จำนวนเงิน:</b> ฿{selectedPayment.amount.toLocaleString()}</Col>
                  <Col span={12}><b>วันที่:</b> {new Date(selectedPayment.createdAt).toLocaleDateString("th-TH")}</Col>
                </Row>
              </Card>
              <Divider orientation="left">ประวัติการอัพโหลดหลักฐาน</Divider>
              <Row gutter={[16, 16]}>
                {proofHistory.length === 0 && (
                  <Col span={24} style={{ textAlign: 'center', color: '#888' }}>
                    ไม่มีประวัติการอัพโหลดหลักฐาน
                  </Col>
                )}
                {proofHistory.map((proof, idx) => (
                  <Col xs={24} sm={12} md={8} key={proof.id}>
                    <Card
                      size="small"
                      bordered
                      style={{ marginBottom: 12, background: '#fff' }}
                      bodyStyle={{ padding: 12 }}
                      title={<span style={{ fontSize: 13, color: '#555' }}>#{idx + 1}</span>}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <b>วันที่อัพโหลด:</b><br />
                        <span style={{ color: '#333' }}>{new Date(proof.uploadedAt).toLocaleString("th-TH")}</span>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <b>รูปหลักฐาน:</b><br />
                        <Image src={getProofImageUrl(proof.imageUrl)} width={160} style={{ borderRadius: 6, border: '1px solid #eee' }} />
                      </div>
                      {proof.rejectReason && (
                        <div style={{ color: 'red', fontWeight: 500, marginTop: 8 }}>
                          <b>เหตุผลที่ถูกปฏิเสธ:</b><br />
                          <span>{proof.rejectReason}</span>
                        </div>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Modal>

        <Modal
          title="ปฏิเสธการชำระเงิน"
          open={rejectModalVisible}
          onCancel={() => setRejectModalVisible(false)}
          onOk={handleReject}
          okText="ยืนยัน"
          cancelText="ยกเลิก"
        >
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="กรุณากรอกเหตุผลการปฏิเสธ"
          />
        </Modal>
      </div>
    </div>
  );
};

export default PaymentApproval;
