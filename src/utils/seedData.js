import { addClient, addProject, addTask, addInvoice, addActivity } from '../services/db';

const mockClients = [
  { name: 'Acme Corp', industry: 'Technology', contactName: 'John Doe', contactRole: 'CEO', status: 'Active', retainer: 5000 },
  { name: 'Stark Industries', industry: 'Defense', contactName: 'Tony Stark', contactRole: 'CEO', status: 'Active', retainer: 15000 },
  { name: 'Wayne Enterprises', industry: 'Conglomerate', contactName: 'Bruce Wayne', contactRole: 'Owner', status: 'Onboarding', retainer: 10000 },
  { name: 'Daily Planet', industry: 'Media', contactName: 'Clark Kent', contactRole: 'Reporter', status: 'Lead', retainer: 0 }
];

const mockProjects = [
  { name: 'Q3 Marketing Campaign', type: 'Digital Marketing', status: 'In Progress', budget: 25000, progress: 45 },
  { name: 'Website Redesign', type: 'Web Development', status: 'To Do', budget: 15000, progress: 0 },
  { name: 'SEO Optimization', type: 'SEO', status: 'To Do', budget: 5000, progress: 0 },
  { name: 'Brand Identity', type: 'Branding', status: 'Completed', budget: 12000, progress: 100 }
];

const mockTasks = [
  { 
    title: 'Draft social media posts', 
    status: 'In Progress', 
    priority: 'High', 
    assignee: 'Jane Smith', 
    dueDate: '2026-05-10', 
    dueTime: '14:00',
    progress: 25,
    description: 'Create captions and select images for Instagram.',
    comments: [{ text: 'Starting on the graphics now.', author: 'Jane Smith', timestamp: new Date().toISOString() }],
    review: ''
  },
  { 
    title: 'Design landing page', 
    status: 'To Do', 
    priority: 'Medium', 
    assignee: 'Alice Johnson', 
    dueDate: '2026-05-15', 
    dueTime: '18:00',
    progress: 0,
    description: 'Design a high-converting landing page for the new campaign.',
    comments: [],
    review: ''
  },
  { 
    title: 'Keyword research', 
    status: 'Done', 
    priority: 'Low', 
    assignee: 'Bob Brown', 
    dueDate: '2026-05-01', 
    dueTime: '10:00',
    progress: 100,
    description: 'Research long-tail keywords for the SEO project.',
    comments: [{ text: 'All keywords finalized.', author: 'Bob Brown', timestamp: new Date().toISOString() }],
    review: 'Great work, very comprehensive list.'
  }
];

const mockInvoices = [
  { client: 'Acme Corp', amount: 24500, status: 'Overdue', date: '2023-10-12', dueDate: '2023-11-12' },
  { client: 'Stark Industries', amount: 112000, status: 'Pending', date: '2023-11-01', dueDate: '2023-12-01' },
  { client: 'Wayne Enterprises', amount: 45000, status: 'Paid', date: '2023-09-15', dueDate: '2023-10-15' },
  { client: 'Globex Corp', amount: 8450, status: 'Paid', date: '2023-09-10', dueDate: '2023-10-10' }
];

const mockActivities = [
  { message: 'New project "Website Redesign" started', type: 'Project', timestamp: new Date() },
  { message: 'Invoice #INV-001 paid by Acme Corp', type: 'Finance', timestamp: new Date(Date.now() - 86400000) },
  { title: 'Task "Keyword research" completed', type: 'Task', timestamp: new Date(Date.now() - 172800000) }
];

export const seedDatabase = async () => {
  try {
    console.log("Seeding clients...");
    const clientIds = [];
    for (const client of mockClients) {
      const docRef = await addClient(client);
      clientIds.push(docRef.id);
    }
    
    console.log("Seeding projects...");
    const projectIds = [];
    // Link projects to the first few clients
    for (let i = 0; i < mockProjects.length; i++) {
      const project = { 
        ...mockProjects[i], 
        clientId: clientIds[i % clientIds.length] 
      };
      const docRef = await addProject(project);
      projectIds.push(docRef.id);
    }
    
    console.log("Seeding tasks...");
    // Link tasks to the first few projects
    for (let i = 0; i < mockTasks.length; i++) {
      const task = { 
        ...mockTasks[i], 
        projectId: projectIds[i % projectIds.length] 
      };
      await addTask(task);
    }
    
    console.log("Seeding invoices...");
    // Link invoices to clients
    for (let i = 0; i < mockInvoices.length; i++) {
      const invoice = { 
        ...mockInvoices[i], 
        clientId: clientIds[i % clientIds.length] 
      };
      await addInvoice(invoice);
    }
    
    console.log("Seeding activities...");
    for (const activity of mockActivities) {
      await addActivity(activity);
    }
    
    console.log("Database seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
};
