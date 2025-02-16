import { FunctionComponent } from "react"
import { Transaction } from "../../utils/types"

export type SetTransactionApprovalFunction = (params: {
  transactionId: string
  newValue: boolean
}) => Promise<void>

type TransactionsProps = { 
  transactions: Transaction[] | null
  isLoading?: boolean
  approvedTransactions: Record<string, boolean>
  onApprovalChange: (transactionId: string, newValue: boolean) => void
}
type TransactionPaneProps = {
  transaction: Transaction
  loading: boolean
  setTransactionApproval: SetTransactionApprovalFunction
  approvedTransactions: Record<string, boolean>
}

export type TransactionsComponent = FunctionComponent<TransactionsProps>
export type TransactionPaneComponent = FunctionComponent<TransactionPaneProps>
