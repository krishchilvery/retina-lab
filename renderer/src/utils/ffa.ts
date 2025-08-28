import cvReadyPromise from "@techstark/opencv-js";
import type { FileWithDate } from "../models";

/**
 * Load an image file, preprocess, and compute vessel density.
 * Pipeline: Grayscale → CLAHE → Blur → Adaptive Threshold → Count white pixels
 */
export interface VesselDensityResult {
  file: FileWithDate;
  image: HTMLImageElement;
  vesselDensity: number;
}

export const computeVesselDensityFromFile = async (
  file: FileWithDate
): Promise<VesselDensityResult> => {
  return new Promise(async (resolve, reject) => {
    const cv = await cvReadyPromise;
    const img = new Image();
    img.src = URL.createObjectURL(file.file);

    img.onload = async () => {
      try {
        // Read as Mat
        const mat = await cv.imread(img);

        // Grayscale
        const gray = new cv.Mat();
        cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);

        // CLAHE (contrast enhancement)
        const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
        const enhanced = new cv.Mat();
        clahe.apply(gray, enhanced);

        // Gaussian blur
        const blurred = new cv.Mat();
        cv.GaussianBlur(
          enhanced,
          blurred,
          new cv.Size(5, 5),
          1.4,
          0,
          cv.BORDER_DEFAULT
        );

        // Adaptive threshold
        const binary = new cv.Mat();
        cv.adaptiveThreshold(
          blurred,
          binary,
          255,
          cv.ADAPTIVE_THRESH_GAUSSIAN_C,
          cv.THRESH_BINARY,
          11,
          2
        );

        // Vessel density
        const white = cv.countNonZero(binary);
        const total = binary.rows * binary.cols;
        const vesselDensity = white / total;

        // Create a canvas to draw the result
        const canvas = document.createElement("canvas");
        canvas.width = binary.cols;
        canvas.height = binary.rows;
        cv.imshow(canvas, binary);

        const resultImage = new Image();
        resultImage.src = canvas.toDataURL();

        // Cleanup
        mat.delete();
        gray.delete();
        enhanced.delete();
        blurred.delete();
        clahe.delete();
        binary.delete();

        resolve({ file, image: resultImage, vesselDensity });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image file"));
  });
};
