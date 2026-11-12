interface PluralForms {
  one: string;
  few: string;
  many: string;
}

const rules = new Intl.PluralRules("ru-RU");

export function pluralize(count: number, forms: PluralForms): string {
  const category = rules.select(count);

  if (category === "one") return forms.one;
  if (category === "few") return forms.few;

  return forms.many;
}

export function formatTaskCount(count: number): string {
  return `${count} ${pluralize(count, { one: "задача", few: "задачи", many: "задач" })}`;
}
