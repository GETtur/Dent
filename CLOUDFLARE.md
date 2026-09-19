# DentalOS — Cloudflare Pages

## Что исправлено

Тесты и флешкарточки больше не зависят от `/api/*` и Cloudflare D1 для первичной загрузки. Стартовые данные берутся из `db.json`, а прогресс, добавленные тесты/карточки и заметки сохраняются в `localStorage` браузера.

Это позволяет развернуть DentalOS как обычный статический Vite-сайт на Cloudflare Pages или Netlify без отдельного сервера.

## Cloudflare Pages

- Framework preset: **Vite**
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: 18+ (рекомендуется актуальная LTS)

После изменения исходников Cloudflare сам выполнит сборку и отдаст содержимое `dist`.

## Важно

Папку `node_modules` в проект загружать не нужно. Cloudflare устанавливает зависимости сам.

Файл `db.json` должен оставаться в корне проекта: `src/data.ts` импортирует его как стартовую учебную базу.

## Почему старый вариант ломался

Ранее `Flashcards.tsx` запрашивал `/api/flashcards` и `/api/study-state`. Эти маршруты требуют работающий backend/D1 binding. В статическом deployment такой backend не гарантирован, поэтому страница оставалась в состоянии загрузки.

`Tests.tsx` одновременно содержал только 3 демо-вопроса вместо полной базы из `db.json`.
