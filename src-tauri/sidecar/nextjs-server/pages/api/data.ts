import type { NextApiRequest, NextApiResponse } from 'next';

type DataItem = {
  id: number;
  title: string;
  description: string;
};

type DataResponse = {
  data: DataItem[];
  total: number;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataResponse>
) {
  const mockData: DataItem[] = [
    {
      id: 1,
      title: 'Tauri 2.0',
      description: '强大的桌面应用框架'
    },
    {
      id: 2,
      title: 'Next.js',
      description: 'React 全栈框架'
    },
    {
      id: 3,
      title: 'Sidecar',
      description: '集成外部进程的最佳方式'
    }
  ];

  res.status(200).json({
    data: mockData,
    total: mockData.length
  });
}

