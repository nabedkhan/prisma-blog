import { Router } from "express";
import userRoute from "./users";
import postsRoute from "./posts";

const router = Router();

router.use("/users", userRoute);
router.use("/posts", postsRoute);

export default router;
