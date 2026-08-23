import { Router } from 'express';
import groupRoute from './groupRoute.js';
import studentRoute from './studentRoute.js';
import teacherRoute from './teacherRoute.js';
import courseRoute from './courseRoute.js';
import paymentRoute from './paymentRoute.js';
import attendanceRoute from './attendanceRoute.js';
import examRoute from './examRoute.js';
import homeworkRoute from './homeworkRoute.js';
import certificateRoute from './certificateRoute.js';
import roomRoute from './roomRoute.js';
import leadRoute from './leadRoute.js';
import reviewRoutes from './reviewRoutes.js';
import trialLessonRoutes from './trialLessonRoutes.js';

const router = Router();

router.use(groupRoute);
router.use(studentRoute);
router.use(teacherRoute);
router.use(courseRoute);
router.use(paymentRoute);
router.use(attendanceRoute);
router.use(examRoute);
router.use(homeworkRoute);
router.use(certificateRoute);
router.use(roomRoute);
router.use(leadRoute);
router.use('/reviews', reviewRoutes);
router.use('/trial-lessons', trialLessonRoutes);

export default router;
