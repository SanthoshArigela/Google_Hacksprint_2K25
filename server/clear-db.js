const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Clearing database...');

    // Delete in order to avoid foreign key constraints (though onDelete Cascade handles most)
    await prisma.alert.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.budget.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    // Category deletion might fail if used by expenses, but expenses are gone now.
    // Also categories have hierarchy. 
    // Usually we only delete user-specific categories.
    await prisma.category.deleteMany({ where: { NOT: { userId: null } } });

    await prisma.user.deleteMany({});

    console.log('All users and related data deleted.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
