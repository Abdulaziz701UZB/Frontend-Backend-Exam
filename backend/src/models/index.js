import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

import courseModel from "./courseModel.js";
import teacherModel from "./teacherModel.js";
import groupModel from "./groupModel.js";
import studentModel from "./studentModel.js";
import attendanceModel from "./attendanceModel.js";
import paymentModel from "./paymentModel.js";
import examModel from "./examModel.js";
import homeworkModel from "./homeworkModel.js";
import certificateModel from "./certificateModel.js";
import roomModel from "./roomModel.js";
import leadModel from "./leadModel.js";

export const Course = courseModel(sequelize, DataTypes);
export const Teacher = teacherModel(sequelize, DataTypes);
export const Group = groupModel(sequelize, DataTypes);
export const Student = studentModel(sequelize, DataTypes);
export const Attendance = attendanceModel(sequelize, DataTypes);
export const Payment = paymentModel(sequelize, DataTypes);
export const Exam = examModel(sequelize, DataTypes);
export const Homework = homeworkModel(sequelize, DataTypes);
export const Certificate = certificateModel(sequelize, DataTypes);
export const Room = roomModel(sequelize, DataTypes);
export const Lead = leadModel(sequelize, DataTypes);
export { sequelize };

Group.belongsTo(Course, { foreignKey: "course_id", as: "course" });
Group.belongsTo(Teacher, { foreignKey: "teacher_id", as: "teacher" });
Student.belongsTo(Group, { foreignKey: "group_id", as: "group" });
Attendance.belongsTo(Student, { foreignKey: "student_id", as: "student" });
Attendance.belongsTo(Group, { foreignKey: "group_id", as: "group" });
Payment.belongsTo(Student, { foreignKey: "student_id", as: "student" });

export default {
  sequelize,
  Course,
  Teacher,
  Group,
  Student,
  Attendance,
  Payment,
  Exam,
  Homework,
  Certificate,
  Room,
  Lead,
};
