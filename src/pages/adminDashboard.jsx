import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
const API_URL = import.meta.env.VITE_API_URL;

const darkCard = {
  background: "#23272f",
  borderRadius: 16,
  padding: "24px 18px",
  color: "#fff",
  marginBottom: 32,
  marginTop: 32,
};

const tabStyle = (active) => ({
  background: active ? "#353942" : "transparent",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "6px 18px",
  marginRight: 8,
  fontWeight: 600,
  cursor: "pointer",
});

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
  maxWidth: 700,
  padding: 32,
};

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [usageTab, setUsageTab] = useState("weekly");
  const [registerTab, setRegisterTab] = useState("weekly");
  const [usageData, setUsageData] = useState([]);
  const [registerData, setRegisterData] = useState([]);
  const [paymentTab, setPaymentTab] = useState("weekly");
  const [paymentData, setPaymentData] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/summary`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
        setSummary(res.data);
      } catch (err) {
        setSummary(null);
      }
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(
          `${API_URL}/admin/usage-stats?type=${usageTab}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsageData(res.data);
      } catch (err) {
        setUsageData([]);
        if (err.response && err.response.status === 401) {
          alert("Session หมดอายุ กรุณา login ใหม่");
          window.location.href = "/admin/login";
        }
      }
    };
    fetchUsage();
  }, [usageTab]);

  useEffect(() => {
    const fetchRegister = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(
          `${API_URL}/admin/register-stats?type=${registerTab}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRegisterData(res.data);
      } catch (err) {
        setRegisterData([]);
        if (err.response && err.response.status === 401) {
          alert("Session หมดอายุ กรุณา login ใหม่");
          window.location.href = "/admin/login";
        }
      }
    };
    fetchRegister();
  }, [registerTab]);

  useEffect(() => {
    const fetchPaymentStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(
          `${API_URL}/admin/payment-stats?type=${paymentTab}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPaymentData(res.data);
      } catch (err) {
        setPaymentData([]);
      }
    };
    fetchPaymentStats();
  }, [paymentTab]);

  // ฟังก์ชัน logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  // ก่อน render กราฟ paymentData ให้ map เป็น { name, value }
  const paymentGraphData = paymentData.map(item => ({
    name: item.label,
    value: Number(item.sum)
  }));

  return (
    <div>
      {/* Sidebar */}
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
      {/* Main Content */}
      <div style={contentStyle}>
        <div
          style={{
            background: "#23272f",
            borderRadius: 16,
            padding: "32px 24px",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            marginTop: 32,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 500, marginBottom: 8 }}>
            Total Users
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: 2 }}>
            {summary ? summary.totalHeadNurse.toLocaleString() : "—"}
          </div>
        </div>
        {/* Usage Graph */}
        <div style={darkCard}>
          <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
            Usage
          </div>
          <div style={{ marginBottom: 16 }}>
            <button
              style={tabStyle(usageTab === "weekly")}
              onClick={() => setUsageTab("weekly")}
            >
              Weekly
            </button>
            <button
              style={tabStyle(usageTab === "monthly")}
              onClick={() => setUsageTab("monthly")}
            >
              Monthly
            </button>
            <button
              style={tabStyle(usageTab === "yearly")}
              onClick={() => setUsageTab("yearly")}
            >
              Yearly
            </button>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={usageData}>
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4f8cff"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* New Users Graph */}
        <div style={darkCard}>
          <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
            New Users
          </div>
          <div style={{ marginBottom: 16 }}>
            <button
              style={tabStyle(registerTab === "weekly")}
              onClick={() => setRegisterTab("weekly")}
            >
              Weekly
            </button>
            <button
              style={tabStyle(registerTab === "monthly")}
              onClick={() => setRegisterTab("monthly")}
            >
              Monthly
            </button>
            <button
              style={tabStyle(registerTab === "yearly")}
              onClick={() => setRegisterTab("yearly")}
            >
              Yearly
            </button>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={registerData}>
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4f8cff"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Payment Graph */}
        <div style={darkCard}>
          <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
            ยอดเงินที่อนุมัติแล้ว
          </div>
          <div style={{ marginBottom: 16 }}>
            <button style={tabStyle(paymentTab === "weekly")} onClick={() => setPaymentTab("weekly")}>สัปดาห์</button>
            <button style={tabStyle(paymentTab === "monthly")} onClick={() => setPaymentTab("monthly")}>เดือน</button>
            <button style={tabStyle(paymentTab === "yearly")} onClick={() => setPaymentTab("yearly")}>ปี</button>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={paymentGraphData}>
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4f8cff"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
