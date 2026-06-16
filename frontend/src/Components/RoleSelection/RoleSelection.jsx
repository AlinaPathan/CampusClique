import { ROLE_OPTIONS } from "../../lib/roleUtils";

export default function RoleSelection({ selectedRole, onSelectRole }) {
  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      <h3 className="text-xl font-semibold text-white text-center mb-2">
        Select your role
      </h3>
      {ROLE_OPTIONS.map((role) => (
        <button
          key={role.value}
          type="button"
          onClick={() => onSelectRole(role.value)}
          className={`w-full p-3 rounded-lg border transition ${
            selectedRole === role.value
              ? "border-blue-500 bg-gray-800"
              : "border-gray-700 bg-gray-900 hover:bg-gray-800"
          }`}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
