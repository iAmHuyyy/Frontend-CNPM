const cors = require('cors');
const express = require('express');
const config = require('./config');
const sql = require('mssql');

const { handleSSOCallback, getSSOStatus, logout } = require('./All/callback');
const { handleProfile } = require('./All/profile');
const { getAllCourse } = require('./All/getallcourse'); 
const { handleGetSection } = require('./All/getsection');
const { handleCreateSection } = require('./Tutor/createsection');
const { handleCreateSchedule } = require('./Tutor/createschedule');
const { getAllSchedule } = require('./Mentee/getallschedule');
const { getScheduleByTutor } = require('./Tutor/getschedule');
const { handleChangeSchedule } = require('./Tutor/chaneschedule');
const { handleDeleteSchedule } = require('./Tutor/deleteschedule');
const { handleEnroll } = require('./Mentee/enroll');
const { getEnrolledSections } = require('./Mentee/his_enroll');
const { cancelEnrollment } = require('./Mentee/deleteenroll');
const { getAllSectionsByStudent } = require('./Mentee/getallsection');
const { createContent } = require('./Tutor/createcontent');
const { getContentBySection } = require('./All/getcontent');
const { createFeedback } = require('./All/feedback');
const { getFeedbackByTutor } = require('./Tutor/getfeedback');
const { getNotifications } = require('./All/getnotification');
const { deleteNotification } = require('./All/deletenotification');
const { deleteFeedback } = require('./Tutor/deletefeedback');
const { updateUserInfo } = require('./All/update');
const { getCourseCode } = require('./Mentee/mgetcourse');
const { replyFeedback } = require('./Tutor/reply');

const app = express();
app.use(cors());
app.use(express.json());

sql.connect(config);

// login - logout
app.post('/api/sso/callback', handleSSOCallback);
app.get('/api/sso/status', getSSOStatus);
app.post('/api/update', updateUserInfo);
app.post('/api/logout', logout);

// profile
app.get('/profile', handleProfile);

// courses
app.get('/api/courses', getAllCourse);
app.get('/api/section/:section_id/course-code', getCourseCode);

//section
app.post('/api/createsection', handleCreateSection);
app.get('/api/getsection', handleGetSection);
app.get('/api/sections/enrolled', getAllSectionsByStudent);

//Schedule
app.post('/api/createschedule', handleCreateSchedule);
app.get('/api/schedules', getAllSchedule);
app.get('/api/schedule/tutor', getScheduleByTutor);
app.put('/api/schedule/update', handleChangeSchedule);
app.delete('/api/schedule/delete', handleDeleteSchedule);

//enroll
app.post('/api/enroll', handleEnroll);
app.put('/api/enrollment/cancel', cancelEnrollment);
app.get('/api/enrollments', getEnrolledSections);

//content
app.post('/api/content/create', createContent);
app.get('/api/content', getContentBySection);

//feedback
app.post('/api/feedback', createFeedback);
app.get('/api/feedback/tutor', getFeedbackByTutor);
app.delete('/api/feedback/:feedback_id', deleteFeedback);

//reply
app.post('/api/feedback/reply', replyFeedback);

//notification
app.get('/api/notifications', getNotifications);
app.delete('/api/notifications/:notification_id', deleteNotification);



app.listen(3000, () => console.log(' Server chạy tại http://localhost:3000'));