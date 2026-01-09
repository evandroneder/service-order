export type ValidationSchema<T> = {
  [K in keyof T]: {
    required?: boolean;
  };
};

export function validateRequiredFields<T>(
  body: Partial<T>,
  schema: ValidationSchema<T>
): { fields: string[]; missingFields: boolean; message: string } {
  const missingFields: string[] = [];

  for (const field in schema) {
    if (schema[field]?.required && !body[field as keyof T]) {
      missingFields.push(field);
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
