import type { Dayjs } from "dayjs";

export type FileWithDate = {
  dateCaptured: Dayjs;
  file: File;
  fileId: string;
};
