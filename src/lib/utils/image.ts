export const uploadImage: (file: File) => Promise<string> = async (
  file: File,
) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Cria novo FormData para o ImageKit
  const imageKitForm = new FormData();
  imageKitForm.append(
    "file",
    new Blob([buffer], { type: file.type }),
    file.name,
  );
  imageKitForm.append("fileName", file.name);

  const auth = Buffer.from(`${process.env.IMAGE_CDN_PRIVATE_KEY}:`).toString(
    "base64",
  );

  const response = await fetch(process.env.IMAGE_CDN_URL!, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
    },
    body: imageKitForm,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const json = (await response.json()) as { url: string; filePath: string };
  return json.filePath;
};

export const buildImageUrl = (path: string | null) => {
  if (!process.env.IMAGE_CDN_IMAGE_BASE_URL || !path) {
    return null;
  }
  return `${process.env.IMAGE_CDN_IMAGE_BASE_URL}/${path}`;
};
