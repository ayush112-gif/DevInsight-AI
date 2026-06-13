export interface RepositoryFile {
  path: string;
}

export interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  name?: string;
}

const dependencyTechnologyMap: Record<string, string> = {
  react: "React",
  next: "Next.js",
  express: "Express",
  "@nestjs/core": "NestJS",
  "@angular/core": "Angular",
  vue: "Vue",

  mongoose: "MongoDB",
  mongodb: "MongoDB",

  pg: "PostgreSQL",

  mysql: "MySQL",
  mysql2: "MySQL",

  prisma: "Prisma",
  "@prisma/client": "Prisma",

  tailwindcss: "Tailwind CSS",

  typescript: "TypeScript",

  vite: "Vite",

  "@types/node": "Node.js",
};

const addDependencyTechnologies = (
  technologies: Set<string>,
  manifest: PackageManifest | null,
): void => {
  if (!manifest) {
    return;
  }

  technologies.add("Node.js");

  const dependencies = [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
    ...Object.keys(manifest.engines ?? {}),
  ];

  dependencies.forEach((dependency) => {
    const technology = dependencyTechnologyMap[dependency];

    if (technology) {
      technologies.add(technology);
    }
  });
};

const addFileTechnologies = (
  technologies: Set<string>,
  files: RepositoryFile[],
): void => {
  const paths = files.map((file) => file.path.toLowerCase());
  const fileNames = paths.map(
    (path) => path.split("/").pop() ?? "",
  );

  if (fileNames.includes("tsconfig.json")) {
    technologies.add("TypeScript");
  }

  if (
    fileNames.includes("tailwind.config.js") ||
    fileNames.includes("tailwind.config.ts")
  ) {
    technologies.add("Tailwind CSS");
  }

  if (
    fileNames.includes("next.config.js") ||
    fileNames.includes("next.config.ts")
  ) {
    technologies.add("Next.js");
  }

  if (
    fileNames.includes("vite.config.ts") ||
    fileNames.includes("vite.config.js")
  ) {
    technologies.add("Vite");
  }

  if (
    fileNames.includes("schema.prisma") ||
    fileNames.includes("prisma.schema")
  ) {
    technologies.add("Prisma");
  }

  if (
    fileNames.includes("dockerfile") ||
    fileNames.includes("docker-compose.yml") ||
    fileNames.includes("docker-compose.yaml")
  ) {
    technologies.add("Docker");
  }

  if (fileNames.includes("angular.json")) {
    technologies.add("Angular");
  }

  if (
    fileNames.includes("vue.config.js") ||
    paths.some((path) => path.endsWith(".vue"))
  ) {
    technologies.add("Vue");
  }

  if (
    paths.some((path) => path.endsWith(".tsx")) ||
    paths.some((path) => path.endsWith(".jsx"))
  ) {
    technologies.add("React");
  }
};

export const detectTechnologies = (
  files: RepositoryFile[],
  manifest: PackageManifest | null,
): string[] => {
  const technologies = new Set<string>();

  addDependencyTechnologies(technologies, manifest);
  addFileTechnologies(technologies, files);

  if (technologies.size === 0) {
    technologies.add("Unknown");
  }

  return [...technologies].sort((a, b) =>
    a.localeCompare(b),
  );
};