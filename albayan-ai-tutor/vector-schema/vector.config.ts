import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'vector.prisma',
  datasource: {
    url: process.env.VECTOR_DATABASE_URL,
  },
});