import React, { useEffect, useState } from "react";
import { Card, Button, Modal, Row, Col, Tag, Upload } from "antd";
import { CheckCircleOutlined, UploadOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";

const PackageList = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/payment/packages`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPackages(data))
      .finally(() => setLoading(false));
  }, []);

  const handlePay = (pkg) => {
    setSelectedPackage(pkg);
    setShowQRModal(true);
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("packageId", selectedPackage.id);
      formData.append("amount", selectedPackage.price);

      // อัพโหลดไฟล์ไปยัง server
      const uploadRes = await fetch(
        `${import.meta.env.VITE_API_URL}/payment/upload`,
        {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        throw new Error("อัพโหลดไฟล์ไม่สำเร็จ");
      }

      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "อัพโหลดหลักฐานการชำระเงินสำเร็จ",
        confirmButtonText: "ตกลง",
      });
      setShowQRModal(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถอัพโหลดไฟล์ได้",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">แพ็คเกจสำหรับสมาชิก</h1>
        <p className="text-gray-600">เลือกแพ็คเกจที่เหมาะกับคุณ</p>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {packages.map((pkg) => (
          <Col xs={24} sm={24} md={8} key={pkg.id}>
            <Card className="h-full" hoverable loading={loading}>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ฿{pkg.price.toLocaleString()}
                </div>
                <div className="text-gray-600 mb-4">
                  ระยะเวลา {pkg.duration} วัน
                </div>
                {pkg.description && (
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                )}
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => handlePay(pkg)}
                >
                  จ่ายเงิน
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Payment Modal */}
      <Modal
        title="ชำระเงิน"
        open={showQRModal}
        onCancel={() => setShowQRModal(false)}
        footer={null}
      >
        {selectedPackage && (
          <div className="text-center">
            <h3 className="mb-4">สแกน QR Code เพื่อชำระเงิน</h3>
            <div className="mb-4">
              <p>แพ็คเกจ: {selectedPackage.name}</p>
              <p>ราคา: ฿{selectedPackage.price.toLocaleString()}</p>
            </div>
                <div className="mb-4">
              <img src="/qr_code.png" alt="QR Code" style={{ width: 200, height: 200 }} />
                </div>
            <div className="mt-4">
              <p className="mb-2">อัพโหลดหลักฐานการชำระเงิน</p>
              <Upload
                beforeUpload={(file) => {
                  handleUpload(file);
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>อัพโหลดหลักฐาน</Button>
              </Upload>
              </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PackageList;
