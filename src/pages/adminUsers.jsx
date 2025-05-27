import React, { useState, useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  IconButton,
  Switch,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Modal,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import axios from "axios";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import * as XLSX from "xlsx";
const API_URL = import.meta.env.VITE_API_URL;
// Modal แก้ไขข้อมูล
const EditModal = ({ open, onClose, headNurse, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (headNurse) {
      setFormData({
        name: headNurse.name,
        email: headNurse.email,
      });
    }
  }, [headNurse]);

  if (!headNurse) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `${API_URL}/admin/headnurse/${headNurse.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSave();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล"
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          แก้ไขข้อมูล
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="ชื่อ"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="อีเมล"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            margin="normal"
            required
          />
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button onClick={onClose}>ยกเลิก</Button>
            <Button type="submit" variant="contained">
              บันทึก
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

// Modal ต่ออายุ
const RenewModal = ({ open, onClose, headNurse, onSave }) => {
  const [months, setMonths] = useState(6);
  const [error, setError] = useState("");

  if (!headNurse) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${API_URL}/admin/headnurse/${headNurse.id}/renew`,
        { months },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "เกิดข้อผิดพลาดในการต่ออายุ");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          ต่ออายุการใช้งาน
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="number"
            label="จำนวนเดือน"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            margin="normal"
            inputProps={{ min: 1, max: 12 }}
            required
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            วันหมดอายุปัจจุบัน:{" "}
            {format(new Date(headNurse.expiredAt), "PPP", { locale: th })}
          </Typography>
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button onClick={onClose}>ยกเลิก</Button>
            <Button type="submit" variant="contained">
              ต่ออายุ
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

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
  maxWidth: 1100,
  padding: 32,
};

const lightPaper = {
  mb: 2,
  borderRadius: 3,
  boxShadow: 3,
  background: "#f5f6fa",
};
const lightCard = {
  background: "#fff",
  borderRadius: 3,
  boxShadow: 2,
  color: "#23272f",
};

// เพิ่ม style สำหรับ input สีอ่อน
const lightInput = {
  background: "#fff",
  borderRadius: 2,
  border: "1px solid #e0e0e0",
  input: { color: "#23272f" },
};

