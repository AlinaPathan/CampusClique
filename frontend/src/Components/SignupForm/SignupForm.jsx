import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const fieldClassName =
  "w-full h-12 px-3 rounded bg-gray-800 outline-none text-white placeholder-gray-500 text-sm leading-5";

const COLLEGE_OPTIONS = [
  "JSPM's Bhivarabai Sawant Institute of Technology and Research",
  "JSPM's University",
  "ASSIMS",
  "PICT",
  "COEP",
];

const getRoleFields = (role) => {
  if (role === "student") {
    return [
      { name: "fullname", placeholder: "Full Name", type: "text" },
      { name: "email", placeholder: "Email", type: "email" },
      { name: "password", placeholder: "Password", type: "password" },
      {
        name: "rePassword",
        placeholder: "Confirm Password",
        type: "password",
      },
      { name: "collegeName", placeholder: "College Name", type: "text" },
    ];
  }

  if (role === "mentor") {
    return [
      { name: "fullname", placeholder: "Full Name", type: "text" },
      { name: "collegeName", placeholder: "College Name", type: "text" },
      { name: "email", placeholder: "Email", type: "email" },
      { name: "password", placeholder: "Password", type: "password" },
      {
        name: "rePassword",
        placeholder: "Confirm Password",
        type: "password",
      },
      { name: "expertise", placeholder: "Expertise", type: "text" },
      {
        name: "yearsOfExperience",
        placeholder: "Years of Experience",
        type: "number",
      },
      {
        name: "linkedinUrl",
        placeholder: "LinkedIn Profile",
        type: "text",
      },
    ];
  }

  return [
    { name: "collegeName", placeholder: "College Name", type: "text" },
    {
      name: "email",
      placeholder: "Official College Email",
      type: "email",
    },
    { name: "password", placeholder: "Password", type: "password" },
    {
      name: "rePassword",
      placeholder: "Confirm Password",
      type: "password",
    },
    { name: "collegeCode", placeholder: "College Code", type: "text" },
  ];
};

export default function SignupForm({ role, isLoading, onBack, onSubmit }) {
  const [formData, setFormData] = useState({
    fullname: "",
    collegeName: "",
    email: "",
    password: "",
    rePassword: "",
    expertise: "",
    yearsOfExperience: "",
    linkedinUrl: "",
    collegeCode: "",
  });

  const fields = useMemo(() => getRoleFields(role), [role]);

  const validateForm = () => {
    for (const field of fields) {
      if (!String(formData[field.name] ?? "").trim()) {
        toast.error(`${field.placeholder} is required`);
        return false;
      }
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.rePassword) {
      toast.error("Passwords must match");
      return false;
    }

    if (
      role === "mentor" &&
      Number.isNaN(Number(formData.yearsOfExperience || "0"))
    ) {
      toast.error("Years of experience must be a number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    await onSubmit({
      ...formData,
      role,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md flex flex-col gap-4"
    >
      <button
        type="button"
        onClick={onBack}
        className="text-left text-sm text-gray-400 hover:text-white"
      >
        ← Back to role selection
      </button>

      {fields.map((field) => (
        <div key={field.name}>
          {field.name === "collegeName" ? (
            <select
              value={formData[field.name]}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: event.target.value,
                }))
              }
              className={`${fieldClassName} ${
                formData[field.name] ? "text-white" : "text-gray-500"
              } appearance-none`}
            >
              <option value="">Select College</option>
              {COLLEGE_OPTIONS.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              min={field.type === "number" ? "0" : undefined}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: event.target.value,
                }))
              }
              className={fieldClassName}
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-linear-to-r from-[#1BF0FF] to-[#144DFB] hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
