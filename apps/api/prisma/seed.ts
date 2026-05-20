import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de TimeFlow...');

  // ─── System Categories ───────────────────────────────────────
  const systemCategories = [
    { name: 'Académico',  slug: 'academic', icon: 'graduation-cap' },
    { name: 'Deportivo',  slug: 'sport',    icon: 'dumbbell' },
    { name: 'Trabajo',    slug: 'work',     icon: 'briefcase' },
    { name: 'Personal',   slug: 'personal', icon: 'user' },
    { name: 'Salud',      slug: 'health',   icon: 'heart-pulse' },
    { name: 'Finanzas',   slug: 'finance',  icon: 'wallet' },
    { name: 'Hogar',      slug: 'home',     icon: 'home' },
    { name: 'Social',     slug: 'social',   icon: 'users' },
  ];

  for (const cat of systemCategories) {
    await prisma.systemCategory.upsert({
      where:  { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, isActive: true },
      create: { ...cat, isActive: true },
    });
  }

  console.log(`✅ ${systemCategories.length} categorías del sistema creadas/actualizadas`);
  console.log('🎉 Seed completado correctamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
