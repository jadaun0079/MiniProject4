const http = require('http');

const BASE_URL = 'http://localhost:5001';
let serverProcess;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, rawBody: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body, rawBody: body });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  process.env.PORT = '5001';
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/expense-tracker-test';
  process.env.JWT_SECRET = 'test_secret_key_12345';
  process.env.NODE_ENV = 'test';

  const app = require('../server');
  // wait 1 second for DB connection
  await new Promise((r) => setTimeout(r, 1000));

  console.log('--- STARTING BACKEND INTEGRATION & SECURITY TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.status === 'online', 'Health check endpoint returns online');

    // 2. User 1 Registration
    const testEmail1 = `fintech_user1_${Date.now()}@example.com`;
    const regRes1 = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Fintech User One', email: testEmail1, password: 'password123', currency: 'USD' },
    });
    assert(regRes1.status === 201 && regRes1.data.token, 'User 1 registered and received JWT token');
    const token1 = regRes1.data.token;

    // 3. Prevent duplicate registration
    const dupRes = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'Dup User', email: testEmail1, password: 'password123' },
    });
    assert(dupRes.status === 400, 'Duplicate email registration rejected');

    // 4. User 1 Login
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail1, password: 'password123' },
    });
    assert(loginRes.status === 200 && loginRes.data.email === testEmail1, 'User 1 login successful');

    // 5. Add Income
    const incomeRes = await request('/api/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        amount: 5000,
        type: 'income',
        category: 'Salary',
        description: 'Tech Lead Monthly Salary',
        paymentMethod: 'Bank Transfer',
      },
    });
    assert(incomeRes.status === 201 && incomeRes.data.type === 'income', 'Income transaction created successfully');

    // 6. Add Expense
    const expenseRes = await request('/api/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        amount: 1500,
        type: 'expense',
        category: 'Housing',
        description: 'Apartment Lease',
        paymentMethod: 'Bank Transfer',
      },
    });
    assert(expenseRes.status === 201 && expenseRes.data.amount === 1500, 'Expense transaction created successfully');
    const expenseId1 = expenseRes.data._id;

    // 7. Add second expense
    await request('/api/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        amount: 500,
        type: 'expense',
        category: 'Food',
        description: 'Organic Groceries',
        paymentMethod: 'Credit Card',
      },
    });

    // 8. Verify Financial Summary calculations
    const summaryRes = await request('/api/expenses/summary', {
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(
      summaryRes.status === 200 &&
        summaryRes.data.totalIncome === 5000 &&
        summaryRes.data.totalExpenses === 2000 &&
        summaryRes.data.netBalance === 3000 &&
        summaryRes.data.savingsRate === 60,
      'Authoritative summary calculation matches: Income 5000, Expense 2000, Net 3000, Savings 60%'
    );

    // 9. Budget Management: Create Budget
    const budgetRes = await request('/api/budgets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: { category: 'Food', amount: 800 },
    });
    assert(budgetRes.status === 201 && budgetRes.data.amount === 800, 'Food budget of $800 created');

    // 10. Budget Spending calculation
    const budgetsList = await request('/api/budgets', {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const foodBudget = budgetsList.data.find((b) => b.category === 'Food');
    assert(
      foodBudget && foodBudget.spent === 500 && foodBudget.remaining === 300 && foodBudget.percentage === 62.5,
      'Food budget calculated actual spending of $500 with $300 remaining (62.5% consumed)'
    );

    // 11. Data Isolation & Security: User 2 attempt to read or delete User 1 record
    const testEmail2 = `fintech_user2_${Date.now()}@example.com`;
    const regRes2 = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'User Two', email: testEmail2, password: 'password123' },
    });
    const token2 = regRes2.data.token;

    // User 2 tries to delete User 1's expense
    const hackDelete = await request(`/api/expenses/${expenseId1}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert(hackDelete.status === 403, 'Cross-user data breach prevented: User 2 cannot delete User 1 expense (403 Forbidden)');

    // User 2's summary must be strictly zero (no data leakage)
    const summary2 = await request('/api/expenses/summary', {
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert(
      summary2.data.totalIncome === 0 && summary2.data.totalExpenses === 0 && summary2.data.transactionCount === 0,
      'Strict user data isolation verified: User 2 sees 0 transactions and 0 balance'
    );

    // 12. CSV Export test
    const csvRes = await request('/api/expenses/export', {
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(
      csvRes.status === 200 && csvRes.headers['content-type'].includes('text/csv') && csvRes.rawBody.includes('Apartment Lease'),
      'CSV export contains valid headers and authorized user transactions'
    );

    // 13. Insights test
    const insightsRes = await request('/api/expenses/insights', {
      headers: { Authorization: `Bearer ${token1}` },
    });
    assert(
      insightsRes.status === 200 && typeof insightsRes.data.insights === 'string' && insightsRes.data.insights.length > 50,
      'Financial insights generated successfully'
    );

    console.log(`\n--- TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
