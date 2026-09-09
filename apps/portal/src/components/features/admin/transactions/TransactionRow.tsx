import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  getStatusLabel,
  getStatusColor,
  type TransactionDisplayStatus,
} from "./types";

interface TransactionRowProps {
  transaction: {
    id: string;
    createdAt: string;
    status: any;
    total: number;
    supplier: { id: string; name: string };
    itemCount: number;
    paidAt: string | null;
    displayStatus: TransactionDisplayStatus;
  };
  onClick: (id: string) => void;
}

export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  return (
    <tr
      onClick={() => onClick(transaction.id)}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
        {formatDateTime(transaction.createdAt)}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {transaction.supplier.name}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 text-center">
        {transaction.itemCount} item
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {formatCurrency(transaction.total)}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.displayStatus)}`}
        >
          {getStatusLabel(transaction.displayStatus)}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            transaction.paidAt
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {transaction.paidAt ? "Dibayar" : "Belum Bayar"}
        </span>
      </td>
    </tr>
  );
}
