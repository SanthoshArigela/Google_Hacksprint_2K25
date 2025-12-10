const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Starting Database Reset...');

    try {
        // Delete all Users. 
        // Due to 'onDelete: Cascade' in schema.prisma, this should automatically remove:
        // - RefreshTokens
        // - Expenses
        // - Budgets
        // - Alerts

        // However, Categories might not cascade if they are shared/nullable.
        // Let's delete user-specific categories first to be clean.
        const deletedCategories = await prisma.category.deleteMany({
            where: {
                userId: {
                    not: null
                }
            }
        });
        console.log(`- Deleted ${deletedCategories.count} custom categories.`);

        const deletedUsers = await prisma.user.deleteMany({});
        console.log(`- Deleted ${deletedUsers.count} users (and their data).`);

        console.log('✅ Database successfully cleared.');
    } catch (e) {
        console.error('❌ Reset failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
