# Архитектура проекта

## Обзор

### Система состоит из двух независимых проектов в монорепозитории:
- frontend — основное приложение сайта пиццерии написанное с помощью фреймворка Next.js с публичной частью, API-эндпоинтами и админ-панелью.
- ui-library — библиотека UI-компонентов.

### frontend — основное приложение сайта пиццерии
frontend/  
├── eslint.config.mjs  
├── next-env.d.ts  
├── next.config.ts  
├── package.json   
├── public/  
│   ├── addons/ — Изображения добавок для пицц
│   ├── temp-uploads/ — Временные загруженные файлы (до подтверждения)
│   ├── uploads/ — Постоянные загруженные файлы 
│   ├── logo-admin.svg  
│   ├── logo-sm.png  
│   ├── logo.png    
├── src/  
│   ├── app/ — Папка с роутингом Next.js: страницы, layouts и API-роуты
│   │   ├── (admin)/  
│   │   │   ├── admin/  
│   │   │   │   ├── dashboard/  
│   │   │   │   │   ├── DashboardAside.tsx  
│   │   │   │   │   ├── layout.module.scss  
│   │   │   │   │   ├── layout.tsx  
│   │   │   │   │   ├── menu/  
│   │   │   │   │   │   ├── AdminMenu.module.scss  
│   │   │   │   │   │   ├── AdminMenuClient.tsx  
│   │   │   │   │   │   ├── CommonModal.module.scss  
│   │   │   │   │   │   ├── ProductModal.module.scss  
│   │   │   │   │   │   ├── ProductModal.tsx  
│   │   │   │   │   │   ├── SectionModal.module.scss  
│   │   │   │   │   │   ├── SectionModal.tsx  
│   │   │   │   │   │   └── page.tsx  
│   │   │   │   │   └── page.tsx  
│   │   │   │   └── orders/ — Управление заказами в админке (просмотр и изменение статусов)
│   │   │   │       ├── page.module.scss 
│   │   │   │       └── page.tsx  
│   │   │   │   └── login/  
│   │   │   │       ├── AdminLoginForm.tsx  
│   │   │   │       ├── page.module.scss  
│   │   │   │       └── page.tsx  
│   │   │   └── layout.tsx  
│   │   ├── (public)/  
│   │   │   ├── checkout/ — Страница оформления заказа
│   │   │   │   ├── page.module.scss  
│   │   │   │   └── page.tsx  
│   │   │   ├── Home.module.scss  
│   │   │   ├── favicon.ico  
│   │   │   ├── layout.tsx  
│   │   │   └── page.tsx  
│   │   ├── api/ — API-роуты Next.js для бэкенда 
│   │   │   ├── auth/[...nextauth]/route.ts  
│   │   │   ├── cleanup-temp/route.ts  
│   │   │   ├── menu-product/  
│   │   │   │   ├── [id]/route.ts  
│   │   │   │   └── route.ts  
│   │   │   ├── menu-section/  
│   │   │   │   ├── [id]/route.ts  
│   │   │   │   └── route.ts  
│   │   │   ├── orders/  
│   │   │   │   ├── [id]/route.ts 
│   │   │   │   └── route.ts  
│   │   │   └── upload/route.ts  
│   │   └── globals.scss  
│   ├── components/  
│   │   ├── admin-product-card/  
│   │   │   ├── AdminProductCard.module.scss  
│   │   │   └── AdminProductCard.tsx  
│   │   ├── cart/  
│   │   │   ├── Cart.module.scss  
│   │   │   └── Cart.tsx  
│   │   ├── cart-item/  
│   │   │   ├── CartItem.module.scss  
│   │   │   └── CartItem.tsx  
│   │   ├── configure-product-modal/  
│   │   │   ├── ConfigureProductModal.module.scss  
│   │   │   └── ConfigureProductModal.tsx  
│   │   ├── header/  
│   │   │   ├── Header.module.scss  
│   │   │   └── Header.tsx  
│   │   ├── login-modal/  
│   │   │   ├── LoginModal.module.scss  
│   │   │   └── LoginModal.tsx  
│   │   ├── info-modal/  
│   │   │   ├── InfoModal.module.scss  
│   │   │   └── InfoModal.tsx  
│   │   ├── modal/  
│   │   │   ├── Modal.module.scss  
│   │   │   └── Modal.tsx  
│   │   ├── product-card/  
│   │   │   ├── ProductCard.module.scss  
│   │   │   └── ProductCard.tsx  
│   │   ├── user-auth/  
│   │   │   ├── UserLoginForm.module.scss  
│   │   │   ├── UserLoginForm.tsx  
│   │   │   ├── RegisterForm.module.scss  
│   │   │   └── RegisterForm.tsx  
│   │   ├── checkout/  
│   │   │   ├── Checkout.module.scss  
│   │   │   └── Checkout.tsx  
│   │   └── order-status/  
│   │       ├── OrderStatus.module.scss  
│   │       └── OrderStatus.tsx  
│   ├── lib/
│   │   ├── authOptions.ts  
│   │   ├── fetchMenu.ts  
│   │   ├── moveTempToUploads.ts  
│   │   └── prisma.ts  
│   ├── middleware.ts — Middleware для роутинга
│   ├── providers/  
│   │   ├── CartProvider.tsx  
│   │   └── ModalProvider.tsx  
│   ├── types/ — Типы TypeScript  
│   │   ├── cart.ts  
│   │   ├── menu.ts  
│   │   └── next-auth.d.ts  
│   └── utils.ts  
└── tsconfig.json  

