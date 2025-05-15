// scheduleGenerator.js
import dayjs from 'dayjs';

// ฟังก์ชันสำหรับสร้างตารางเวรอัตโนมัติ
export const generateSchedule = async (wardId, year, month, constraints) => {
  const {
    staffList, // รายชื่อพนักงานทั้งหมด
    leaveDates, // วันหยุดที่ขอ
    shiftRules, // กฎการจัดเวร (จำนวนคนต่อกะ)
    maxConsecutiveShifts, // จำนวนเวรติดต่อกันสูงสุด
    maxNightShifts, // จำนวนเวรดึกติดต่อกันสูงสุด
    priority // ลำดับความสำคัญของเงื่อนไข
  } = constraints;

  // สร้างรายการวันที่ในเดือนที่เลือก
  const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();
  const dates = Array.from({ length: daysInMonth }, (_, i) => 
    dayjs(`${year}-${month}-${i + 1}`).format('YYYY-MM-DD')
  );

  // สร้างตารางเวรเริ่มต้น
  let schedule = {};
  dates.forEach(date => {
    schedule[date] = {
      morning: [],
      evening: [],
      night: []
    };
  });

  // ฟังก์ชันตรวจสอบความถูกต้องของตารางเวร
  const isValidSchedule = (schedule) => {
    // ตรวจสอบจำนวนคนต่อกะ
    for (const date in schedule) {
      for (const shift of ['morning', 'evening', 'night']) {
        if (schedule[date][shift].length !== shiftRules[shift]) {
          return false;
        }
      }
    }

    // ตรวจสอบเวรติดต่อกัน
    for (const staff of staffList) {
      let consecutiveShifts = 0;
      let consecutiveNightShifts = 0;
      
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const hasShift = ['morning', 'evening', 'night'].some(
          shift => schedule[date][shift].includes(staff.id)
        );
        const hasNightShift = schedule[date].night.includes(staff.id);

        if (hasShift) {
          consecutiveShifts++;
          if (hasNightShift) consecutiveNightShifts++;
        } else {
          consecutiveShifts = 0;
          consecutiveNightShifts = 0;
        }

        if (consecutiveShifts > maxConsecutiveShifts || 
            consecutiveNightShifts > maxNightShifts) {
          return false;
        }
      }
    }

    // ตรวจสอบวันหยุด
    for (const leave of leaveDates) {
      if (schedule[leave.date][leave.shift].includes(leave.staffId)) {
        return false;
      }
    }

    return true;
  };

  // ฟังก์ชันจัดตารางเวรแบบ Backtracking
  const backtrack = (dateIndex, staffIndex) => {
    if (dateIndex === dates.length) {
      return isValidSchedule(schedule);
    }

    const date = dates[dateIndex];
    const staff = staffList[staffIndex];

    // ข้ามถ้าเป็นวันหยุด
    if (leaveDates.some(leave => 
      leave.date === date && leave.staffId === staff.id
    )) {
      return backtrack(dateIndex, staffIndex + 1);
    }

    // ลองจัดเวรทุกกะ
    for (const shift of ['morning', 'evening', 'night']) {
      if (schedule[date][shift].length < shiftRules[shift]) {
        schedule[date][shift].push(staff.id);
        
        if (backtrack(
          staffIndex === staffList.length - 1 ? dateIndex + 1 : dateIndex,
          staffIndex === staffList.length - 1 ? 0 : staffIndex + 1
        )) {
          return true;
        }

        schedule[date][shift].pop();
      }
    }

    return false;
  };

  // เริ่มการจัดตารางเวร
  if (backtrack(0, 0)) {
    return schedule;
  }

  // ถ้าไม่สามารถจัดได้ตามเงื่อนไขทั้งหมด ให้จัดตามลำดับความสำคัญ
  const relaxedSchedule = {};
  dates.forEach(date => {
    relaxedSchedule[date] = {
      morning: [],
      evening: [],
      night: []
    };
  });

  // จัดตามลำดับความสำคัญ
  for (const priority of constraints.priority) {
    switch (priority) {
      case 'leave_dates':
        // จัดให้คนที่ขอวันหยุดไม่ต้องขึ้นเวรในวันนั้น
        for (const leave of leaveDates) {
          if (relaxedSchedule[leave.date][leave.shift].includes(leave.staffId)) {
            relaxedSchedule[leave.date][leave.shift] = relaxedSchedule[leave.date][leave.shift]
              .filter(id => id !== leave.staffId);
          }
        }
        break;

      case 'consecutive_shifts':
        // จัดเวรติดต่อกันไม่เกินที่กำหนด
        for (const staff of staffList) {
          let consecutiveShifts = 0;
          for (let i = 0; i < dates.length; i++) {
            const date = dates[i];
            const hasShift = ['morning', 'evening', 'night'].some(
              shift => relaxedSchedule[date][shift].includes(staff.id)
            );

            if (hasShift) {
              consecutiveShifts++;
              if (consecutiveShifts > maxConsecutiveShifts) {
                // ลบเวรที่เกินออก
                const shift = ['morning', 'evening', 'night'].find(
                  s => relaxedSchedule[date][s].includes(staff.id)
                );
                if (shift) {
                  relaxedSchedule[date][shift] = relaxedSchedule[date][shift]
                    .filter(id => id !== staff.id);
                }
                consecutiveShifts = 0;
              }
            } else {
              consecutiveShifts = 0;
            }
          }
        }
        break;

      case 'consecutive_night_shifts':
        // จัดเวรดึกติดต่อกันไม่เกินที่กำหนด
        for (const staff of staffList) {
          let consecutiveNightShifts = 0;
          for (let i = 0; i < dates.length; i++) {
            const date = dates[i];
            const hasNightShift = relaxedSchedule[date].night.includes(staff.id);

            if (hasNightShift) {
              consecutiveNightShifts++;
              if (consecutiveNightShifts > maxNightShifts) {
                // ลบเวรดึกที่เกินออก
                relaxedSchedule[date].night = relaxedSchedule[date].night
                  .filter(id => id !== staff.id);
                consecutiveNightShifts = 0;
              }
            } else {
              consecutiveNightShifts = 0;
            }
          }
        }
        break;

      case 'shift_rules':
        // จัดจำนวนคนต่อกะตามที่กำหนด
        for (const date in relaxedSchedule) {
          for (const shift of ['morning', 'evening', 'night']) {
            while (relaxedSchedule[date][shift].length > shiftRules[shift]) {
              relaxedSchedule[date][shift].pop();
            }
            while (relaxedSchedule[date][shift].length < shiftRules[shift]) {
              // หาคนที่ว่างในวันนั้น
              const availableStaff = staffList.find(staff => 
                !['morning', 'evening', 'night'].some(s => 
                  relaxedSchedule[date][s].includes(staff.id)
                )
              );
              if (availableStaff) {
                relaxedSchedule[date][shift].push(availableStaff.id);
              } else {
                break;
              }
            }
          }
        }
        break;
    }
  }

  return relaxedSchedule;
}; 