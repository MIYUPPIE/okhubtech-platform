import { PrismaClient, RoleName } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function seedRoles() {
  await Promise.all(
    Object.values(RoleName).map((role) =>
      prisma.role.upsert({
        where: { name: role },
        update: {},
        create: { name: role },
      })
    )
  );
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@okhubtech.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const hashPassword = await hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashPassword,
    },
    create: {
      email,
      name: "OKHub Admin",
      password: hashPassword,
      roles: {
        connect: { name: RoleName.ADMIN },
      },
    },
  });
}

async function seedImpactMetrics() {
  const metrics = [
    { key: "solutions", label: "Solutions deployed", value: 84 },
    { key: "institutions", label: "Institutions served", value: 136 },
    { key: "communities", label: "Communities impacted", value: 420 },
    { key: "jobs", label: "Jobs enabled", value: 5200 },
  ];

  await Promise.all(
    metrics.map((metric) =>
      prisma.impactMetric.upsert({
        where: { key: metric.key },
        update: { label: metric.label, value: metric.value },
        create: metric,
      })
    )
  );
}

async function main() {
  await seedRoles();
  await seedAdmin();
  await seedImpactMetrics();
  console.log("✅ Seed complete. Admin credentials ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
