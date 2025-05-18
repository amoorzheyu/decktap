import type { FC } from 'react';

// 定义 props 类型
interface ConnectionStatusProps {
  status: {
    text: string;
    color: string;
  };
}

export const ConnectionStatus: FC<ConnectionStatusProps> = ({ status }) => {
  return (
    <div 
      className="status"
      style={{ color: status.color }}
    >
      {status.text}
    </div>
  );
};