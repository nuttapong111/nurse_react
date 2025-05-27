import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
} from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const PaymentPage = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [referenceId, setReferenceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const navigate = useNavigate();

  // ดึงข้อมูลแพ็คเกจ
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/packages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPackages(res.data);
      } catch (err) {
        console.error("Error fetching packages:", err);
      }
    };
    fetchPackages();
  }, []);

  // ดึงประวัติการชำระเงิน
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/payment/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaymentHistory(res.data);
      } catch (err) {
        console.error("Error fetching payment history:", err);
      }
    };
    fetchPaymentHistory();
  }, []);

  // สร้าง QR Code
  const handleGenerateQR = async (packageId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/payment/generate-qr/${packageId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQrCode(res.data.qrCode);
      setReferenceId(res.data.referenceId);
      setSelectedPackage(res.data);
      setPaymentStatus("PENDING");
      startPaymentCheck(res.data.referenceId);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถสร้าง QR Code ได้",
      });
    } finally {
      setLoading(false);
    }
  };

  // ตรวจสอบสถานะการชำระเงิน
  const startPaymentCheck = (refId) => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/payment/status/${refId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaymentStatus(res.data.status);

        if (res.data.status === "PAID") {
          Swal.fire({
            icon: "success",
            title: "ชำระเงินสำเร็จ",
            text: `แพ็คเกจจะหมดอายุในวันที่ ${new Date(res.data.expiryDate).toLocaleDateString("th-TH")}`,
          });
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      }
    };

    // ตรวจสอบทุก 5 วินาที
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        ต่ออายุแพ็คเกจ
      </Typography>

      {/* แสดงแพ็คเกจที่เลือก */}
      <Dialog open={!!qrCode} onClose={() => setQrCode(null)} maxWidth="sm" fullWidth>
        <DialogTitle>ชำระเงิน</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" p={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedPackage?.packageName}
            </Typography>
            <Typography sx={{ mb: 2 }}>
              จำนวนเงิน: {selectedPackage?.amount.toLocaleString()} บาท
            </Typography>
            <Typography sx={{ mb: 3 }}>
              ระยะเวลา: {selectedPackage?.duration} วัน
            </Typography>
            <img src={qrCode} alt="QR Code" style={{ width: 200, height: 200 }} />
            <Typography sx={{ mt: 2, color: paymentStatus === "PAID" ? "green" : "orange" }}>
              สถานะ: {paymentStatus === "PAID" ? "ชำระเงินสำเร็จ" : "รอการชำระเงิน"}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* แสดงแพ็คเกจทั้งหมด */}
      <Grid container spacing={3}>
        {packages.map((pkg) => (
          <Grid item xs={12} md={6} key={pkg.id}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {pkg.name}
              </Typography>
              <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
                {pkg.price.toLocaleString()} บาท
              </Typography>
              <Typography sx={{ mb: 2 }}>
                ระยะเวลา: {pkg.duration} วัน
              </Typography>
              <Typography sx={{ mb: 3, flexGrow: 1 }}>
                {pkg.description}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleGenerateQR(pkg.id)}
                disabled={loading}
              >
                {loading ? "กำลังสร้าง QR Code..." : "ชำระเงิน"}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ประวัติการชำระเงิน */}
      <Typography variant="h5" sx={{ mt: 6, mb: 3 }}>
        ประวัติการชำระเงิน
      </Typography>
      <Grid container spacing={2}>
        {paymentHistory.map((payment) => (
          <Grid item xs={12} key={payment.id}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1">
                    {payment.package.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(payment.createdAt).toLocaleDateString("th-TH")}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="primary">
                    {payment.amount.toLocaleString()} บาท
                  </Typography>
                  <Typography
                    variant="body2"
                    color={payment.status === "PAID" ? "success.main" : "warning.main"}
                  >
                    {payment.status === "PAID" ? "ชำระเงินสำเร็จ" : "รอการชำระเงิน"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PaymentPage; 