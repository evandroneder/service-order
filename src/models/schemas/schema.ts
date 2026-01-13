export type ValidationSchema<T> = {
  [K in keyof T]: {
    required?: boolean;
    type?: "array";
  };
};

export function validateRequiredFields<T>(
  body: Partial<T>,
  schema: ValidationSchema<T>
): { fields: string[]; missingFields: boolean; message: string } {
  const missingFields: string[] = [];

  for (const field in schema) {
    const isRequired = schema[field]?.required;
    const fieldValue = body[field as keyof T];
    const hasValue = !!fieldValue;
    const isArray = schema[field]?.type === "array";

    if (isRequired && !hasValue) {
      missingFields.push(field);
      continue;
    }

    if (
      isArray &&
      isRequired &&
      hasValue &&
      (fieldValue as Array<T>).length === 0
    ) {
      missingFields.push(field);
      continue;
    }
  }

  if (missingFields.length > 0) {
    return {
      fields: missingFields,
      missingFields: true,
      message: `Required fields: ${missingFields.join(", ")}`,
    };
  }

  return {
    fields: [],
    missingFields: false,
    message: "",
  };
}
