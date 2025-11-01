import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed script to populate database with test data
 */
async function main() {
    console.log('🌱 Starting database seed...');

    // Create test users
    const password = await bcrypt.hash('Test1234!', 10);

    const john = await prisma.user.upsert({
        where: { email: 'john.doe@example.com' },
        update: {},
        create: {
            email: 'john.doe@example.com',
            name: 'John Doe',
            password,
        },
    });

    const jane = await prisma.user.upsert({
        where: { email: 'jane.smith@example.com' },
        update: {},
        create: {
            email: 'jane.smith@example.com',
            name: 'Jane Smith',
            password,
        },
    });

    const bob = await prisma.user.upsert({
        where: { email: 'bob.wilson@example.com' },
        update: {},
        create: {
            email: 'bob.wilson@example.com',
            name: 'Bob Wilson',
            password,
        },
    });

    console.log('✅ Created test users');

    // Create organizations
    const acmeOrg = await prisma.organization.upsert({
        where: { slug: 'acme-corp' },
        update: {},
        create: {
            name: 'Acme Corporation',
            slug: 'acme-corp',
            ownerId: john.id,
            members: {
                create: [
                    { userId: john.id, role: 'OWNER' },
                    { userId: jane.id, role: 'ADMIN' },
                    { userId: bob.id, role: 'MEMBER' },
                ],
            },
        },
    });

    const techOrg = await prisma.organization.upsert({
        where: { slug: 'tech-innovators' },
        update: {},
        create: {
            name: 'Tech Innovators',
            slug: 'tech-innovators',
            ownerId: jane.id,
            members: {
                create: [
                    { userId: jane.id, role: 'OWNER' },
                    { userId: john.id, role: 'MEMBER' },
                ],
            },
        },
    });

    console.log('✅ Created organizations');

    // Create projects for Acme Corp
    const websiteProject = await prisma.project.create({
        data: {
            name: 'Website Redesign',
            description: 'Complete overhaul of the company website with modern design',
            status: 'ACTIVE',
            organizationId: acmeOrg.id,
            creatorId: john.id,
        },
    });

    const mobileProject = await prisma.project.create({
        data: {
            name: 'Mobile App Development',
            description: 'Native iOS and Android apps for customer engagement',
            status: 'ACTIVE',
            organizationId: acmeOrg.id,
            creatorId: jane.id,
        },
    });

    const marketingProject = await prisma.project.create({
        data: {
            name: 'Q1 Marketing Campaign',
            description: 'Launch new product marketing campaign',
            status: 'COMPLETED',
            organizationId: acmeOrg.id,
            creatorId: bob.id,
        },
    });

    console.log('✅ Created projects');

    // Create tasks for Website Redesign project
    await prisma.task.createMany({
        data: [
            {
                title: 'Design homepage mockup',
                description: 'Create high-fidelity mockup for the new homepage',
                status: 'DONE',
                priority: 'HIGH',
                projectId: websiteProject.id,
                creatorId: john.id,
                assigneeId: jane.id,
                dueDate: new Date('2025-01-15'),
            },
            {
                title: 'Implement responsive navigation',
                description: 'Build mobile-friendly navigation menu',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                projectId: websiteProject.id,
                creatorId: john.id,
                assigneeId: bob.id,
                dueDate: new Date('2025-02-01'),
            },
            {
                title: 'Set up contact form',
                description: 'Create and integrate contact form with backend',
                status: 'TODO',
                priority: 'MEDIUM',
                projectId: websiteProject.id,
                creatorId: jane.id,
                assigneeId: bob.id,
                dueDate: new Date('2025-02-10'),
            },
            {
                title: 'Optimize images for web',
                description: 'Compress and optimize all images for faster loading',
                status: 'TODO',
                priority: 'LOW',
                projectId: websiteProject.id,
                creatorId: bob.id,
                dueDate: new Date('2025-02-15'),
            },
            {
                title: 'Write SEO meta descriptions',
                description: 'Create compelling meta descriptions for all pages',
                status: 'TODO',
                priority: 'MEDIUM',
                projectId: websiteProject.id,
                creatorId: john.id,
                assigneeId: jane.id,
            },
        ],
    });

    // Create tasks for Mobile App project
    await prisma.task.createMany({
        data: [
            {
                title: 'Set up React Native project',
                description: 'Initialize project with Expo and configure dependencies',
                status: 'DONE',
                priority: 'URGENT',
                projectId: mobileProject.id,
                creatorId: jane.id,
                assigneeId: bob.id,
            },
            {
                title: 'Design app icon and splash screen',
                description: 'Create branded app icon and loading screen',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                projectId: mobileProject.id,
                creatorId: jane.id,
                assigneeId: jane.id,
            },
            {
                title: 'Implement user authentication',
                description: 'Add login, signup, and password reset flows',
                status: 'TODO',
                priority: 'URGENT',
                projectId: mobileProject.id,
                creatorId: john.id,
                assigneeId: bob.id,
            },
            {
                title: 'Build product catalog screen',
                description: 'Display products with search and filter options',
                status: 'TODO',
                priority: 'HIGH',
                projectId: mobileProject.id,
                creatorId: jane.id,
            },
        ],
    });

    // Create tasks for Marketing Campaign project
    await prisma.task.createMany({
        data: [
            {
                title: 'Plan social media strategy',
                description: 'Define content calendar and posting schedule',
                status: 'DONE',
                priority: 'HIGH',
                projectId: marketingProject.id,
                creatorId: bob.id,
                assigneeId: john.id,
            },
            {
                title: 'Create email templates',
                description: 'Design responsive email templates for campaign',
                status: 'DONE',
                priority: 'MEDIUM',
                projectId: marketingProject.id,
                creatorId: bob.id,
                assigneeId: jane.id,
            },
        ],
    });

    console.log('✅ Created tasks');

    // Create projects for Tech Innovators
    const aiProject = await prisma.project.create({
        data: {
            name: 'AI Assistant Platform',
            description: 'Build intelligent assistant for customer support',
            status: 'ACTIVE',
            organizationId: techOrg.id,
            creatorId: jane.id,
        },
    });

    await prisma.task.createMany({
        data: [
            {
                title: 'Research AI models',
                description: 'Evaluate GPT-4 vs Claude for our use case',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                projectId: aiProject.id,
                creatorId: jane.id,
                assigneeId: john.id,
            },
            {
                title: 'Design conversation flow',
                description: 'Map out user journey and conversation paths',
                status: 'TODO',
                priority: 'MEDIUM',
                projectId: aiProject.id,
                creatorId: jane.id,
            },
        ],
    });

    console.log('✅ Created additional organization and projects');

    console.log('\n🎉 Database seed completed successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('   Email: john.doe@example.com');
    console.log('   Email: jane.smith@example.com');
    console.log('   Email: bob.wilson@example.com');
    console.log('   Password: Test1234!\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });