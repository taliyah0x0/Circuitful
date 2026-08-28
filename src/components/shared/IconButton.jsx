import "./shared.css";

export default function IconButton({
  icon: Icon,
  label,
  active,
  danger,
  size = 18,
  onClick,
  disabled,
  ...rest
}) {
  return (
    <button
      type="button"
      className={`icon-btn${active ? " icon-btn--active" : ""}${danger ? " icon-btn--danger" : ""}`}
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      <Icon size={size} />
    </button>
  );
}
