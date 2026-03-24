import { Button, Typography, Box } from '@mui/material';

export default function Home() {
  return (
    <Box className="flex min-h-screen items-center justify-center bg-gray-50">
      <Box className="flex flex-col items-center gap-6 p-8">
        <Typography variant="h3" component="h1" className="text-primary">
          Next.js + MUI + Tailwind Template
        </Typography>

        <Typography variant="body1" color="text.secondary" className="text-center max-w-md">
          Starter with TypeScript, ESLint, and best practices.
        </Typography>

        <Box className="flex gap-4">
          <Button variant="contained" color="primary">
            Material UI Button
          </Button>
          <Button variant="outlined" className="border-secondary text-secondary">
            Tailwind Override
          </Button>
        </Box>

        <Typography variant="caption" className="mt-8 text-gray-500">
          Setup verified: Next.js 16 + Material UI 7 + Tailwind v4
        </Typography>
      </Box>
    </Box>
  );
}