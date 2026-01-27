import { createUploadthing, type FileRouter } from "uploadthing/express";
import Logger from "./logger.js";

const f = createUploadthing();

export const uploadRouter: FileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete((data) => {
    Logger.info("Image uploaded succesfully");
  }),
};

export type OurFileRouter = typeof uploadRouter;
