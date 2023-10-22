import express, { NextFunction, Response, Request } from "express";

import router from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Server is running on port 5000");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // console.error(err.message);
  res.status(500).json({ message: err.message });
});

app.listen(5000, () => {
  console.log("Port listening on 5000");
});
