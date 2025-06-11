
## Tech Stack

**Client:** Vite + ReactJS, Typescript, TailwindCSS

**Server:** Node, Express, Prisma, PostgreSQL


## Run Locally

Clone the project

```bash
  git clone https://github.com/SetraNugraha/server-pharmakey
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Environtment

```bash
  copy .env.example to .env, set the value as needed
```

### Setup DB/Prisma

Generate Prisma

```bash
  npx prisma generate
```

Create Table on PostgreSQL

```bash
  npx prisma db push
```

Run Seeder

```bash
  npm run seed
```


### Run project

```bash
  npm run server
```
## 🔗 Client Repository

https://github.com/SetraNugraha/client-pharmakey