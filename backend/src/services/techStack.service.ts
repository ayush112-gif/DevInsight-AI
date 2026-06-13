export const detectTechnologies = (files: string[]) => {
  const tech: string[] = [];

  if (files.some(file => file.includes("next.config")))
    tech.push("Next.js");

  if (files.some(file => file.includes("tailwind.config")))
    tech.push("Tailwind CSS");

  if (files.some(file => file.includes("tsconfig.json")))
    tech.push("TypeScript");

  if (files.some(file => file.includes("dockerfile")))
    tech.push("Docker");

  if (files.some(file => file.includes("prisma")))
    tech.push("Prisma");

  return tech;
};