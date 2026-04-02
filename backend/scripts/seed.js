import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import WorkItem from '../models/WorkItem.js';
import Dependency from '../models/Dependency.js';

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@nestup.com',
    password: 'adminpassword123',
    role: 'admin',
    skills: ['Management', 'Architecture']
  },
  {
    name: 'John Doe',
    email: 'john@nestup.com',
    password: 'memberpassword123',
    role: 'member',
    skills: ['React', 'Node.js', 'MongoDB']
  },
  {
    name: 'Jane Smith',
    email: 'jane@nestup.com',
    password: 'memberpassword123',
    role: 'member',
    skills: ['Design', 'CSS', 'Figma']
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await WorkItem.deleteMany();
    await Dependency.deleteMany();
    console.log('Cleared existing data.');

    // Insert new users
    const createdUsers = await User.create(users);
    console.log('Seed users created.');

    // Create some initial work items
    const workItems = [
      {
        title: 'Initial Backend Setup',
        description: 'Setup Node.js, Express and MongoDB connection.',
        priority: 'high',
        status: 'done',
        progress: 100,
        assignedTo: createdUsers[0]._id, // Admin
        requiredSkills: ['Node.js', 'MongoDB']
      },
      {
        title: 'Frontend Authentication',
        description: 'Implement login and protected routes.',
        priority: 'critical',
        status: 'in-progress',
        progress: 60,
        assignedTo: createdUsers[1]._id, // John
        requiredSkills: ['React', 'JWT']
      },
      {
        title: 'Dashboard UI Design',
        description: 'Design the main dashboard layout and components.',
        priority: 'medium',
        status: 'blocked',
        progress: 0,
        assignedTo: createdUsers[2]._id, // Jane
        requiredSkills: ['Design', 'CSS']
      }
    ];

    await WorkItem.create(workItems);
    console.log('Seed work items created.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
