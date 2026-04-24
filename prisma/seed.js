// prisma/seed.js — populates the categories table with the app's static category set.
// Run once after first DB setup: npm run db:seed
// Safe to re-run (uses upsert).

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categories = [
  { id: "1",  name: "Alimentação", icon: "🍔", color: "#FF6B6B", type: "EXPENSE" },
  { id: "2",  name: "Transporte",  icon: "🚗", color: "#4ECDC4", type: "EXPENSE" },
  { id: "3",  name: "Moradia",     icon: "🏠", color: "#45B7D1", type: "EXPENSE" },
  { id: "4",  name: "Saúde",       icon: "💊", color: "#96CEB4", type: "EXPENSE" },
  { id: "5",  name: "Lazer",       icon: "🎮", color: "#FFEAA7", type: "EXPENSE" },
  { id: "6",  name: "Educação",    icon: "📚", color: "#DDA0DD", type: "EXPENSE" },
  { id: "7",  name: "Roupas",      icon: "👗", color: "#F0A500", type: "EXPENSE" },
  { id: "8",  name: "Salário",     icon: "💼", color: "#6BCB77", type: "INCOME"  },
  { id: "9",  name: "Freelance",   icon: "💻", color: "#4D96FF", type: "INCOME"  },
  { id: "10", name: "Investimento",icon: "📈", color: "#A8DADC", type: "INCOME"  },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where:  { id: cat.id },
      update: {},
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
