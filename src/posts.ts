type PostComment = {
  id: number;
  text: string;
};

type Post = {
  id: number;
  title: string;
  comments: PostComment[];
};

export const posts: Post[] = [];

let postIdx = 1;

for (; postIdx <= 20; postIdx++) {
  const post: Post = {
    id: postIdx,
    title: `Post ${postIdx}`,
    comments: [],
  };

  for (let j = 1; j <= 3; j++) {
    post.comments.push({
      id: j,
      text: `Comment ${j} for post ${postIdx}`,
    });
  }

  posts.push(post);
}

export const addPost = (title: string) => {
  const post: Post = {
    id: postIdx++,
    title,
    comments: [],
  };

  posts.push(post);

  return post;
};
