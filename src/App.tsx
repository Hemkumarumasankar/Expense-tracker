import React, { useState, useEffect } from 'react';
import { Trash2, PlusCircle, DollarSign, AlertTriangle } from 'lucide-react';

// Define types
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

function App() {
  // State hooks
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [salary, setSalary] = useState<number>(10000);
  const [savings, setSavings] = useState<number>(2000);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [tempSalary, setTempSalary] = useState('10000');
  const [tempSavings, setTempSavings] = useState('2000');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: 'USD',
    symbol: '$',
    name: 'US Dollar'
  });

  // Currencies list
  const currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
  ];

  // Categories for the dropdown
  const categories = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Shopping',
    'Housing',
    'Healthcare',
    'Education',
    'Other'
  ];

  // Load expenses, currency, salary and savings from localStorage on component mount
  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem('expenses');
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }

      const savedCurrency = localStorage.getItem('selectedCurrency');
      if (savedCurrency) {
        setSelectedCurrency(JSON.parse(savedCurrency));
      }

      const savedSalary = localStorage.getItem('salary');
      if (savedSalary) {
        setSalary(parseFloat(savedSalary));
        setTempSalary(savedSalary);
      }

      const savedSavings = localStorage.getItem('savings');
      if (savedSavings) {
        setSavings(parseFloat(savedSavings));
        setTempSavings(savedSavings);
      }
    } catch (err) {
      console.error('Error loading data from localStorage:', err);
    }
  }, []);

  // Save expenses to localStorage whenever expenses change
  useEffect(() => {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (err) {
      console.error('Error saving expenses to localStorage:', err);
    }
  }, [expenses]);

  // Save selected currency to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('selectedCurrency', JSON.stringify(selectedCurrency));
    } catch (err) {
      console.error('Error saving currency to localStorage:', err);
    }
  }, [selectedCurrency]);

  // Save salary and savings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('salary', salary.toString());
      localStorage.setItem('savings', savings.toString());
    } catch (err) {
      console.error('Error saving salary/savings to localStorage:', err);
    }
  }, [salary, savings]);

  // Calculate total expenses
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  
  // Calculate available balance
  const availableBalance = salary - savings - totalExpenses;

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!category) {
      setError('Please select a category');
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    const expenseAmount = parseFloat(amount);
    
    // Check if expense exceeds available balance
    if (expenseAmount > availableBalance) {
      setAlertMessage(`Warning: This expense of ${selectedCurrency.symbol}${expenseAmount.toFixed(2)} exceeds your available balance of ${selectedCurrency.symbol}${availableBalance.toFixed(2)}!`);
      setShowAlert(true);
      return;
    }
    
    // Create new expense object
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: expenseAmount,
      category,
      date: new Date().toISOString().split('T')[0]
    };
    
    // Add new expense to the list
    setExpenses([...expenses, newExpense]);
    
    // Reset form fields
    setDescription('');
    setAmount('');
    setCategory('');
  };

  // Delete an expense
  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Handle currency change
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currencyCode = e.target.value;
    const newCurrency = currencies.find(c => c.code === currencyCode);
    if (newCurrency) {
      setSelectedCurrency(newCurrency);
    }
  };

  // Handle salary and savings update
  const handleSalaryUpdate = () => {
    const newSalary = parseFloat(tempSalary);
    const newSavings = parseFloat(tempSavings);
    
    if (isNaN(newSalary) || newSalary <= 0) {
      setError('Please enter a valid salary amount');
      return;
    }
    
    if (isNaN(newSavings) || newSavings < 0) {
      setError('Please enter a valid savings amount');
      return;
    }
    
    if (newSavings > newSalary) {
      setError('Savings cannot be greater than salary');
      return;
    }
    
    setSalary(newSalary);
    setSavings(newSavings);
    setShowSalaryModal(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
          <p className="text-gray-600">Keep track of your spending</p>
        </header>

        {/* Alert Message */}
        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center text-red-600 mb-4">
                <AlertTriangle size={24} className="mr-2" />
                <h3 className="text-xl font-bold">Budget Alert</h3>
              </div>
              <p className="mb-6">{alertMessage}</p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowAlert(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // Create new expense despite warning
                    const newExpense: Expense = {
                      id: crypto.randomUUID(),
                      description: description.trim(),
                      amount: parseFloat(amount),
                      category,
                      date: new Date().toISOString().split('T')[0]
                    };
                    
                    setExpenses([...expenses, newExpense]);
                    setDescription('');
                    setAmount('');
                    setCategory('');
                    setShowAlert(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Add Anyway
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Salary & Savings Modal */}
        {showSalaryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Update Income & Savings</h3>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Salary
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">{selectedCurrency.symbol}</span>
                  </div>
                  <input
                    type="number"
                    id="salary"
                    value={tempSalary}
                    onChange={(e) => setTempSalary(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="savings" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Savings Goal
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">{selectedCurrency.symbol}</span>
                  </div>
                  <input
                    type="number"
                    id="savings"
                    value={tempSavings}
                    onChange={(e) => setTempSavings(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setShowSalaryModal(false);
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSalaryUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Currency Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Currency Settings</h2>
          <div className="flex items-center">
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mr-4">
              Select Currency:
            </label>
            <select
              id="currency"
              value={selectedCurrency.code}
              onChange={handleCurrencyChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol}) - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Income & Budget Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Income & Budget</h2>
            <button
              onClick={() => setShowSalaryModal(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Update
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Monthly Income</p>
              <p className="text-xl font-bold text-gray-800">{selectedCurrency.symbol}{salary.toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Savings Goal</p>
              <p className="text-xl font-bold text-green-600">{selectedCurrency.symbol}{savings.toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Available Balance</p>
              <p className={`text-xl font-bold ${availableBalance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {selectedCurrency.symbol}{availableBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Expense Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Expense</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What did you spend on?"
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">{selectedCurrency.symbol}</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
              <PlusCircle size={18} className="mr-2" />
              Add Expense
            </button>
          </form>
        </div>

        {/* Expenses Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Total Expenses</h2>
            <div className="text-2xl font-bold text-blue-600">
              {selectedCurrency.symbol}{totalExpenses.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Expense History</h2>
          
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No expenses recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-gray-600">Description</th>
                    <th className="text-left py-3 px-2 text-gray-600">Category</th>
                    <th className="text-left py-3 px-2 text-gray-600">Date</th>
                    <th className="text-right py-3 px-2 text-gray-600">Amount</th>
                    <th className="text-center py-3 px-2 text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">{expense.description}</td>
                      <td className="py-3 px-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500">{expense.date}</td>
                      <td className="py-3 px-2 text-right font-medium">
                        {selectedCurrency.symbol}{expense.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-700 transition duration-200"
                          aria-label="Delete expense"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;