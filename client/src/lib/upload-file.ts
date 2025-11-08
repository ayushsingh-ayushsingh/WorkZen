import { hc } from "hono/client";
import type { AppType } from "../../../server";

const client = hc<AppType>("/");

export async function uploadFile(file: File) {
  const reader = new FileReader();

  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file); // gives "data:<mimetype>;base64,...."
  });

  const response = await client.api.upload.$post({
    json: {
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      data: base64,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

