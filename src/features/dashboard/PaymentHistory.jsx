import React, { useState, useEffect } from 'react';
import { Table, Tag, Image, Button, Upload, Modal, Card, Row, Col, Divider } from 'antd';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import Swal from 'sweetalert2';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [proofHistory, setProofHistory] = useState([]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      console.log({data});
      setPayments(data);
    } catch (error) {
      // ไม่แสดงแจ้งเตือนในกรณีที่หาข้อมูลไม่เจอ
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PAID':
        return 'ชำระเงินแล้ว';
      case 'PENDING':
        return 'รอชำระเงิน';
      case 'FAILED':
        return 'ชำระเงินไม่สำเร็จ';
      case 'REJECTED':
        return 'ถูกปฏิเสธ';
      default:
        return status;
    }
  };

  const handleUpload = async (file, referenceId) => {
    setUploadingId(referenceId);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('referenceId', referenceId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/payment/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'อัพโหลดสำเร็จ', text: 'ส่งหลักฐานใหม่เรียบร้อยแล้ว' });
        fetchPayments();
      } else {
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'อัพโหลดไม่สำเร็จ' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'อัพโหลดไม่สำเร็จ' });
    } finally {
      setUploadingId(null);
    }
  };

  const openPreviewModal = (payment) => {
    setSelectedPayment(payment);
    setProofHistory(payment.proofImage || []);
    setPreviewVisible(true);
  };

  const getProofImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    let apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl.endsWith("/api")) apiUrl = apiUrl.slice(0, -4);
    if (url.startsWith("/uploads")) return apiUrl + url;
    return apiUrl + "/uploads/" + url;
  };

  const columns = [
    {
      title: 'วันที่',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => format(new Date(date), 'PPP', { locale: th }),
    },
    {
      title: 'แพ็คเกจ',
      dataIndex: ['package', 'name'],
      key: 'packageName',
    },
    {
      title: 'จำนวนเงิน',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `฿${amount.toLocaleString()}`,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'หลักฐานการชำระเงิน',
      dataIndex: 'proofImage',
      key: 'proofImage',
      render: (proofImageArr, record) => (
        <Button type="link" onClick={() => openPreviewModal(record)}>
          ดูหลักฐาน
        </Button>
      ),
    },
    {
      title: 'อ้างอิง',
      dataIndex: 'referenceId',
      key: 'referenceId',
    },
    // {
    //   title: 'เหตุผลที่ถูกปฏิเสธ',
    //   key: 'rejectReason',
    //   render: (_, record) =>
    //     record.status === 'REJECTED'
    //       ? (record.rejectReason || 'ไม่ระบุเหตุผล')
    //       : null,
    // },
    {
      title: 'อัพโหลดใหม่',
      key: 'upload',
      render: (_, record) =>
        record.status === 'REJECTED' ? (
          <Upload
            showUploadList={false}
            customRequest={({ file }) => handleUpload(file, record.referenceId)}
            disabled={uploadingId === record.referenceId}
          >
            <Button loading={uploadingId === record.referenceId} type="primary">อัพโหลดหลักฐานใหม่</Button>
          </Upload>
        ) : null,
    },
  ];

  return (
    <div className="p-6" style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 24 }}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">ประวัติการชำระเงิน</h1>
      </div>

      <Table
        columns={columns}
        dataSource={payments}
        loading={loading}
        rowKey="id"
        locale={{
          emptyText: 'ไม่พบประวัติการชำระเงิน'
        }}
      />

      <Modal
        title="ประวัติการอัพโหลดหลักฐาน"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {selectedPayment && (
          <div>
            <Card bordered={false} style={{ background: '#f6f8fa', marginBottom: 16 }}>
              <Row gutter={[16, 8]}>
                <Col span={12}><b>แพ็คเกจ:</b> {selectedPayment.package.name}</Col>
                <Col span={12}><b>จำนวนเงิน:</b> ฿{selectedPayment.amount.toLocaleString()}</Col>
              </Row>
              <Row gutter={[16, 8]}>
                <Col span={12}><b>วันที่:</b> {new Date(selectedPayment.createdAt).toLocaleDateString("th-TH")}</Col>
                <Col span={12}><b>สถานะ:</b> {getStatusText(selectedPayment.status)}</Col>
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
                      <img
                        src={getProofImageUrl(proof.imageUrl)}
                        alt="หลักฐานการชำระเงิน"
                        style={{ width: '160px', borderRadius: 6, border: '1px solid #eee', marginTop: 4 }}
                        onClick={() => window.open(getProofImageUrl(proof.imageUrl), '_blank')}
                      />
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
    </div>
  );
};

export default PaymentHistory; 