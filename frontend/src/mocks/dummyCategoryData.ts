// src/data/dummyCategoryData.ts

export const dummyCategoryData = [
  {
    id: 1,
    name: "공통수학1",
    type: 1,
    children: [
      {
        id: 10,
        name: "지수와 로그",
        type: 2,
        children: [
          { id: 100, name: "지수가 정수일 때의 지수법칙", type: 3 },
          { id: 101, name: "지수가 유리수일 때의 지수법칙", type: 3 },
          { id: 102, name: "로그의 뜻과 성질", type: 3 },
        ],
      },
      {
        id: 11,
        name: "수열",
        type: 2,
        children: [
          { id: 110, name: "등차수열", type: 3 },
          { id: 111, name: "등비수열", type: 3 },
          { id: 112, name: "수열의 합", type: 3 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "공통수학2",
    type: 1,
    children: [
      {
        id: 20,
        name: "삼각함수",
        type: 2,
        children: [
          { id: 200, name: "삼각비의 뜻", type: 3 },
          { id: 201, name: "삼각함수의 그래프", type: 3 },
        ],
      },
      {
        id: 21,
        name: "수학적 귀납법",
        type: 2,
        children: [
          { id: 210, name: "수학적 귀납법의 원리", type: 3 },
          { id: 211, name: "귀납법을 이용한 증명", type: 3 },
        ],
      },
    ],
  },
];
