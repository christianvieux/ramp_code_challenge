// component/Transactions/index.tsx
import { useCallback } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ 
  transactions,
  isLoading, 
  approvedTransactions,
  onApprovalChange,
}) => {
  const { fetchWithoutCache, loading } = useCustomFetch()

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      // update server
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      // update local state
      onApprovalChange(transactionId, newValue)
    },
    [fetchWithoutCache, onApprovalChange]
  )


  if (!transactions && !isLoading) {
    return <div className="RampLoading--container">No transactions</div>
  }

  return (
    <>
    {transactions && (
      <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
          approvedTransactions={approvedTransactions}
        />
      ))}
    </div>
    )}
    {isLoading && <div className="RampLoading--container">Loading...</div>}
    
    </>
    
  )
}
