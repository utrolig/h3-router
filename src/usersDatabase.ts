type User = {
  id: number;
  name: string;
};

export const users: User[] = [];

let userId = 1;

for (; userId <= 20; userId++) {
  const user: User = {
    id: userId,
    name: `User ${userId}`,
  };

  users.push(user);
}

export const addUser = (name: string) => {
  const user: User = {
    id: userId++,
    name,
  };

  users.push(user);

  return user;
};
