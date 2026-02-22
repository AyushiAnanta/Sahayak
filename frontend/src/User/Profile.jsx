const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-10 bg-white shadow rounded-xl max-w-xl">
      <h2 className="text-2xl font-semibold">Profile</h2>
      <p className="mt-4"><b>Name:</b> {user.name}</p>
      <p className="text-sm text-gray-500 max-w-[160px] truncate">
  {user?.email}
</p>
      <p><b>Username:</b> {user.username}</p>
    </div>
  );
};

export default Profile;
