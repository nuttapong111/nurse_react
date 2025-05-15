// schedule.js
import axios from 'axios';
import { generateSchedule } from '../utils/scheduleGenerator';

const API_URL = import.meta.env.VITE_API_URL;

// // ฟังก์ชันสำหรับดึงข้อมูลที่จำเป็นสำหรับการจัดตารางเวร
// const fetchScheduleData = async (wardId, year, month) => {
//   try {
//     // ดึงข้อมูลพนักงานในวอร์ด
//     const staffResponse = await axios.get(
//       `${API_URL}/users/ward/${wardId}`,
//       {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       }
//     );

//     // ดึงข้อมูลวันหยุด
//     const leaveResponse = await axios.get(
//       `${API_URL}/schedule/off-requests/${wardId}/${year}/${month}`,
//       {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       }
//     );

//     // ดึงข้อมูลกฎการจัดเวร
//     const ruleResponse = await axios.get(
//       `${API_URL}/schedule/shift-rule/${wardId}/${year}/${month}`,
//       {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       }
//     );

//     // ดึงข้อมูลลำดับความสำคัญ
//     const priorityResponse = await axios.get(
//       `${API_URL}/schedule/priority/${wardId}/${year}/${month}`,
//       {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       }
//     );

//     return {
//       staffList: staffResponse.data,
//       leaveDates: leaveResponse.data,
//       shiftRules: ruleResponse.data.staffPerShift,
//       maxConsecutiveShifts: ruleResponse.data.maxConsecutiveShifts,
//       maxNightShifts: ruleResponse.data.maxNightShifts,
//       priority: priorityResponse.data.criteriaOrder
//     };
//   } catch (error) {
//     console.error('Error fetching schedule data:', error);
//     throw error;
//   }
// };

// // ฟังก์ชันสำหรับบันทึกตารางเวร
// const saveSchedule = async (wardId, year, month, schedule) => {
//   try {
//     await axios.post(
//       `${API_URL}/schedule/save`,
//       {
//         wardId,
//         year,
//         month,
//         schedule
//       },
//       {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       }
//     );
//   } catch (error) {
//     console.error('Error saving schedule:', error);
//     throw error;
//   }
// };

// ฟังก์ชันหลักสำหรับจัดตารางเวรอัตโนมัติ (ใหม่: ให้ backend เป็นคน generate)
export const autoGenerateSchedule = (wardId, year, month) => {
  return axiospost(`${API_URL}/schedule/auto-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ wardId, year, month })
  }).then(res => res.json());
}; 