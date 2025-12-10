const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.count();
    const expenses = await prisma.expense.count();
    const budgets = await prisma.budget.count();

    console.log('--- Database Status ---');
    console.log(`Users: ${users}`);
    console.log(`Expenses: ${expenses}`);
    console.log(`Budgets: ${budgets}`);
    console.log('-----------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
