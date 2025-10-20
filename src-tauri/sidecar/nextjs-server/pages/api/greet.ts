import type { NextApiRequest, NextApiResponse } from 'next';

type GreetRequest = {
  name?: string;
};

type GreetResponse = {
  message: string;
  timestamp: string;
};

type ErrorResponse = {
  error: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GreetResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.body as GreetRequest;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  res.status(200).json({
    message: `Hello from Next.js sidecar, ${name}!`,
    timestamp: new Date().toISOString()
  });
}

