
# Pizzaro — курсовой проект

Next.js 15 + Prisma + PostgreSQL + Docker

## Быстрый старт (всё за 1 минуту)

```bash
git clone <репозиторий>
cd kursach

# Скопировать .env (если нет — создайте из .env.example)
cp .env.example .env.local

# Запустить контейнеры
docker-compose up -d

# Сбросить БД + применить миграции + залить тестовые данные и админа
docker-compose exec frontend npx prisma migrate reset --force
# → Подтвердите "y"
```

Готово!

Сайт: http://localhost:3000  
Админка: http://localhost:3000/admin

### Учётная запись администратора (создаётся автоматически при первом `reset` или `seed`):
```
Логин: admin@example.com
Пароль: password
```

## Полезные команды

```bash
# Пересобрать проект
docker-compose up -d --build

# Только применить миграции (без удаления данных)
docker-compose exec frontend npx prisma migrate dev

# Пересоздать админа и начальные данные (если удалили)
docker-compose exec frontend npx prisma db seed

# Сбросить всё с нуля (миграции + админ + меню)
docker-compose exec frontend npx prisma migrate reset --force

# Остановить
docker-compose down
```