### ui-library - библиотека общих UI-компонентов
ui-library/  
├── src/  
│   ├── Button/  
│   │   ├── Button.module.scss  
│   │   └── Button.tsx  
│   ├── Checkbox/  
│   │   ├── Checkbox.module.scss  
│   │   └── Checkbox.tsx  
│   ├── Input/  
│   │   ├── Input.module.scss  
│   │   └── Input.tsx  
│   ├── PhotoUpload/  
│   │   ├── PhotoUpload.module.scss  
│   │   └── PhotoUpload.tsx  
│   ├── RadioButton/  
│   │   ├── RadioButton.module.scss  
│   │   └── RadioButton.tsx  
│   ├── Textarea/  
│   │   ├── Textarea.module.scss  
│   │   └── Textarea.tsx  
│   └── index.ts  
├── package.json  
├── .gitignore  
├── eslint.config.js  
└── tsconfig.json  

## Технологический стек

### Runtime зависимости
- @prisma/client ^6.17.1 - Клиент для работы с базой данных Prisma
- bcrypt ^6.0.0 - Хэширование паролей для аутентификации
- clsx ^2.1.1 - Утилита для динамического создания классов CSS
- lodash.debounce ^4.0.8 - Утилита для отложенного выполнения функций
- lucide-react ^0.548.0 - Библиотека иконок для React
- next 15.5.6 - Фреймворк для React с серверным рендерингом и API-роутами
- next-auth ^4.24.11 - Аутентификация для Next.js
- prisma ^6.17.1 - ORM для базы данных с миграциями и генерацией типов
- react 19.1.0 - Библиотека react
- react-dom 19.1.0 - Рендеринг React в DOM
- slugify ^1.6.6 - Генерация слаг для URL из строк

#### Dev зависимости
- @eslint/eslintrc ^3 - Конфигурация ESLint для совместимости
- @types/bcrypt ^6.0.0 - Типы TypeScript для bcrypt
- @types/estree ^1.0.8 - Типы для ESTree (парсинг JS)
- @types/json-schema ^7.0.15 - Типы для JSON-схем
- @types/json5 ^0.0.30 - Типы для JSON5
- @types/lodash.debounce ^4.0.9 - Типы для lodash.debounce
- @types/next-auth ^3.13.0 - Типы для next-auth
- @types/node ^24.8.1 - Типы для Node.js
- @types/react ^19 - Типы для React
- @types/react-dom ^19 - Типы для React DOM
- @types/zen-observable ^0.8.7 - Типы для Zen Observable
- eslint ^9 - Линтинг кода
- eslint-config-next 15.5.6 - Конфигурация ESLint для Next.js
- ts-node ^10.9.2 - Запуск TypeScript в Node.js
- typescript ^5 - Статическая типизация
- sass ^1.93.2 - Препроцессор CSS для стилей
- @mui/types ^6.1.5 - Типы для Material-UI

## Компоненты

### В проекте frontend
- AdminProductCard - Карточка продукта в админ-панели
- Cart - Компонент корзины для управления выбранными товарами
- CartItem - Элемент корзины, отображающий отдельный товар
- ConfigureProductModal - Модальное окно для конфигурации продукта (выбор добавок, размера пиццы)
- Header - Шапка сайта
- InfoModal - Информационное модальное окно для показа сообщений (успех, ошибка)
- LoginModal - Модальное окно для авторизатии пользователей
- Modal - Базовое модальное окно для общих попапов
- ProductCard - Карточка продукта в публичном меню
- OrderStatus - Компонент для просмотра статуса заказа

### В проекте ui-library
- Button - Универсальная кнопка с вариантами стилей
- Checkbox - Компонент чекбокса
- Input - Поле ввода данных
- PhotoUpload - Компонент для загрузки и предпросмотра фото
- RadioButton - Радио-кнопка для выбора одного варианта (например, размер пиццы)
- Textarea - Поле для многострочного ввода

## Структура роутинга приложений

### Публичная часть приложения
Главная страница (/) – Каталог пицц, корзина  
├── Оформление заказа (/checkout) - Форма заказа  
└── Мои заказы (/orders) - Просмотр статусов заказов пользователя  

### Административная панель
Страница входа (/admin/login)  
├── Дашборд (/admin/dashboard) - Обзор заказов и статистики  
├── Управление меню (/admin/dashboard/menu) - Список продуктов и разделов  
└── Управление заказами (/admin/dashboard/orders) - Список заказов с изменением статуса и удалением  

## Хранение данных
Данные хранятся в PostgreSQL через Prisma. Состояние управляется через React hooks (useState, useContext) и провайдеры (CartProvider, ModalProvider). Административная панель поддерживает CRUD-операции с сохранением в базе данных. Изображения хранятся в public/uploads (постоянные) и temp-uploads (временные). Авторизация пользователей расширяет next-auth для хранения сессий и ролей (user/admin).

