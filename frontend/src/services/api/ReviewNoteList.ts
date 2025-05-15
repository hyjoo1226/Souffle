import { api } from "@/services/api/Api";

export type Folder = {
  id: number;
  name: string;
  type: number;
  parent_id: null | number;
  problem_count?: number;
  children: Folder[];
};

export type ChildFolder = Folder & {
  problem_count: number;
};

type ReviewNoteUser = {
  try_count: number;
  correct_count: number;
  last_submission_id: number;
};

export type ReviewNoteItem = {
  problem_id: number;
  user_problem_id: number;
  category_name: string;
  inner_no: number;
  problem_type: number;
  user: ReviewNoteUser;
};

export type ReviewNoteList = ReviewNoteItem[] | null;

export type UnitSelectPayload = {
  chapter: string;
  section: string;
  type: number;
  unit: string | null;
  id: number;
};

// 즐겨찾기 폴더 조회
export const getFavoriteFoldersApi = async () => {
  // const token =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjcsIm5pY2tuYW1lIjoi7Iq57KO87J20IiwicHJvZmlsZUltYWdlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTHp1RDk4ekNabk9PNzFCdGhUUFFoM3RqTmFsMllRWG1HdkZXWEJVWGJYUlp1dnl3PXM5Ni1jIiwiaWF0IjoxNzQ3MTE4NzA3LCJleHAiOjE3NDcyMDUxMDd9.MdAibNyQhp0aYAp9k6Ve1Uo1Ybk4Z_sp4DeigTTmnGg";
  const response = await api.get("/notes/folder", {
    params: {
      type: 1,
    },
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  });
  return response.data;
};

// 오답 노트 폴더 조회
export const getReviewNoteFolderApi = async () => {
  // const token =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjcsIm5pY2tuYW1lIjoi7Iq57KO87J20IiwicHJvZmlsZUltYWdlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTHp1RDk4ekNabk9PNzFCdGhUUFFoM3RqTmFsMllRWG1HdkZXWEJVWGJYUlp1dnl3PXM5Ni1jIiwiaWF0IjoxNzQ3MTE4NzA3LCJleHAiOjE3NDcyMDUxMDd9.MdAibNyQhp0aYAp9k6Ve1Uo1Ybk4Z_sp4DeigTTmnGg";
  const response = await api.get("/notes/folder", {
    params: {
      type: 2,
    },
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  });
  return response.data;
};

export const createFolderApi = async (data: {
  name: string;
  type: number;
  parent_id: number | null;
}) => {
  // const token = localStorage.getItem("accessToken"); // 또는 쿠키 등

  const response = await api.post("/notes/folder", data, {
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  });
  return response.data;
};

export const updateFolderApi = async (
  sectionId: number,
  data: { name: string }
) => {
  // const token = localStorage.getItem("accessToken"); // 또는 쿠키 등

  await api.patch(`/notes/folder/${sectionId}`, data, {
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  });
};

export const deleteFolderApi = async (folderId: number) => {
  // const token = localStorage.getItem("accessToken"); // 또는 쿠키 등

  await api.delete(`/notes/folder/${folderId}`, {
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  });
};

export const getProblemListApi = async (type: number, id: number) => {
  // const token =
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjcsIm5pY2tuYW1lIjoi7Iq57KO87J20IiwicHJvZmlsZUltYWdlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTHp1RDk4ekNabk9PNzFCdGhUUFFoM3RqTmFsMllRWG1HdkZXWEJVWGJYUlp1dnl3PXM5Ni1jIiwiaWF0IjoxNzQ3MTE4NzA3LCJleHAiOjE3NDcyMDUxMDd9.MdAibNyQhp0aYAp9k6Ve1Uo1Ybk4Z_sp4DeigTTmnGg";
  const response = await api.get(`/notes/folder/${id}`, {
    params: {
      type: type,
    },
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  });
  return response.data;
};

export const deleteProblemApi = async (
  problemId: number,
  selectedType: number
) => {
  // const token = localStorage.getItem("accessToken");
  const response = await api.delete(`/notes/problem/${problemId}`, {
    params: {
      type: selectedType,
    },
  });
  return response.data;
};

export const moveToFavFolderApi = async (
  problemId: number,
  folderId: number,
  type: number
) => {
  const response = await api.patch(`/notes/problem/${problemId}`, {
    folderId,
    type,
  });
  return response.data;
};
