import { CheckCircle, Clock } from 'lucide-react';

export function getStatusChip(status: string) {
  switch (status) {
    case 'DISETUJUI':
    case 'SELESAI':
    case 'BIMBINGAN':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="-ml-0.5 mr-1.5 h-4 w-4" />
          {status}
        </span>
      );
    case 'DIAJUKAN':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="-ml-0.5 mr-1.5 h-4 w-4" />
          {status}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {status}
        </span>
      );
  }
}