const AdminUsers = () => {
  const [headNurses, setHeadNurses] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [renewModal, setRenewModal] = useState({ open: false, data: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    totalLogins: 0,
  });

  const fetchHeadNurses = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/admin/headnurses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHeadNurses(Array.isArray(res.data) ? res.data : []);
      // คำนวณสถิติ
      const now = new Date();
      const stats = {
        total: res.data.length,
        active: res.data.filter(
          (n) => n.isActive && new Date(n.expiredAt) > now
        ).length,
        inactive: res.data.filter((n) => !n.isActive).length,
        expired: res.data.filter((n) => new Date(n.expiredAt) <= now).length,
        totalLogins: res.data.reduce((sum, n) => sum + n._count.LoginLog, 0),
      };
      setStats(stats);
    } catch (err) {
      setHeadNurses([]);
      setSnackbar({
        open: true,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchHeadNurses();
  }, []);

  const handleStatusChange = async (id, isActive) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `${API_URL}/admin/headnurse/${id}/status`,
        { isActive },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchHeadNurses();
      setSnackbar({
        open: true,
        message: `อัปเดตสถานะ${isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}เรียบร้อย`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ",
        severity: "error",
      });
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // กรองข้อมูลตาม searchTerm และ statusFilter
  const filteredHeadNurses = Array.isArray(headNurses)
    ? headNurses.filter((nurse) => {
        const matchesSearch =
          nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nurse.email.toLowerCase().includes(searchTerm.toLowerCase());
        const now = new Date();
        const isExpired = new Date(nurse.expiredAt) <= now;
        switch (statusFilter) {
          case "active":
            return matchesSearch && nurse.isActive && !isExpired;
          case "inactive":
            return matchesSearch && !nurse.isActive;
          case "expired":
            return matchesSearch && isExpired;
          default:
            return matchesSearch;
        }
      })
    : [];

  // เรียงลำดับข้อมูล
  const sortedHeadNurses = [...filteredHeadNurses].sort((a, b) => {
    const isAsc = order === "asc";
    if (orderBy === "createdAt" || orderBy === "expiredAt") {
      return isAsc
        ? new Date(a[orderBy]) - new Date(b[orderBy])
        : new Date(b[orderBy]) - new Date(a[orderBy]);
    }
    return isAsc
      ? a[orderBy] > b[orderBy]
        ? 1
        : -1
      : b[orderBy] > a[orderBy]
      ? 1
      : -1;
  });

  // แบ่งหน้า
  const paginatedHeadNurses = sortedHeadNurses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleExportExcel = () => {
    const exportData = filteredHeadNurses.map((nurse) => ({
      ชื่อ: nurse.name,
      อีเมล: nurse.email,
      วันที่สมัคร: format(new Date(nurse.createdAt), "PPP", { locale: th }),
      วันหมดอายุ: format(new Date(nurse.expiredAt), "PPP", { locale: th }),
      สถานะ: nurse.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน",
      "จำนวนครั้งที่ Login": nurse._count.LoginLog,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ผู้ใช้งาน");
    XLSX.writeFile(wb, "headnurses.xlsx");
  };

  // ฟังก์ชัน logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <div style={{ background: "#23272f", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <a href="/admin/dashboard" style={sidebarItem}>
          Dashboard
        </a>
        <a
          href="/admin/users"
          style={{ ...sidebarItem, background: "#23272f" }}
        >
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
        <Box sx={{ p: 3 }}>
          {/* สถิติการใช้งาน */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={lightCard}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    ผู้ใช้งานทั้งหมด
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={lightCard}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    เปิดใช้งาน
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.active}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={lightCard}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    ปิดใช้งาน
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.inactive}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={lightCard}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    หมดอายุ
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.expired}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={lightCard}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    จำนวนครั้งที่ Login
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {stats.totalLogins}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ color: "#23272f", fontWeight: 600 }}>
              จัดการผู้ใช้งาน
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                placeholder="ค้นหาชื่อหรืออีเมล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300, ...lightInput }}
              />
              <FormControl sx={{ minWidth: 150, ...lightInput }}>
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={statusFilter}
                  label="สถานะ"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ background: "#fff", color: "#23272f" }}
                >
                  <MenuItem value="all">ทั้งหมด</MenuItem>
                  <MenuItem value="active">เปิดใช้งาน</MenuItem>
                  <MenuItem value="inactive">ปิดใช้งาน</MenuItem>
                  <MenuItem value="expired">หมดอายุ</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportExcel}
              >
                Export Excel
              </Button>
            </Box>
          </Box>

          <Paper sx={lightPaper}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "name"}
                        direction={orderBy === "name" ? order : "asc"}
                        onClick={() => handleSort("name")}
                      >
                        ชื่อ
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "email"}
                        direction={orderBy === "email" ? order : "asc"}
                        onClick={() => handleSort("email")}
                      >
                        อีเมล
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "createdAt"}
                        direction={orderBy === "createdAt" ? order : "asc"}
                        onClick={() => handleSort("createdAt")}
                      >
                        วันที่สมัคร
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "expiredAt"}
                        direction={orderBy === "expiredAt" ? order : "asc"}
                        onClick={() => handleSort("expiredAt")}
                      >
                        วันหมดอายุ
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "_count.LoginLog"}
                        direction={
                          orderBy === "_count.LoginLog" ? order : "asc"
                        }
                        onClick={() => handleSort("_count.LoginLog")}
                      >
                        จำนวนครั้งที่ Login
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedHeadNurses.map((nurse) => (
                    <TableRow
                      key={nurse.id}
                      sx={{
                        "&:hover": { bgcolor: "action.hover" },
                        bgcolor:
                          new Date(nurse.expiredAt) < new Date()
                            ? "error.lighter"
                            : "inherit",
                      }}
                    >
                      <TableCell>{nurse.name}</TableCell>
                      <TableCell>{nurse.email}</TableCell>
                      <TableCell>
                        {format(new Date(nurse.createdAt), "PPP", {
                          locale: th,
                        })}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {format(new Date(nurse.expiredAt), "PPP", {
                            locale: th,
                          })}
                          {new Date(nurse.expiredAt) < new Date() && (
                            <Chip label="หมดอายุ" color="error" size="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={nurse.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        >
                          <Switch
                            checked={nurse.isActive}
                            onChange={(e) =>
                              handleStatusChange(nurse.id, e.target.checked)
                            }
                            color="primary"
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>{nurse._count.LoginLog}</TableCell>
                      <TableCell>
                        <Tooltip title="แก้ไขข้อมูล">
                          <IconButton
                            onClick={() =>
                              setEditModal({ open: true, data: nurse })
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ต่ออายุ">
                          <IconButton
                            onClick={() =>
                              setRenewModal({ open: true, data: nurse })
                            }
                          >
                            <AccessTimeIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredHeadNurses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="จำนวนแถวต่อหน้า:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} จาก ${count}`
              }
            />
          </Paper>

          <EditModal
            open={editModal.open}
            onClose={() => setEditModal({ open: false, data: null })}
            headNurse={editModal.data}
            onSave={fetchHeadNurses}
          />

          <RenewModal
            open={renewModal.open}
            onClose={() => setRenewModal({ open: false, data: null })}
            headNurse={renewModal.data}
            onSave={fetchHeadNurses}
          />

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </div>
    </div>
  );
};

export default AdminUsers;
