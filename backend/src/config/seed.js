import models from "../models/index.js";

const {
  sequelize,
  Course,
  Teacher,
  Group,
  Student,
  Payment,
  Attendance,
  Exam,
  Homework,
  Certificate,
  Room,
  Lead,
} = models;

export const syncSequences = async () => {
  try {
    const tables = ["students", "teachers", "courses", "attendance"];
    for (const t of tables) {
      await sequelize.query(
        `SELECT setval(pg_get_serial_sequence('${t}', 'id'), COALESCE((SELECT MAX(id) FROM ${t}), 1));`
      );
    }
  } catch (err) {
    console.error("Sequence sync error:", err.message);
  }
};

export const seedDatabase = async () => {
  try {
    const courseCount = await Course.count();
    if (courseCount === 0) {
      await Course.bulkCreate([
        { id: 1, name: "Frontend ReactJS", duration: "6 oy", price: 850000 },
        { id: 2, name: "Python Backend (Django)", duration: "6 oy", price: 900000 },
        { id: 3, name: "General English (IELTS)", duration: "8 oy", price: 750000 },
        { id: 4, name: "Grafik Dizayn & UI/UX", duration: "4 oy", price: 800000 },
        { id: 5, name: "Flutter Mobile Development", duration: "6 oy", price: 950000 },
        { id: 6, name: "Cybersecurity & Pentesting", duration: "5 oy", price: 1100000 },
      ]);
    }

    const teacherCount = await Teacher.count();
    if (teacherCount === 0) {
      await Teacher.bulkCreate([
        {
          id: 101,
          name: "Abdulaziz Abdulhayev",
          phone: "+998 90 599 06 00",
          subject: "Frontend ReactJS",
          salary: 12000000,
          experience: "5 yil",
          avatar: "teacher",
        },
        {
          id: 102,
          name: "Sardor Rahimov",
          phone: "+998 90 599 06 00",
          subject: "Frontend Mentori",
          salary: 9000000,
          experience: "3 yil",
          avatar: "teacher",
        },
        {
          id: 103,
          name: "Azizbek Murodov",
          phone: "+998 90 599 06 00",
          subject: "Python Backend",
          salary: 11000000,
          experience: "4 yil",
          avatar: "teacher",
        },
      ]);
    }

    const groupCount = await Group.count();
    if (groupCount === 0) {
      await Group.bulkCreate([
        {
          id: "G-101",
          course_id: 1,
          course_name: "Frontend ReactJS",
          name: "F-12 Guruh",
          teacher_id: 101,
          teacher_name: "Abdulaziz Abdulhayev",
          room: "201-xona (Kompyuter zali)",
          schedule_days: "Dushanba - Chorshanba - Juma",
          schedule_time: "14:00 - 16:00",
          monthly_fee: 850000,
          status: "Active",
          start_date: "2026-02-01",
        },
        {
          id: "G-102",
          course_id: 2,
          course_name: "Python Backend (Django)",
          name: "P-04 Guruh",
          teacher_id: 103,
          teacher_name: "Azizbek Murodov",
          room: "203-xona (Backend Lab)",
          schedule_days: "Seshanba - Payshanba - Shanba",
          schedule_time: "16:30 - 18:30",
          monthly_fee: 900000,
          status: "Active",
          start_date: "2026-03-01",
        },
      ]);
    }

    const studentCount = await Student.count();
    if (studentCount === 0) {
      await Student.bulkCreate([
        {
          id: 1,
          full_name: "Abdulaziz Abdulhayev",
          phone: "+998 90 599 06 00",
          parent_phone: "+998 90 599 06 00",
          group_id: "G-101",
          group_name: "F-12 Guruh (ReactJS)",
          join_date: "2026-02-01",
          payment_status: "Paid",
          balance: 0,
          status: "Active",
        },
        {
          id: 2,
          full_name: "Diyorbek Toshmatov",
          phone: "+998 90 599 06 00",
          parent_phone: "+998 90 599 06 00",
          group_id: "G-102",
          group_name: "P-04 Guruh (Python)",
          join_date: "2026-03-01",
          payment_status: "Overdue",
          balance: -900000,
          status: "Active",
        },
      ]);
    }

    const paymentCount = await Payment.count();
    if (paymentCount === 0) {
      await Payment.bulkCreate([
        {
          id: "PAY-1001",
          student_id: 1,
          student_name: "Abdulaziz Abdulhayev",
          group_name: "F-12 Guruh (ReactJS)",
          amount: 850000,
          month: "Avgust 2026",
          payment_method: "Card (Click)",
          date: "2026-08-02",
          recorded_by: "Admin",
        },
      ]);
    }

    const attendanceCount = await Attendance.count();
    if (attendanceCount === 0) {
      await Attendance.bulkCreate([
        {
          group_id: "G-101",
          student_id: 1,
          date: "2026-08-10",
          status: "Present",
          note: "",
          reason_category: "",
        },
      ]);
    }

    const examCount = await Exam.count();
    if (examCount === 0) {
      await Exam.bulkCreate([
        {
          id: "EX-101",
          group_name: "F-12 Guruh (ReactJS)",
          title: "React State & Hooks Oraliq Imtihon",
          date: "2026-08-15",
          total_score: 100,
          max_passing_score: 70,
          status: "Upcoming",
        },
      ]);
    }

    const hwCount = await Homework.count();
    if (hwCount === 0) {
      await Homework.bulkCreate([
        {
          id: "HW-1",
          group_name: "F-12 Guruh (ReactJS)",
          title: "Custom Hooks & Redux Toolkit App",
          deadline: "2026-08-16",
          total_submitted: 1,
          status: "Active",
        },
      ]);
    }

    const certCount = await Certificate.count();
    if (certCount === 0) {
      await Certificate.bulkCreate([
        {
          id: "CERT-8801",
          student_name: "Abdulaziz Abdulhayev",
          course_name: "Frontend ReactJS",
          issue_date: "2026-08-01",
          qr_code: "QR-8801-VERIFIED",
          grade: "A+ (98%)",
        },
      ]);
    }

    const roomCount = await Room.count();
    if (roomCount === 0) {
      await Room.bulkCreate([
        {
          id: "R-201",
          name: "201-xona (Kompyuter Zali)",
          capacity: 20,
          computers_count: 20,
          projector: "Mavjud",
          status: "Active",
        },
      ]);
    }

    const leadCount = await Lead.count();
    if (leadCount === 0) {
      await Lead.bulkCreate([
        {
          id: "L-501",
          name: "Jasurbek Rustamov",
          phone: "+998 90 599 06 00",
          interested_course: "Frontend ReactJS",
          source: "Instagram Ads",
          status: "Yangi",
        },
      ]);
    }

    await syncSequences();
  } catch (err) {
    console.error("Seed error:", err.message);
  }
};
