import { apiClient } from "@/lib/apiClient";

export interface ImageUploadResponse {
  data: {
    path: string;
  };
}

export const uploadsApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    return apiClient<ImageUploadResponse>("/api/admin/uploads/image", {
      method: "POST",
      body: formData,
      withCsrf: true,
    });
  },
};
