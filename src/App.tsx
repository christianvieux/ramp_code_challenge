// src/App.tsx
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [ isLoadingTransactions, setIsLoadingTransactions ] = useState(false)
  const [ isLoadingEmployees, setIsLoadingEmployees ] = useState(false)

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const [approvedTransactions, setApprovedTransactions] = useState<Record<string, boolean>>({})

  // Update the approval status of a transaction
  const updateTransactionApproval = useCallback((transactionId: string, newValue: boolean) => {
    setApprovedTransactions(prevApprovals => ({
      ...prevApprovals,
      [transactionId]: newValue,
    }))
  }, [])

  // for Initial load of all employees
  const loadEmployees = useCallback(async () => {
    setIsLoadingEmployees(true)
    await employeeUtils.fetchAll()
    setIsLoadingEmployees(false)
  }, [employeeUtils])
  
  // for Initial load of all transactions
  const loadAllTransactions = useCallback(async () => {
    setIsLoadingTransactions(true)
    transactionsByEmployeeUtils.invalidateData()

    await paginatedTransactionsUtils.fetchAll()

    setIsLoadingTransactions(false)
  }, [paginatedTransactionsUtils, transactionsByEmployeeUtils])

  // method for loading more transactions
  const loadMoreTransactions = useCallback(async () => {
    setIsLoadingTransactions(true)
    await paginatedTransactionsUtils.fetchMore()
    setIsLoadingTransactions(false)
  }, [paginatedTransactionsUtils])

  // Handle employee filtering
  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setIsLoadingTransactions(true)
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
      setIsLoadingTransactions(false)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  // Handle employee selection change
  const handleEmployeeChange = useCallback(
    async (employee: Employee | null) => {
      if (!employee) {
        return
      }
      if (employee.id === EMPTY_EMPLOYEE.id) {
        await loadAllTransactions()
        return
      }
      await loadTransactionsByEmployee(employee.id)
    },
    [loadAllTransactions, loadTransactionsByEmployee]
  )

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      if (employees === null && !employeeUtils.loading) {
        await Promise.all([
          loadEmployees(),
          loadAllTransactions()
        ])
      }
    }
    
    initializeData()
  }, [employees, employeeUtils.loading, loadEmployees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        
        <hr className="RampBreak--l" />

        {/* Employee dropdown */}
        <InputSelect<Employee>
          isLoading={isLoadingEmployees}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={handleEmployeeChange}
        />

        <div className="RampBreak--l" />

        {/* Main content */}
        <div className="RampGrid">
          <Transactions 
          isLoading={isLoadingTransactions} 
          transactions={transactions} 
          approvedTransactions={approvedTransactions}
          onApprovalChange={updateTransactionApproval }
          />

          {/* Only show View More when we have paginated transactions with a next page */}
          {paginatedTransactions?.data && paginatedTransactions?.nextPage !== null && !transactionsByEmployee && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={loadMoreTransactions}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
