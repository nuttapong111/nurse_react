import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Box,
  InputLabel,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/th";
import Swal from "sweetalert2";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

// สร้าง options เดือน/ปี
const generateMonthYearOptions = () => {
  const start = dayjs("2025-04-01");
  const end = dayjs().add(1, "month").startOf("month");
  const options = [];
  let current = start;
  while (current.isSameOrBefore(end, "month")) {
    options.push({
      month: current.month() + 1,
      year: current.year(),
      label: `${current.locale('th').format('MMMM')} ${current.year() + 543}`,
    });
    current = current.add(1, "month");
  }
  return options;
};

const monthYearOptions = generateMonthYearOptions();
const yearOptions = [...new Set(monthYearOptions.map(opt => opt.year))];
const latest = monthYearOptions[monthYearOptions.length - 1];

const ManageShiftConfig = () => {
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState("");
  const [shiftsPerDay, setShiftsPerDay] = useState(3);
  const [shiftNames, setShiftNames] = useState(["เช้า", "บ่าย", "ดึก"]);
  const [shiftTimes, setShiftTimes] = useState([
    { start: "07:00", end: "15:00" },
    { start: "15:00", end: "23:00" },
    { start: "23:00", end: "07:00" },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(latest.month);
  const [selectedYear, setSelectedYear] = useState(latest.year);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const socketRef = React.useRef(null);

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/schedule/myward`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWards(res.data);
        if (res.data.length > 0) setSelectedWard(res.data[0].id);
      } catch {
        setWards([]);
      }
    };
    fetchWards();
  }, []);

  useEffect(() => {
    if (!selectedWard || !selectedMonth || !selectedYear) return;
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/setting/shift-rule/config?wardId=${selectedWard}&month=${selectedMonth}&year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          setShiftsPerDay(res.data.shiftsPerDay);
          setShiftNames(res.data.shiftNames);
          setShiftTimes(res.data.shiftTimes || Array(res.data.shiftNames?.length || 3).fill({ start: "", end: "" }));
        } else {
          setShiftsPerDay(3);
          setShiftNames(["เช้า", "บ่าย", "ดึก"]);
          setShiftTimes([
            { start: "07:00", end: "15:00" },
            { start: "15:00", end: "23:00" },
            { start: "23:00", end: "07:00" },
          ]);
        }
      } catch {
        setShiftsPerDay(3);
        setShiftNames(["เช้า", "บ่าย", "ดึก"]);
        setShiftTimes([
          { start: "07:00", end: "15:00" },
          { start: "15:00", end: "23:00" },
          { start: "23:00", end: "07:00" },
        ]);
      }
    };
    fetchConfig();
  }, [selectedWard, selectedMonth, selectedYear]);

  const handleShiftsPerDayChange = (e) => {
    const n = Number(e.target.value);
    setShiftsPerDay(n);
    setShiftNames((prev) => {
      if (n > prev.length) {
        return [...prev, ...Array(n - prev.length).fill("")];
      } else {
        return prev.slice(0, n);
      }
    });
    setShiftTimes((prev) => {
      if (n > prev.length) {
        return [...prev, ...Array(n - prev.length).fill({ start: "", end: "" })];
      } else {
        return prev.slice(0, n);
      }
    });
  };

  const handleShiftNameChange = (idx, value) => {
    setShiftNames((prev) => prev.map((name, i) => (i === idx ? value : name)));
  };

  const handleShiftTimeChange = (idx, field, value) => {
    setShiftTimes((prev) => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const handleSave = async () => {
    if (!selectedWard) {
      Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'กรุณาเลือกวอร์ด' });
      return;
    }
    if (shiftNames.some((n) => !n.trim())) {
      Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'กรุณากรอกชื่อเวรให้ครบทุกช่อง' });
      return;
    }
    if (shiftTimes.some((t) => !t.start || !t.end)) {
      Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'กรุณากรอกเวลาเริ่มต้น/สิ้นสุดให้ครบทุกเวร' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const year = selectedYear;
      const month = selectedMonth;
      const shiftsPerDayObj = {};
      shiftNames.forEach((name) => {
        shiftsPerDayObj[name] = 1;
      });
      const staffPerShiftObj = {};
      shiftNames.forEach((name) => {
        staffPerShiftObj[name] = { nurse: 0, assistant: 0 };
      });

      await axios.post(`${API_URL}/setting/shift-rule`, {
        wardId: selectedWard,
        year,
        month,
        workingDates: [],
        shiftsPerDay: shiftsPerDayObj,
        staffPerShift: staffPerShiftObj,
        shiftNames,
        shiftTimes,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({ icon: 'success', title: 'สำเร็จ', text: 'บันทึกสำเร็จ' });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึก",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerateSchedule = async () => {
    setProgressOpen(true);
    setProgressValue(0);
    setProgressMsg("กำลังสร้างตารางเวร...");
    if (!socketRef.current) {
      socketRef.current = io(API_URL.replace("/api", ""), { transports: ["websocket"] });
    }
    const socket = socketRef.current;
    socket.on("schedule-progress", (percent) => {
      setProgressValue(percent);
      setProgressMsg(`สร้างตารางเวร ${percent}%`);
      if (percent >= 100) {
        setTimeout(() => setProgressOpen(false), 1000);
      }
    });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/schedule/auto-generate`, {
        wardId: selectedWard,
        year: selectedYear,
        month: selectedMonth,
        socketId: socket.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgressMsg("สร้างตารางเวรสำเร็จ");
      setTimeout(() => setProgressOpen(false), 1000);
    } catch (err) {
      setProgressMsg("เกิดข้อผิดพลาดในการสร้างตารางเวร");
      setTimeout(() => setProgressOpen(false), 2000);
    }
  };

  return (
    <Card sx={{
      background: '#fff',
      borderRadius: 4,
      boxShadow: '0 2px 16px #e3e3e3',
      color: '#23272f',
      maxWidth: 480,
      margin: '48px auto',
      padding: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', mb: 0 }}>
        ตั้งค่าเวร
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 500, color: '#1976d2', mb: 3 }}>
        (Manage Shifts)
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>เลือกวอร์ด</InputLabel>
        <Select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          size="medium"
          label="เลือกวอร์ด"
        >
          {wards.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Dropdown เดือน/ปี */}
      <Box sx={{ display: 'flex', gap: 2, width: '100%', mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>เดือน</InputLabel>
          <Select
            value={selectedMonth}
            label="เดือน"
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {monthYearOptions.filter(opt => opt.year === selectedYear).map(opt => (
              <MenuItem key={opt.month} value={opt.month}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>ปี</InputLabel>
          <Select
            value={selectedYear}
            label="ปี"
            onChange={e => setSelectedYear(e.target.value)}
          >
            {yearOptions.map(y => (
              <MenuItem key={y} value={y}>{y + 543}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TextField
        select
        fullWidth
        label="จำนวนเวร/วัน"
        value={shiftsPerDay}
        onChange={handleShiftsPerDayChange}
        sx={{ mb: 3 }}
      >
        {[1, 2, 3, 4].map((n) => (
          <MenuItem key={n} value={n}>
            {n} เวร
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {shiftNames.map((name, idx) => (
          <Box key={idx} sx={{ width: '100%', mb: 2, border: '1px solid #eee', borderRadius: 2, p: 2 }}>
            <TextField
              label={`ชื่อเวรที่ ${idx + 1}`}
              value={name}
              onChange={(e) => handleShiftNameChange(idx, e.target.value)}
              fullWidth
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="เวลาเริ่มต้น"
                type="time"
                value={shiftTimes[idx]?.start || ""}
                onChange={(e) => handleShiftTimeChange(idx, "start", e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="เวลาสิ้นสุด"
                type="time"
                value={shiftTimes[idx]?.end || ""}
                onChange={(e) => handleShiftTimeChange(idx, "end", e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        ))}
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSave}
        disabled={loading}
        sx={{ fontWeight: 600, fontSize: 16, borderRadius: 2, py: 1.5 }}
      >
        {loading ? "กำลังบันทึก..." : "บันทึก"}
      </Button>

      {/* <Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={handleAutoGenerateSchedule}
        sx={{ fontWeight: 600, fontSize: 16, borderRadius: 2, py: 1.5, mt: 2 }}
      >
        สร้างตารางเวรอัตโนมัติ
      </Button> */}

      <Dialog open={progressOpen} onClose={() => {}} maxWidth="xs">
        <DialogTitle>กำลังสร้างตารางเวร</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={2}>
            <CircularProgress variant="determinate" value={progressValue} size={80} thickness={5} />
            <Box mt={2} fontSize={18}>{progressMsg}</Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ManageShiftConfig;
 