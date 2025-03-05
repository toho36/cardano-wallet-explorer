import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;
  const apiUrl = `${process.env.BLOCKFROST_API_URL}/addresses/${address}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        project_id: process.env.BLOCKFROST_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`Blockfrost API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
}
