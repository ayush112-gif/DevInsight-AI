import { Router } from "express";

import { analyzeRepository } from "../controllers/repository.controller";

const router = Router();

router.post("/analyze", analyzeRepository);

export default router;
