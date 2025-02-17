function createDummyPosts() {
  const existingPosts = localStorage.getItem("posts");
  if (existingPosts) {
    return;
  }

  const dummyUsers = [
    {
      email: "user1@example.com",
      nickname: "행복한 코더", // 닉네임 추가
      profileImage: "../photo/profile_mumu.jpeg",
    },
    {
      email: "user2@example.com",
      nickname: "즐거운 개발자", // 닉네임 추가
      profileImage: "../photo/profile_mumu.jpeg",
    },
    {
      email: "user3@example.com",
      nickname: "열정 프로그래머", // 닉네임 추가
      profileImage: "../photo/profile_mumu.jpeg",
    },
  ];

  localStorage.setItem("users", JSON.stringify(dummyUsers));

  const dummyPosts = [
    {
      id: "1",
      title: "첫 번째 게시글입니다!",
      content: "안녕하세요. 첫 번째 게시글의 내용입니다. 반갑습니다!",
      authorEmail: "user1@example.com",
      authorNickname: "행복한 코더", // 닉네임 추가
      createdAt: "2024-02-15T10:00:00.000Z",
      likes: 5,
      views: 10,
      comments: [
        {
          id: "c1",
          authorEmail: "user2@example.com",
          authorNickname: "즐거운 개발자", // 닉네임 추가
          content: "첫 번째 댓글입니다!",
          createdAt: "2024-02-15T10:30:00.000Z",
        },
      ],
    },
    {
      id: "2",
      title: "오늘의 날씨가 정말 좋네요",
      content: "날씨가 맑고 화창해서 기분이 좋습니다.",
      authorEmail: "user2@example.com",
      authorNickname: "즐거운 개발자", // 닉네임 추가
      createdAt: "2024-02-16T09:00:00.000Z",
      likes: 3,
      views: 7,
      comments: [],
    },
    {
      id: "3",
      title: "JavaScript 스터디 모집합니다!",
      content:
        "함께 JavaScript를 공부할 분들을 모집합니다. 관심 있으신 분들은 댓글 남겨주세요.",
      authorEmail: "user3@example.com",
      authorNickname: "열정 프로그래머", // 닉네임 추가
      createdAt: "2024-02-16T15:00:00.000Z",
      likes: 8,
      views: 15,
      comments: [
        {
          id: "c2",
          authorEmail: "user1@example.com",
          authorNickname: "행복한 코더", // 닉네임 추가
          content: "저도 참여하고 싶습니다!",
          createdAt: "2024-02-16T15:30:00.000Z",
        },
        {
          id: "c3",
          authorEmail: "user2@example.com",
          authorNickname: "즐거운 개발자", // 닉네임 추가
          content: "어떤 방식으로 진행되나요?",
          createdAt: "2024-02-16T16:00:00.000Z",
        },
      ],
    },
    {
      id: "4",
      title: "주말에 읽은 좋은 책 추천합니다",
      content: "이번 주말에 읽은 책인데 정말 좋았어요. 다들 한번 읽어보세요!",
      authorEmail: "user1@example.com",
      authorNickname: "행복한 코더", // 닉네임 추가
      createdAt: "2024-02-17T11:00:00.000Z",
      likes: 12,
      views: 20,
      comments: [],
    },
    {
      id: "5",
      title: "새로운 프로젝트 시작했습니다",
      content:
        "드디어 새로운 프로젝트를 시작하게 되었네요. 열심히 해보겠습니다!",
      authorEmail: "user2@example.com",
      authorNickname: "즐거운 개발자", // 닉네임 추가
      createdAt: "2024-02-17T14:00:00.000Z",
      likes: 6,
      views: 11,
      comments: [
        {
          id: "c4",
          authorEmail: "user3@example.com",
          authorNickname: "열정 프로그래머", // 닉네임 추가
          content: "화이팅하세요!!",
          createdAt: "2024-02-17T14:30:00.000Z",
        },
      ],
    },
  ];

  localStorage.setItem("posts", JSON.stringify(dummyPosts));
}

document.addEventListener("DOMContentLoaded", createDummyPosts);
