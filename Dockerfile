# Tahap 1: Builder - Menginstall dependensi dan membangun aplikasi
FROM node:20-alpine AS builder

# Set lingkungan kerja di dalam container
WORKDIR /app

# Menginstall pnpm secara global
RUN npm install -g pnpm

# Salin file-file konfigurasi pnpm dan package.json root
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Salin semua proyek (apps dan packages)
COPY apps ./apps
COPY packages ./packages

# Install semua dependensi monorepo
# --frozen-lockfile memastikan instalasi sesuai dengan lockfile
RUN pnpm install --frozen-lockfile

# Bangun (build) hanya aplikasi 'api'
# Menggunakan filter untuk Turborepo
RUN pnpm turbo run build --filter=api

# Prune dev dependencies untuk aplikasi 'api'
# Ini akan membuat folder node_modules produksi di dalam apps/api
RUN cd apps/api && pnpm prune --prod


# Tahap 2: Production - Membuat image final yang ramping
FROM node:20-alpine AS production

# Set lingkungan kerja
WORKDIR /app

# Set environment ke production
ENV NODE_ENV=production

# Salin package.json dari aplikasi 'api'
COPY --from=builder /app/apps/api/package.json ./package.json

# Salin node_modules yang sudah di-prune dari tahap builder
COPY --from=builder /app/apps/api/node_modules ./node_modules

# Salin hasil build (kode JavaScript) dari tahap builder
COPY --from=builder /app/apps/api/dist ./dist

# Expose port yang digunakan oleh aplikasi Anda
# Ganti 3000 jika aplikasi Anda menggunakan port yang berbeda
EXPOSE 3000

# Perintah untuk menjalankan aplikasi saat container dimulai
CMD ["node", "dist/server.js"]
