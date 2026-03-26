import { Button, Typography, Box } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Box className="flex min-h-screen items-center justify-center bg-gray-50">
      <Box className="flex flex-col items-center gap-6 p-8">
        <Typography variant="h3" component="h1" className="text-primary">
          Money Mentor
        </Typography>

        <Typography variant="body1" color="text.secondary" className="text-center max-w-md">
          Your personal finance companion for smarter money management.
        </Typography>

        <Box className="flex gap-4">
          <Link href="/signin" passHref>
            <Button variant="contained" color="primary">
              Sign In
            </Button>
          </Link>
          <Link href="/signup" passHref>
            <Button variant="outlined" className="border-primary text-primary">
              Sign Up
            </Button>
          </Link>
        </Box>

        <Typography variant="caption" className="mt-8 text-gray-500">
          Setup verified: Next.js 16 + Material UI 7 + Tailwind v4
        </Typography>
      </Box>
    </Box>
  );
}