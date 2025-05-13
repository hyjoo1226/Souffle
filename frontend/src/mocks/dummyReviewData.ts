export const mockFavoriteFolderData = [
  {
    id: 1,
    name: "즐겨찾기",
    type: 1,
    parent_id: null,
    children: [
      {
        id: 5,
        name: "하위폴더1",
        type: 1,
        problem_count: 1,
        parent_id: 1,
        children: [],
      },
      {
        id: 6,
        name: "하위폴더2",
        type: 1,
        problem_count: 1,
        parent_id: 1,
        children: [],
      },
    ],
  },
];

export const mockReviewNoteFolderData = [
  {
    id: 2,
    name: "오답노트",
    type: 2,
    parent_id: null,
    children: [
      {
        id: 7,
        name: "단원별 오답",
        type: 2,
        problem_count: 1,
        parent_id: 2,
        children: [],
      },
      {
        id: 8,
        name: "모의고사 오답",
        type: 2,
        problem_count: 1,
        parent_id: 2,
        children: [
          {
            id: 9,
            name: "6월 모평",
            type: 2,
            parent_id: 8,
            children: [],
          },
          {
            id: 10,
            name: "9월 모평",
            type: 2,
            parent_id: 8,
            children: [],
          },
        ],
      },
    ],
  },
];
