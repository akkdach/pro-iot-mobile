/**
 * Rename an image File to: {orderId}_{imageKey}_{timestamp}.{ext}
 * Example: 000012345_BEFORE_IMG_1710561851234.jpg
 */
export function renameImageFile(
  file: File,
  orderId: string,
  imageKey: string
): File {
  const ext = file.name.split(".").pop() || "jpg";
  const timestamp = Date.now();
  const newName = `${orderId}_${imageKey}_${timestamp}.${ext}`;

  return new File([file], newName, { type: file.type });
}
