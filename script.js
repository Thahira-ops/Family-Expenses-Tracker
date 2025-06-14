
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let income = parseFloat(localStorage.getItem('income')) || 0;

// Display initial income
document.getElementById('income-display').textContent = income;
updateSummary();

// Income form handler
document.getElementById('income-form').addEventListener('submit', function (e) {
  e.preventDefault();
  income = parseFloat(document.getElementById('income').value);
  localStorage.setItem('income', income);
  document.getElementById('income-display').textContent = income;
  updateSummary();
  this.reset();
});

// Category "Other" toggle logic
const categorySelect = document.getElementById('category');
const customCategoryInput = document.getElementById('custom-category');

categorySelect.addEventListener('change', () => {
  if (categorySelect.value === 'Other') {
    customCategoryInput.style.display = 'block';
    customCategoryInput.required = true;
  } else {
    customCategoryInput.style.display = 'none';
    customCategoryInput.required = false;
    customCategoryInput.value = '';
  }
});

// Expense form handler (Single, correct version)
document.getElementById('expense-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const member = document.getElementById('member').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const selectedCategory = categorySelect.value === 'Other' ? customCategoryInput.value : categorySelect.value;
  const date = new Date().toISOString();

  const expense = { member, amount, category: selectedCategory, date };
  expenses.push(expense);
  localStorage.setItem('expenses', JSON.stringify(expenses));

  displayExpenses(expenses);
  updateSummary();
  this.reset();
  customCategoryInput.style.display = 'none'; // Hide custom input after submit
});

// Display expenses
function displayExpenses(data) {
  const list = document.getElementById('expense-list');
  list.innerHTML = '';
  data.forEach(exp => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${exp.member}</strong> - ₹${exp.amount} [${exp.category}] on ${new Date(exp.date).toLocaleDateString()}`;
    list.appendChild(div);
  });
}

// Update summary (total + savings)
function updateSummary() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savings = income - total;
  document.getElementById('total-expenses').textContent = total.toFixed(2);
  document.getElementById('savings').textContent = savings.toFixed(2);
}

// Month filter
document.getElementById('month-filter').addEventListener('change', function () {
  const val = this.value;
  const filtered = val === 'all' ? expenses :
    expenses.filter(e => new Date(e.date).getMonth().toString() === val);
  displayExpenses(filtered);
});

// Export to PDF
document.getElementById('export-pdf-btn').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Family Expense Report", 10, 10);
  let y = 20;
  expenses.forEach(e => {
    doc.text(`${e.member}: ₹${e.amount} (${e.category}) on ${new Date(e.date).toLocaleDateString()}`, 10, y);
    y += 10;
  });
  doc.save("family-expense-report.pdf");
});

// Share via WhatsApp
document.getElementById('whatsapp-btn').addEventListener('click', () => {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savings = income - total;
  const msg = `📊 Family Expense Summary\n\n💰 Income: ₹${income}\n💸 Total Expenses: ₹${total}\n💼 Savings: ₹${savings}\n\nShared via Family Tracker App`;
  const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});

// Remove data older than 3 months
expenses = expenses.filter(exp => {
  const now = new Date();
  const expDate = new Date(exp.date);
  const monthsDiff = (now.getFullYear() - expDate.getFullYear()) * 12 + (now.getMonth() - expDate.getMonth());
  return monthsDiff < 3;
});
localStorage.setItem('expenses', JSON.stringify(expenses));
displayExpenses(expenses);

