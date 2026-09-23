const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/User');
const Department = require('../models/Department');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const ProjectRequest = require('../models/ProjectRequest');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniskill_db';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany();
    await Department.deleteMany();
    await Skill.deleteMany();
    await Project.deleteMany();
    await Milestone.deleteMany();
    await ProjectRequest.deleteMany();
    console.log('[Seeder] Cleared previous database collections.');

    // 1. Create Departments
    const departments = await Department.insertMany([
      { name: 'Computer Science and Engineering', code: 'CSE', description: 'Department of Computing and Algorithms' },
      { name: 'Software Engineering', code: 'SE', description: 'Department of Software Architecture and Systems' },
      { name: 'Information Technology', code: 'IT', description: 'Department of Applied Information Systems' },
      { name: 'Electrical & Electronic Engineering', code: 'EEE', description: 'Department of Hardware and Electronics' },
      { name: 'Data Science & AI', code: 'DSAI', description: 'Department of Artificial Intelligence & Big Data' },
    ]);
    console.log(`[Seeder] Seeded ${departments.length} departments.`);

    const cseDept = departments[0];
    const seDept = departments[1];
    const dsaiDept = departments[4];

    // 2. Create Skills
    const skillsList = [
      { name: 'React.js', category: 'Web Development', description: 'Frontend JavaScript library for component-based UIs' },
      { name: 'Node.js', category: 'Database & Backend', description: 'JavaScript runtime built on Chrome V8 engine' },
      { name: 'Express.js', category: 'Database & Backend', description: 'Fast, unopinionated minimalist web framework' },
      { name: 'MongoDB', category: 'Database & Backend', description: 'NoSQL document-oriented database' },
      { name: 'Tailwind CSS', category: 'UI/UX Design', description: 'Utility-first CSS framework for rapid UI development' },
      { name: 'Python', category: 'AI & Machine Learning', description: 'High-level programming language for ML and Data Science' },
      { name: 'TensorFlow', category: 'AI & Machine Learning', description: 'End-to-end open source platform for machine learning' },
      { name: 'PyTorch', category: 'AI & Machine Learning', description: 'Deep learning framework for computer vision and NLP' },
      { name: 'Flutter', category: 'Mobile App Development', description: 'Google UI toolkit for multi-platform apps' },
      { name: 'Docker', category: 'Cloud & DevOps', description: 'Containerization platform' },
      { name: 'AWS Cloud', category: 'Cloud & DevOps', description: 'Cloud computing services by Amazon' },
      { name: 'Figma UI/UX', category: 'UI/UX Design', description: 'Collaborative interface design tool' },
      { name: 'Cybersecurity & Ethical Hacking', category: 'Cybersecurity', description: 'Network security, penetration testing & vulnerability assessment' },
      { name: 'Project Management & Agile', category: 'Soft Skills & Management', description: 'Scrum, Sprint planning, and team leadership' },
      { name: 'Embedded C / IoT', category: 'Embedded & IoT', description: 'Microcontrollers, Arduino, Raspberry Pi and ESP32' },
    ];

    const seededSkills = await Skill.insertMany(skillsList);
    console.log(`[Seeder] Seeded ${seededSkills.length} skills.`);

    // 3. Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminHashed = await bcrypt.hash('admin123', 10);
    const supervisorHashed = await bcrypt.hash('supervisor123', 10);
    const studentHashed = await bcrypt.hash('student123', 10);

    const users = await User.insertMany([
      {
        name: 'UniSkill Administrator',
        email: 'admin@uniskill.edu',
        password: adminHashed,
        role: 'admin',
        department: cseDept._id,
        bio: 'System Administrator managing university academic project portal.',
        phone: '+1 234 567 8900',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Dr. Alan Turing',
        email: 'supervisor@uniskill.edu',
        password: supervisorHashed,
        role: 'supervisor',
        department: cseDept._id,
        designation: 'Associate Professor & Research Lead',
        bio: 'Specializing in Theoretical Computer Science, Distributed Systems, and Full-Stack Engineering.',
        researchInterests: ['Distributed Systems', 'Cloud Computing', 'Full-Stack Architecture', 'Algorithmic Efficiency'],
        maxSupervisionCapacity: 6,
        officeLocation: 'Faculty Building 3, Room 402',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Prof. Grace Hopper',
        email: 'supervisor2@uniskill.edu',
        password: supervisorHashed,
        role: 'supervisor',
        department: dsaiDept._id,
        designation: 'Senior Lecturer',
        bio: 'Passionate about Artificial Intelligence, Machine Learning pipelines, and NLP applications.',
        researchInterests: ['Machine Learning', 'Computer Vision', 'Deep Neural Networks', 'Edge AI'],
        maxSupervisionCapacity: 4,
        officeLocation: 'Innovation Hub, Lab 12',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Alex Mercer',
        email: 'student@uniskill.edu',
        password: studentHashed,
        role: 'student',
        department: cseDept._id,
        studentId: 'STU-2026-0042',
        batchYear: '2023 - 2027',
        bio: 'Passionate full-stack developer with strong foundations in React, Node.js, and cloud deployments. Seeking innovative capstone projects.',
        socialLinks: {
          github: 'https://github.com/alexmercer',
          linkedin: 'https://linkedin.com/in/alexmercer',
          portfolio: 'https://alexmercer.dev',
        },
        skills: [
          { skill: seededSkills[0]._id, level: 'Expert', verified: true }, // React
          { skill: seededSkills[1]._id, level: 'Advanced', verified: true }, // Node.js
          { skill: seededSkills[2]._id, level: 'Advanced', verified: true }, // Express
          { skill: seededSkills[3]._id, level: 'Intermediate', verified: true }, // MongoDB
          { skill: seededSkills[4]._id, level: 'Expert', verified: false }, // Tailwind
        ],
        education: [
          { degree: 'B.Sc. (Hons) in Computer Science', institution: 'State University', startYear: '2023', endYear: '2027' },
        ],
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Sarah Connor',
        email: 'student2@uniskill.edu',
        password: studentHashed,
        role: 'student',
        department: seDept._id,
        studentId: 'STU-2026-0089',
        batchYear: '2023 - 2027',
        bio: 'Software engineer focusing on frontend UI/UX, Flutter mobile apps, and REST API integration.',
        socialLinks: {
          github: 'https://github.com/sarahconnor',
          linkedin: 'https://linkedin.com/in/sarahconnor',
        },
        skills: [
          { skill: seededSkills[0]._id, level: 'Advanced', verified: true }, // React
          { skill: seededSkills[8]._id, level: 'Expert', verified: true }, // Flutter
          { skill: seededSkills[11]._id, level: 'Advanced', verified: false }, // Figma
        ],
        education: [
          { degree: 'B.Sc. in Software Engineering', institution: 'State University', startYear: '2023', endYear: '2027' },
        ],
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'David Clark',
        email: 'student3@uniskill.edu',
        password: studentHashed,
        role: 'student',
        department: dsaiDept._id,
        studentId: 'STU-2026-0112',
        batchYear: '2024 - 2028',
        bio: 'AI enthusiast working on deep learning models and data engineering pipelines.',
        socialLinks: {
          github: 'https://github.com/davidclark',
        },
        skills: [
          { skill: seededSkills[5]._id, level: 'Expert', verified: true }, // Python
          { skill: seededSkills[6]._id, level: 'Advanced', verified: false }, // TensorFlow
          { skill: seededSkills[7]._id, level: 'Intermediate', verified: false }, // PyTorch
        ],
        education: [
          { degree: 'B.Sc. in Data Science and AI', institution: 'State University', startYear: '2024', endYear: '2028' },
        ],
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
      },
    ]);
    console.log(`[Seeder] Seeded ${users.length} users.`);

    const admin = users[0];
    const supervisor1 = users[1];
    const supervisor2 = users[2];
    const student1 = users[3];
    const student2 = users[4];
    const student3 = users[5];

    // 4. Create Sample Projects
    const project1 = await Project.create({
      title: 'UniSkill — University Skill & Project Platform',
      description: 'An all-in-one collaborative MERN web platform enabling university students to showcase verified skills, build dynamic project teams, track sprint milestones, and request academic supervision.',
      objectives: [
        'Centralize student skill repository and project portfolios',
        'Facilitate group recruitment with skill-based matching',
        'Provide supervisors with milestone tracking & grading workflows',
        'Enable role-based dashboards for students, supervisors, and admins',
      ],
      category: 'Web Application & Platform',
      department: cseDept._id,
      academicYear: '2026',
      status: 'in_progress',
      creator: student1._id,
      supervisor: supervisor1._id,
      members: [
        { user: student1._id, role: 'Leader', joinedAt: new Date() },
        { user: student2._id, role: 'Member', joinedAt: new Date() },
      ],
      requiredSkills: [seededSkills[0]._id, seededSkills[1]._id, seededSkills[2]._id, seededSkills[3]._id, seededSkills[4]._id],
      maxMembers: 4,
      isLookingForMembers: true,
      githubRepo: 'https://github.com/uniskill/uniskill-core',
      liveDemoUrl: 'http://localhost:5173',
      progress: 50,
    });

    const project2 = await Project.create({
      title: 'Edge AI Autonomous Drone Obstacle Detection',
      description: 'Developing real-time computer vision algorithms using lightweight neural networks deployed on Raspberry Pi & Jetson Nano for low-latency obstacle avoidance.',
      objectives: [
        'Train low-latency YOLO models for outdoor obstacle classification',
        'Optimize model quantization for embedded edge accelerators',
        'Perform real-time test flights with automated telemetry logging',
      ],
      category: 'AI & Robotics',
      department: dsaiDept._id,
      academicYear: '2026',
      status: 'in_progress',
      creator: student3._id,
      supervisor: supervisor2._id,
      members: [
        { user: student3._id, role: 'Leader', joinedAt: new Date() },
      ],
      requiredSkills: [seededSkills[5]._id, seededSkills[6]._id, seededSkills[7]._id, seededSkills[14]._id],
      maxMembers: 3,
      isLookingForMembers: true,
      githubRepo: 'https://github.com/davidclark/edge-ai-drone',
      progress: 25,
    });

    console.log('[Seeder] Seeded sample projects.');

    // 5. Create Milestones for Project 1
    await Milestone.insertMany([
      {
        project: project1._id,
        title: 'Milestone 1: Architecture Design & Database Schema',
        description: 'Complete ERD diagrams, API route contracts, and schema definitions.',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: 'approved',
        weightPercentage: 25,
        tasks: [
          { title: 'Draft MongoDB Mongoose schemas', isCompleted: true, assignedTo: student1._id },
          { title: 'Define JWT authentication contracts', isCompleted: true, assignedTo: student1._id },
          { title: 'Create UI Wireframes on Figma', isCompleted: true, assignedTo: student2._id },
        ],
        submission: {
          text: 'Architecture document and initial repository setup completed.',
          fileUrl: 'https://docs.google.com/document/d/sample-arch',
          submittedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        },
        feedback: {
          supervisor: supervisor1._id,
          comment: 'Excellent architecture breakdown and clean database relationships. Approved.',
          grade: 'A',
          reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      },
      {
        project: project1._id,
        title: 'Milestone 2: Authentication & Core Dashboard',
        description: 'Implement JWT login/register, role authorization middleware, and student/supervisor portals.',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'approved',
        weightPercentage: 25,
        tasks: [
          { title: 'Implement Express JWT routes & auth guards', isCompleted: true, assignedTo: student1._id },
          { title: 'Build React Auth Context & route guards', isCompleted: true, assignedTo: student2._id },
          { title: 'Design responsive Dashboard Layout', isCompleted: true, assignedTo: student2._id },
        ],
        submission: {
          text: 'Auth module and role-based dashboard navigation tested and ready.',
          fileUrl: 'https://github.com/uniskill/uniskill-core/pull/2',
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        feedback: {
          supervisor: supervisor1._id,
          comment: 'Solid implementation of RBAC. Make sure to validate email domain for university students.',
          grade: 'A-',
          reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      {
        project: project1._id,
        title: 'Milestone 3: Skill Verification & Supervisor Workflows',
        description: 'Complete skill endorsement, supervisor request portal, and interactive milestone tracking.',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        weightPercentage: 25,
        tasks: [
          { title: 'Build supervisor request acceptance flow', isCompleted: true, assignedTo: student1._id },
          { title: 'Implement public student portfolio pages', isCompleted: false, assignedTo: student2._id },
          { title: 'Dynamic progress percentage computation', isCompleted: false, assignedTo: student1._id },
        ],
      },
      {
        project: project1._id,
        title: 'Milestone 4: Testing, Deployment & Final Defense',
        description: 'End-to-end user testing, cloud deployment, and final presentation slide deck.',
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'pending',
        weightPercentage: 25,
        tasks: [
          { title: 'Perform API load testing', isCompleted: false, assignedTo: student1._id },
          { title: 'Deploy frontend and backend to cloud servers', isCompleted: false, assignedTo: student1._id },
          { title: 'Record 5-minute video demonstration', isCompleted: false, assignedTo: student2._id },
        ],
      },
    ]);

    // 6. Create Milestones for Project 2
    await Milestone.insertMany([
      {
        project: project2._id,
        title: 'Dataset Collection & Annotation',
        description: 'Collect 10,000 aerial images and label obstacle bounding boxes.',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'approved',
        weightPercentage: 25,
        tasks: [{ title: 'Collect raw camera footage', isCompleted: true, assignedTo: student3._id }],
        feedback: {
          supervisor: supervisor2._id,
          comment: 'Great dataset variety. Approved.',
          grade: 'A',
          reviewedAt: new Date(),
        },
      },
      {
        project: project2._id,
        title: 'Model Training & Quantization',
        description: 'Train lightweight YOLOv8 nano and export to TensorRT.',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        weightPercentage: 25,
        tasks: [{ title: 'Train model on PyTorch', isCompleted: true, assignedTo: student3._id }],
      },
    ]);

    console.log('[Seeder] Seeded project milestones.');

    // 7. Create Sample Requests
    await ProjectRequest.create({
      type: 'join_group',
      project: project2._id,
      sender: student2._id,
      recipient: student3._id,
      message: 'Hi David, I have strong Flutter mobile experience and would love to build the ground control station app for your drone project!',
      status: 'pending',
    });

    console.log('\n==========================================');
    console.log('🎉 UNISKILL DATABASE SEEDING COMPLETED!');
    console.log('==========================================');
    console.log('Sample Accounts for testing:');
    console.log('------------------------------------------');
    console.log('👑 Admin:      admin@uniskill.edu      / admin123');
    console.log('👨‍🏫 Supervisor: supervisor@uniskill.edu / supervisor123');
    console.log('👨‍🏫 Supervisor 2: supervisor2@uniskill.edu / supervisor123');
    console.log('🎓 Student 1:   student@uniskill.edu    / student123 (Alex Mercer - Leader)');
    console.log('🎓 Student 2:   student2@uniskill.edu   / student123 (Sarah Connor)');
    console.log('🎓 Student 3:   student3@uniskill.edu   / student123 (David Clark)');
    console.log('==========================================\n');

    process.exit(0);
  } catch (err) {
    console.error(`[Seeder Error] ${err.message}`);
    process.exit(1);
  }
};

seedData();
