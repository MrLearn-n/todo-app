@AGENTS.md

# CLAUDE.md

Инструкции для AI-агентов (Claude Code и др.), работающих с этим репозиторием.

## Что это

Одностраничный To-Do List на **Next.js 16 (App Router) + React 19 + TypeScript + shadcn/ui**.
Бэкенда нет: задачи хранятся в `localStorage` браузера. Интерфейс на русском.

## Команды

```bash
npm run dev          # dev-сервер на http://localhost:3000
npm run build        # production-сборка (страница пререндерится статически)
npm run check        # lint + typecheck + format:check + test — запускать перед каждым коммитом
npm test             # Vitest, один прогон
npm run test:watch   # Vitest в watch-режиме
npm run format       # Prettier (+ сортировка Tailwind-классов)
npx shadcn@latest add <component>   # добавить компонент shadcn в src/components/ui
```

Задача считается выполненной, только когда `npm run check` и `npm run build` проходят без ошибок.

## Структура

```
src/
├── app/                   # Роутинг Next.js: layout, page, globals.css (токены темы)
├── components/            # Единственная папка компонентов
│   ├── ui/                # Примитивы shadcn/ui — генерируются CLI, руками не переписываем
│   ├── TaskManager.tsx   # Корневой клиентский компонент ("use client"), собирает экран
│   ├── AddTaskForm.tsx
│   ├── TaskList.tsx
│   ├── TaskItem.tsx
│   └── TaskSummary.tsx
├── hooks/useTasks.ts     # useSyncExternalStore поверх стора
└── lib/
    ├── tasks.ts           # Тип Task + чистые функции (add/toggle/remove/filter…)
    ├── task-storage.ts    # Сериализация и защищённый парсинг localStorage
    ├── task-store.ts      # Стор: состояние + сохранение + синхронизация вкладок
    └── plural.ts          # Русская плюрализация
tests/                     # Все тесты, структура повторяет src/
├── setup.ts
├── components/
└── lib/
```

Данные идут в одну сторону: **компонент → метод стора → чистая функция из `lib/tasks.ts` →
запись в storage → уведомление подписчиков → ререндер.**

## Ключевые решения — не ломать

- **`useSyncExternalStore`, а не `useState` + `useEffect`.** На сервере `getServerSnapshot()`
  возвращает `null`, и рендерится скелетон; на клиенте читается `localStorage`. Так нет ошибок
  гидрации и нет вспышки пустого состояния.
- **`getSnapshot()` обязан возвращать ту же ссылку, пока данные не изменились**, иначе React уйдёт в
  бесконечный ререндер. Состояние меняется только через `updateTasks()` в `task-store.ts`.
- **Логика в `lib/tasks.ts` чистая и иммутабельная**: не мутирует входные данные и не трогает
  React, DOM или storage.
- **Хранилище недоверенное.** `parseTasks` отбрасывает невалидные записи. Ошибка записи (квота,
  приватный режим) логируется через `console.warn`, а приложение продолжает работать в памяти.
- **Стор внедряется через проп** `<TaskManager store={…} />`, по умолчанию берётся синглтон
  `taskStore`. В тестах всегда создавайте новый стор через `createTaskStore()`; другое хранилище
  передаётся первым аргументом: `createTaskStore(() => fakeStorage)`.
- **Адаптив**: mobile-first, основная точка перелома — `sm`. На узких экранах вторичный текст
  кнопок скрывается (`max-sm:hidden` / `max-sm:sr-only`), но доступное имя остаётся полным
  (`aria-label`). Для сенсорных экранов крупные зоны нажатия задаются через `pointer-coarse:`.
- Ключ хранилища версионирован: `tasks:v1`. При несовместимом изменении формата `Task` поднимите
  версию или добавьте миграцию в `parseTasks`.

## Соглашения по коду

- TypeScript `strict`, без `any`. Внешние данные — `unknown` + type guard.
- **Пропсы и объектные типы описываем через `interface`**; `type` — только для union и производных
  типов (`TaskFilter`).
- **UI — только shadcn/ui, иконки — только `lucide-react`.** Не пишем свои кнопки, инпуты и SVG.
  Нужен новый примитив — добавляем его через `npx shadcn@latest add`.
- Компоненты приложения лежат плоско в `src/components/`, вложенных папок `components` нет.
- Именование файлов:
  - компоненты — `PascalCase`, имя файла совпадает с компонентом (`TaskItem.tsx` →
    `export function TaskItem`);
  - хуки — `camelCase` с префиксом `use` (`useTasks.ts`);
  - модули в `lib/` — `kebab-case` (`task-store.ts`);
  - исключение — `components/ui/`: файлы shadcn остаются в `kebab-case`, как их генерирует CLI.
- Только именованные экспорты, без `export default` (кроме файлов-конвенций Next.js в `app/`).
- `"use client"` только в `TaskManager.tsx`; дочерние компоненты наследуют клиентский режим.
- Цвета — только токены темы shadcn (`bg-background`, `text-muted-foreground`, `border`,
  `text-destructive`…) из `src/app/globals.css`. Тёмная тема включается по системной настройке
  (`prefers-color-scheme`), хардкод цветов запрещён.
- Доступность: у каждого интерактивного элемента есть доступное имя (`aria-label` или видимый
  текст).
- Пустые строки между логическими блоками обязательны: перед `return`, после объявлений
  переменных, вокруг `if` и многострочных блоков. Это проверяет правило
  `@stylistic/padding-line-between-statements` в `eslint.config.mjs`, а `npx eslint --fix .`
  расставляет их автоматически.
- Обработчики событий называем в стиле `on<Действие>`: `onSubmit`, `onStartEdit`,
  `onFinishEdit`, `onEditKeyDown`, `onStorageEvent`. Префикс `handle*` не используем.
- Составные условия в `if` выносим в переменные с говорящими именами (`isTitleChanged`,
  `affectsTasks`), а в `if` оставляем только имя переменной.
- Импорты сгруппированы и разделены пустой строкой: React/Next → внешние пакеты → `@/components/ui`
  → остальные `@/…` → относительные `./…` → стили. Порядок проверяет и чинит
  `eslint-plugin-simple-import-sort` (`npx eslint --fix .`).
- Комментариев в коде нет. Намерение выражаем через имена функций и переменных
  (например, `tryPersist` вместо пустого `catch` с пояснением).

## Тесты

- Vitest + Testing Library + jsdom. Все тесты лежат в `tests/` и повторяют структуру `src/`;
  импорты из кода — через алиас `@/`.
- `localStorage` очищается после каждого теста (`tests/setup.ts`).
- В тестах компонентов элементы ищем по ролям и доступным именам (`getByRole`, `getByLabelText`),
  а не по классам или test-id.
- Новая логика в `lib/` → юнит-тест в `tests/lib/`; новое поведение UI → тест в
  `tests/components/TaskManager.test.tsx`.

## Git

- Коммиты без строк `Co-Authored-By` и прочей AI-атрибуции.
- Автор коммитов — `mrlearn <learnmr67@gmail.com>` (задан в локальном git config).

## Next.js 16

Это свежая версия Next.js, многое отличается от данных обучения модели. Перед использованием
незнакомого API читайте документацию в `node_modules/next/dist/docs/` (см. `AGENTS.md`).
`AGENTS.md` частично перезаписывается командой `next dev`, поэтому правила проекта держим здесь, в
`CLAUDE.md`.
