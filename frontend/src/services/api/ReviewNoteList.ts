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
  const response = await api.get("/notes/folder", {
    params: {
      type: 1,
    },
  });
  return response.data;
};

// 오답 노트 폴더 조회
export const getReviewNoteFolderApi = async () => {
  const response = await api.get("/notes/folder", {
    params: {
      type: 2,
    },
  });
  return response.data;
};

export const createFolderApi = async (data: {
  name: string;
  type: number;
  parent_id: number | null;
}) => {
  const response = await api.post("/notes/folder", data);
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

export const getProblemListApi = async (type: number, folderId: number) => {
  const response = await api.get(`/notes/folder/${folderId}/problem`, {
    params: {
      type: type,
    },
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
