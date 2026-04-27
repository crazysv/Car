interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "tel" | "email" | "date" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  className?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  options,
  className = "",
}: FormFieldProps) {
  const fieldStyles =
    "w-full px-4 py-3 font-body-sm font-bold bg-surface border border-outline text-primary placeholder:text-outline/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200";

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block font-body-sm font-bold text-primary mb-2"
      >
        {label}
        {required && <span className="text-secondary ml-1">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          required={required}
          rows={4}
          className={`${fieldStyles} resize-none`}
        />
      ) : type === "select" && options ? (
        <select
          id={name}
          name={name}
          required={required}
          className={fieldStyles}
          defaultValue=""
        >
          <option value="" disabled className="text-outline/60">
            {placeholder || "Select an option"}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-primary font-bold">
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className={fieldStyles}
        />
      )}
    </div>
  );
}
