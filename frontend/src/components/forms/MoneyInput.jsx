export default function MoneyInput({
  id, value, onChange, placeholder, autoFocus = false, invalid = false,
  danger = false, describedBy, disabled = false, label,
}) {
  return (
    <div className={`mx-auto flex max-w-[430px] items-center justify-center border-b-2 px-2 pb-3 transition-colors ${invalid || danger ? "border-red-400" : "border-gray-200 focus-within:border-black"}`}>
      <span aria-hidden="true" className="mr-2 text-[30px] font-semibold tracking-[-0.04em] text-gray-400 sm:text-[36px]">₱</span>
      <input
        id={id} type="number" inputMode="decimal" min="0" step="0.01"
        value={value} autoFocus={autoFocus} disabled={disabled}
        onKeyDown={(event) => { if (["e", "E", "+", "-"].includes(event.key)) event.preventDefault(); }}
        onChange={(event) => onChange(event.target.value)} placeholder={placeholder}
        aria-label={label} aria-invalid={invalid} aria-describedby={describedBy}
        className={`min-w-0 max-w-[300px] flex-1 bg-transparent text-center text-[38px] font-semibold tracking-[-0.055em] outline-none placeholder:text-gray-300 sm:text-[46px] ${invalid || danger ? "text-red-600" : "text-gray-950"}`}
      />
    </div>
  );
}
