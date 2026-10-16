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

    // 1. Create Departments with Degrees
    const departments = await Department.insertMany([
      {
        name: 'Computer Science and Engineering',
        code: 'CSE',
        description: 'Department of Computing, Systems and Algorithms',
        degrees: [
          { name: 'B.Sc. in Computer Science', code: 'CS', durationYears: 4 },
          { name: 'B.Sc. in Software Systems', code: 'SS', durationYears: 4 },
        ],
      },
      {
        name: 'Mechanical & Mechatronics Engineering',
        code: 'MME',
        description: 'Department of Mechanics, Robotics and Automated Systems',
        degrees: [
          { name: 'B.Sc. in Mechanical Engineering', code: 'ME', durationYears: 4 },
          { name: 'B.Sc. in Robotics & Mechatronics', code: 'ROB', durationYears: 4 },
        ],
      },
      {
        name: 'Biomedical Sciences & Biotechnology',
        code: 'BMB',
        description: 'Department of Molecular Life Sciences, Pharmacology and Bioengineering',
        degrees: [
          { name: 'B.Sc. in Biomedical Science', code: 'BMS', durationYears: 4 },
          { name: 'B.Sc. in Biotechnology', code: 'BIOTECH', durationYears: 4 },
        ],
      },
      {
        name: 'Business Administration & Economics',
        code: 'BAE',
        description: 'Department of Management, Finance, and Strategic Policy',
        degrees: [
          { name: 'BBA in Business Administration', code: 'BBA', durationYears: 4 },
          { name: 'B.Sc. in Financial Economics', code: 'ECON', durationYears: 4 },
        ],
      },
      {
        name: 'Data Science & Artificial Intelligence',
        code: 'DSAI',
        description: 'Department of Big Data, Neural Computing & Intelligent Systems',
        degrees: [
          { name: 'B.Sc. in Data Science & AI', code: 'DSAI', durationYears: 4 },
        ],
      },
    ]);
    console.log(`[Seeder] Seeded ${departments.length} departments with academic degree programs.`);

    const cseDept = departments[0];
    const mmeDept = departments[1];
    const bmbDept = departments[2];
    const baeDept = departments[3];
    const dsaiDept = departments[4];

    // 2. Create Skills (Universal, Department-specific, and Degree-specific)
    const skillsList = [
      // Universal Skills (department: null)
      { name: 'Academic Research Writing & Publication', category: 'Academic Writing & Literature Review', department: null, degree: '', description: 'Synthesis of peer-reviewed literature, methodology framing, and scholarly dissemination.' },
      { name: 'Statistical Data Analysis (SPSS / R)', category: 'Data Analysis & Statistics', department: null, degree: '', description: 'Hypothesis testing, regression analysis, and experimental data significance validation.' },
      { name: 'Research Ethics & Institutional Review (IRB)', category: 'Research Methodology & Ethics', department: null, degree: '', description: 'Ethical human/animal subject guidelines, confidentiality protocols, and research integrity.' },
      
      // Computer Science (CSE)
      { name: 'React.js & Modern Frontend Architecture', category: 'Software & Computational Tools', department: cseDept._id, degree: 'B.Sc. in Computer Science', description: 'Component-based single page web application development.' },
      { name: 'Node.js & Scalable Backend Systems', category: 'Software & Computational Tools', department: cseDept._id, degree: 'B.Sc. in Computer Science', description: 'Asynchronous event-driven server runtime and API architecture.' },
      { name: 'Distributed Systems & Microservices', category: 'Software & Computational Tools', department: cseDept._id, degree: 'B.Sc. in Software Systems', description: 'Consensus algorithms, message brokers, and fault-tolerant architecture.' },
      { name: 'Cloud Infrastructure & Kubernetes', category: 'Software & Computational Tools', department: cseDept._id, degree: '', description: 'Container orchestration, CI/CD automated deployment pipelines, and cloud clusters.' },

      // Mechanical & Mechatronics (MME)
      { name: 'Finite Element Analysis (FEA / ANSYS)', category: 'Modeling & Simulation', department: mmeDept._id, degree: 'B.Sc. in Mechanical Engineering', description: 'Stress, strain, thermal, and dynamic structural simulation of components.' },
      { name: 'SolidWorks & 3D CAD Parametric Modeling', category: 'Design & Prototyping', department: mmeDept._id, degree: '', description: 'Computer-aided design, technical drafting, and mechanical assembly modeling.' },
      { name: 'Robot Kinematics & ROS (Robot Operating System)', category: 'Hardware & Electronics', department: mmeDept._id, degree: 'B.Sc. in Robotics & Mechatronics', description: 'Forward/inverse kinematics, trajectory planning, and actuator motor controls.' },
      { name: 'CNC Machining & Rapid Prototyping', category: 'Design & Prototyping', department: mmeDept._id, degree: 'B.Sc. in Mechanical Engineering', description: 'Subtractive manufacturing, G-code generation, and additive 3D fabrication.' },

      // Biomedical Sciences & Biotech (BMB)
      { name: 'Mammalian Cell Culture & Aseptic Technique', category: 'Experimental & Laboratory', department: bmbDept._id, degree: 'B.Sc. in Biomedical Science', description: 'Sterile cell propagation, media formulation, viability assays, and cryopreservation.' },
      { name: 'Quantitative Real-Time PCR (qPCR)', category: 'Experimental & Laboratory', department: bmbDept._id, degree: '', description: 'Nucleic acid amplification, gene expression quantification, and primer design.' },
      { name: 'Bioinformatics & Genomic Sequence Alignment', category: 'Software & Computational Tools', department: bmbDept._id, degree: 'B.Sc. in Biotechnology', description: 'BLAST, RNA-Seq transcriptomic processing, and phylogenetic analysis.' },
      { name: 'High-Performance Liquid Chromatography (HPLC)', category: 'Experimental & Laboratory', department: bmbDept._id, degree: 'B.Sc. in Biomedical Science', description: 'Analytical chemistry separation and identification of biomolecular compounds.' },

      // Business & Economics (BAE)
      { name: 'Econometric Modeling & Time-Series Forecasting', category: 'Financial & Economic Analysis', department: baeDept._id, degree: 'B.Sc. in Financial Economics', description: 'Multivariate regression, ARIMA time series, and macroeconomic modeling.' },
      { name: 'Corporate Financial Statement Valuation (DCF)', category: 'Financial & Economic Analysis', department: baeDept._id, degree: 'BBA in Business Administration', description: 'Discounted cash flow valuation, capital budgeting, and investment analysis.' },
      { name: 'Quantitative Market Survey & Consumer Research', category: 'Field Work & Surveying', department: baeDept._id, degree: 'BBA in Business Administration', description: 'Survey instrument design, sampling methodology, and customer analytics.' },

      // Data Science & AI (DSAI)
      { name: 'Deep Neural Networks (PyTorch / TensorFlow)', category: 'AI & Machine Learning', department: dsaiDept._id, degree: 'B.Sc. in Data Science & AI', description: 'Computer vision, natural language processing, and neural network training.' },
      { name: 'Big Data Pipeline Engineering (Apache Spark)', category: 'Data Analysis & Statistics', department: dsaiDept._id, degree: 'B.Sc. in Data Science & AI', description: 'Distributed data streaming, ETL pipelines, and parquet processing.' },
    ];

    const seededSkills = await Skill.insertMany(skillsList);
    console.log(`[Seeder] Seeded ${seededSkills.length} multidisciplinary skills.`);

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
        degree: 'B.Sc. in Computer Science',
        studentId: 'STU-2026-0042',
        batchYear: '2023 - 2027',
        bio: 'Passionate full-stack developer with strong foundations in React, Node.js, and cloud deployments. Seeking innovative capstone projects.',
        socialLinks: {
          github: 'https://github.com/alexmercer',
          linkedin: 'https://linkedin.com/in/alexmercer',
          portfolio: 'https://alexmercer.dev',
        },
        skills: [
          { skill: seededSkills[3]._id, level: 'Expert', verified: true }, // React
          { skill: seededSkills[4]._id, level: 'Advanced', verified: true }, // Node.js
          { skill: seededSkills[0]._id, level: 'Advanced', verified: true }, // Academic Research Writing
        ],
        education: [
          { degree: 'B.Sc. in Computer Science', institution: 'State University', startYear: '2023', endYear: '2027' },
        ],
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Sarah Connor',
        email: 'student2@uniskill.edu',
        password: studentHashed,
        role: 'student',
        department: cseDept._id,
        degree: 'B.Sc. in Software Systems',
        studentId: 'STU-2026-0089',
        batchYear: '2023 - 2027',
        bio: 'Software engineer focusing on microservices, distributed systems, and scalable backend platforms.',
        socialLinks: {
          github: 'https://github.com/sarahconnor',
          linkedin: 'https://linkedin.com/in/sarahconnor',
        },
        skills: [
          { skill: seededSkills[4]._id, level: 'Advanced', verified: true }, // Node.js
          { skill: seededSkills[5]._id, level: 'Expert', verified: true }, // Distributed Systems
          { skill: seededSkills[1]._id, level: 'Intermediate', verified: false }, // Statistics
        ],
        education: [
          { degree: 'B.Sc. in Software Systems', institution: 'State University', startYear: '2023', endYear: '2027' },
        ],
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'David Clark',
        email: 'student3@uniskill.edu',
        password: studentHashed,
        role: 'student',
        department: dsaiDept._id,
        degree: 'B.Sc. in Data Science & AI',
        studentId: 'STU-2026-0112',
        batchYear: '2024 - 2028',
        bio: 'AI enthusiast working on deep neural network architectures and big data streaming pipelines.',
        socialLinks: {
          github: 'https://github.com/davidclark',
        },
        skills: [
          { skill: seededSkills[18]._id, level: 'Expert', verified: true }, // Deep Neural Networks
          { skill: seededSkills[19]._id, level: 'Advanced', verified: false }, // Big Data
          { skill: seededSkills[1]._id, level: 'Intermediate', verified: false }, // Statistics
        ],
        education: [
          { degree: 'B.Sc. in Data Science & AI', institution: 'State University', startYear: '2024', endYear: '2028' },
        ],
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Liam Vance',
        email: 'student4@uniskill.edu',
        password: studentHashed,
        role: 'student',
        department: mmeDept._id,
        degree: 'B.Sc. in Robotics & Mechatronics',
        studentId: 'STU-2026-0244',
        batchYear: '2023 - 2027',
        bio: 'Mechatronics engineering student conducting research in robotic manipulator kinematics and ROS autonomous mobile robots.',
        skills: [
          { skill: seededSkills[9]._id, level: 'Advanced', verified: true }, // Robot Kinematics & ROS
          { skill: seededSkills[8]._id, level: 'Advanced', verified: true }, // SolidWorks & 3D CAD
        ],
        education: [
          { degree: 'B.Sc. in Robotics & Mechatronics', institution: 'State University', startYear: '2023', endYear: '2027' },
        ],
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      },
      {
        name: 'Chloe Bennett',
        email: 'student5@uniskill.edu',
        password: studentHashed,
        role: 'student',
        department: bmbDept._id,
        degree: 'B.Sc. in Biomedical Science',
        studentId: 'STU-2026-0318',
        batchYear: '2023 - 2027',
        bio: 'Biomedical sciences researcher working on mammalian cell culture, oncology drug assay screening, and qPCR quantification.',
        skills: [
          { skill: seededSkills[11]._id, level: 'Expert', verified: true }, // Cell Culture
          { skill: seededSkills[12]._id, level: 'Advanced', verified: true }, // qPCR
          { skill: seededSkills[14]._id, level: 'Intermediate', verified: false }, // HPLC
        ],
        education: [
          { degree: 'B.Sc. in Biomedical Science', institution: 'State University', startYear: '2023', endYear: '2027' },
        ],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
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
      requiredSkills: [seededSkills[3]._id, seededSkills[4]._id, seededSkills[0]._id],
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
      requiredSkills: [seededSkills[18]._id, seededSkills[19]._id, seededSkills[9]._id],
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
