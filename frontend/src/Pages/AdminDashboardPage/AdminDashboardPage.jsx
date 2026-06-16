import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";

export default function AdminDashboardPage() {
  const {
    authUser,
    pendingUsers,
    userApprovalRecords,
    isLoadingPendingUsers,
    isLoadingUserApprovalRecords,
    fetchPendingUsers,
    fetchPendingUsersByCollege,
    fetchUserApprovalRecords,
    approveUser,
    approveUserByCollege,
    rejectUser,
    rejectUserByCollege,
  } = useAuthStore();

  const isSystemAdmin =
    authUser?.role === "system_admin" || authUser?.role === "admin";
  const isCollegeAdmin = authUser?.role === "college_admin";

  useEffect(() => {
    if (isSystemAdmin) {
      fetchPendingUsers();
      fetchUserApprovalRecords();
    }
    if (isCollegeAdmin) {
      fetchPendingUsersByCollege();
    }
  }, [
    isSystemAdmin,
    isCollegeAdmin,
    fetchPendingUsers,
    fetchPendingUsersByCollege,
    fetchUserApprovalRecords,
  ]);

  if (!isSystemAdmin && !isCollegeAdmin) {
    return (
      <div className="text-white p-6">
        <h2 className="text-2xl font-bold">Unauthorized</h2>
        <p className="text-gray-400 mt-2">Only admins can access this page.</p>
      </div>
    );
  }

  const approveAction = isCollegeAdmin ? approveUserByCollege : approveUser;
  const rejectAction = isCollegeAdmin ? rejectUserByCollege : rejectUser;
  const handleRefresh = () => {
    if (isSystemAdmin) {
      fetchPendingUsers();
      fetchUserApprovalRecords();
      return;
    }
    if (isCollegeAdmin) {
      fetchPendingUsersByCollege();
    }
  };

  return (
    <div className="text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {isCollegeAdmin ? "College Admin Dashboard" : "Admin Dashboard"}
          </h1>
          {isCollegeAdmin && (
            <p className="text-gray-400 text-sm mt-1">
              {authUser?.collegeName || "Your college"}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-sm"
        >
          Refresh
        </button>
      </div>

      {isLoadingPendingUsers ? (
        <p className="text-gray-400">Loading pending requests...</p>
      ) : pendingUsers.length === 0 ? (
        <p className="text-gray-400">No pending registration requests.</p>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map((user) => (
            <div
              key={user._id}
              className="border border-gray-700 rounded-lg p-4 bg-[#111111]"
            >
              <div className="mb-3">
                <p className="font-semibold">{user.fullname}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
                <p className="text-gray-400 text-sm">{user.collegeName}</p>
                <p className="text-gray-400 text-sm capitalize">
                  Selected role: {user.role}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => approveAction(user._id)}
                  className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    const reason = window.prompt(
                      "Enter rejection reason to share with user:",
                    );

                    if (!reason || !reason.trim()) {
                      return;
                    }

                    rejectAction(user._id, reason.trim());
                  }}
                  className="px-3 py-2 rounded bg-red-600 hover:bg-red-500 text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isSystemAdmin && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">
            All User Approval Records
          </h2>

          {isLoadingUserApprovalRecords ? (
            <p className="text-gray-400">Loading user records...</p>
          ) : userApprovalRecords.length === 0 ? (
            <p className="text-gray-400">No user records found.</p>
          ) : (
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <div className="grid grid-cols-6 gap-2 px-4 py-3 bg-gray-900 text-sm font-semibold">
                <p>Name</p>
                <p>Email</p>
                <p>Role</p>
                <p>Status</p>
                <p>Reject Reason</p>
                <p>Created</p>
              </div>
              {userApprovalRecords.map((user) => (
                <div
                  key={user._id}
                  className="grid grid-cols-6 gap-2 px-4 py-3 border-t border-gray-800 text-sm"
                >
                  <p className="truncate">{user.fullname}</p>
                  <p className="truncate text-gray-300">{user.email}</p>
                  <p className="capitalize text-gray-300">
                    {user.role || "unassigned"}
                  </p>
                  <p className="capitalize text-gray-300">
                    {user.approvalStatus || "pending"}
                  </p>
                  <p className="truncate text-gray-300">
                    {user.rejectionReason || "-"}
                  </p>
                  <p className="text-gray-400">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
