import { DOCUMENT_TYPE_LIST, type DocumentTypeId } from "@/lib/documentTypes";

interface DocumentTypePickerProps {
  value: DocumentTypeId;
  onChange: (value: DocumentTypeId) => void;
}

/** Radio list for choosing which kind of document to draft. */
export function DocumentTypePicker({ value, onChange }: DocumentTypePickerProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">Document type</legend>
      <div className="mt-2 grid gap-2">
        {DOCUMENT_TYPE_LIST.map((type) => (
          <label
            key={type.id}
            className="flex cursor-pointer items-start gap-3 rounded border border-rule bg-paper p-3 has-[:checked]:border-accent has-[:checked]:bg-accent/5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-accent"
          >
            <input
              id={`field-documentType-${type.id}`}
              type="radio"
              name="documentType"
              value={type.id}
              checked={value === type.id}
              onChange={() => onChange(type.id)}
              className="mt-1 accent-accent"
            />
            <span>
              <span className="block text-sm font-semibold">{type.label}</span>
              <span className="block text-sm text-muted">
                {type.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
