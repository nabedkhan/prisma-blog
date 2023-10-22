import { Router } from "express";
import asyncHandler from "express-async-handler";

import { prisma } from "../prisma/client";

const router = Router();

interface Post {
  title: string;
  body: string;
  tags: string[];
  published?: boolean;
  categories?: string[];
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        body: true,
        userId: true,
        categories: true,
        tags: {
          select: { name: true, id: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(posts);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, body, published, tags, categories = [] } = req.body as Post;

    const find = await prisma.user.findMany({ select: { id: true } });

    const post = await prisma.post.create({
      data: {
        title,
        body,
        published,
        userId: find[Math.floor(Math.random() * find.length)].id,
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        categories: {
          connectOrCreate: categories.map((category) => ({
            where: { name: category },
            create: { name: category },
          })),
        },
      },
    });

    res.json(post);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const postId = req.params.id;

    const post = await prisma.post.findFirst({
      cursor: { id: postId },
      include: {
        tags: {
          select: { name: true, id: true },
        },
        user: {
          select: { email: true, name: true },
        },
        categories: {
          select: { name: true, id: true },
        },
      },
    });

    if (!post) {
      res.status(400);
      throw new Error("Post doesn't exists");
    }

    res.json(post);
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const postId = req.params.id;

    const find = await prisma.post.findFirst({
      cursor: { id: postId },
    });

    if (!find) {
      throw new Error("Post not available");
    }

    const { body, categories, published, tags, title } = req.body as Partial<Post>;

    const updatePost = await prisma.post.update({
      where: { id: postId },
      data: {
        body,
        title,
        published,
        tags: {
          // set: [{ name: "react" }, { name: "nextjs" }, { name: "angular" }],
          // disconnect: { name: "angular" },
          // connectOrCreate: tags?.map((tag) => ({
          //   where: { name: tag },
          //   create: { name: tag },
          // })),
          set: tags?.map((tag) => ({ name: tag })),
        },
        categories: {
          // connectOrCreate: categories?.map((category) => ({
          //   where: { name: category },
          //   create: { name: category },
          // })),
          set: categories?.map((tag) => ({ name: tag })),
        },
      },
    });

    res.json(updatePost);
  })
);

// router.delete(
//   "/:id",
//   asyncHandler(async (req, res) => {
//     const userId = req.params.id;
//     const find = await prisma.user.findFirst({
//       cursor: { id: userId },
//     });

//     if (!find) {
//       throw new Error("User not available");
//     }

//     const user = await prisma.user.delete({ where: { id: userId } });
//     res.json(user);
//   })
// );

export default router;
