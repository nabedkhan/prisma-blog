import { Router } from "express";
import asyncHandler from "express-async-handler";

import { prisma } from "../prisma/client";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { email, name } = req.body as { email: string; name: string };

    const find = await prisma.user.findFirst({ cursor: { email } });

    if (find) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await prisma.user.create({
      data: { name, email },
    });

    res.json(user);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await prisma.user.findFirst({
      cursor: { id: userId },
    });

    if (!user) {
      res.status(400);
      throw new Error("User doesn't exists");
    }

    res.json(user);
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const find = await prisma.user.findFirst({
      cursor: { id: req.params.id },
    });

    if (!find) {
      throw new Error("User not available");
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(user);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const find = await prisma.user.findFirst({
      cursor: { id: userId },
    });

    if (!find) {
      throw new Error("User not available");
    }

    const user = await prisma.user.delete({ where: { id: userId } });
    res.json(user);
  })
);

export default router;
