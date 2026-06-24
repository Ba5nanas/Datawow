export default async function Page() {
  let users = [];

  try {
    const response = await fetch('http://backend:3000/users', {
      cache: 'no-store',
    });

    if (response.ok) {
      users = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }

  return (
    <main>
      <h1>Landing Page</h1>
      <section>
        <h2>Users</h2>
        {users.length > 0 ? (
          <ul>
            {users.map((user: any) => (
              <li key={user.id}>{user.fullName} - {user.email}</li>
            ))}
          </ul>
        ) : (
          <p>No users found</p>
        )}
      </section>
    </main>
  );
}
