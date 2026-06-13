import { Router } from "express";

import healthRoutes from "./health.routes";
import repositoryRoutes from "./repository.routes";

const router = Router();

router.use("/", healthRoutes);
router.use("/api/repository", repositoryRoutes);

export default router;
