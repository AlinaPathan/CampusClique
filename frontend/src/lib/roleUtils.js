export const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "mentor", label: "Mentor" },
];

export const getDashboardPathByRole = (role) => {
  switch (role) {
    case "student":
      return "/student-dashboard";
    case "mentor":
      return "/mentor-dashboard";
    case "admin":
    case "system_admin":
    case "college_admin":
      return "/admin-dashboard";
    default:
      return "/";
  }
};

export const getRoleBadge = (role) => {
  switch (role) {
    case "student":
      return { text: "STUDENT", className: "bg-blue-600 text-white" };
    case "mentor":
      return { text: "MENTOR", className: "bg-green-600 text-white" };
    case "admin":
    case "system_admin":
    case "college_admin":
      return { text: "ADMIN", className: "bg-red-600 text-white" };
    default:
      return { text: "USER", className: "bg-gray-600 text-white" };
  }
};
