/**
 * Due Date Calculator
 * คำนวณวันดิวเดทตามงวดชำระ
 */

// ─── State ────────────────────────────────────────────────
let tableData = [];

// ─── Thai Month Abbreviations ──────────────────────────────
const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

// ─── Helpers ───────────────────────────────────────────────

function formatDateTH(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const mon = THAI_MONTHS[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${day} ${mon} ${year}`;
}

function formatDateEN(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDMY(d) {
  const dd   = String(d.getDate()).padStart(2, '0');
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseDMY(str) {
  // Accept DD/MM/YYYY
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const dd = parseInt(parts[0]), mm = parseInt(parts[1]), yyyy = parseInt(parts[2]);
  if (!dd || !mm || !yyyy || yyyy < 2000) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}

function addMonthsSafe(date, months) {
  const originalDay = date.getDate();
  const d = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, lastDay));
  return d;
}

function addPeriod(date, type) {
  switch (type) {
    case 'monthly':   return addMonthsSafe(date, 1);
    case 'weekly':    { const d = new Date(date); d.setDate(d.getDate() + 7); return d; }
    case 'quarterly': return addMonthsSafe(date, 3);
    case 'bimonthly': return addMonthsSafe(date, 2);
    case 'yearly':    return addMonthsSafe(date, 12);
    default:          return new Date(date);
  }
}

function formatCurrency(num) {
  return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Main Calculate Function ───────────────────────────────

function calculate() {
  const displayVal   = document.getElementById('date-display').value;
  const startDate    = parseDMY(displayVal);
  const installments = parseInt(document.getElementById('installments').value);
  const periodType   = document.getElementById('period-type').value;
  const amount       = parseFloat(document.getElementById('amount').value) || 0;

  if (!startDate) {
    alert('กรุณากรอกวันที่ให้ถูกต้อง (DD/MM/YYYY)');
    return;
  }
  if (!installments || installments < 1 || installments > 360) {
    alert('กรุณากรอกจำนวนงวดระหว่าง 1 – 360');
    return;
  }

  tableData = [];
  let current = new Date(startDate);

  for (let i = 1; i <= installments; i++) {
    tableData.push({
      installment: i,
      dateTH:  formatDateTH(current),
      dateEN:  formatDateEN(current),
      rawDate: new Date(current),
      amount:  amount,
    });
    current = addPeriod(current, periodType);
  }

  renderSummary(installments, amount);
  renderTable(amount);

  document.getElementById('export-btn').style.display = 'flex';
  document.getElementById('clear-btn').style.display  = 'flex';
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('result-section').style.display = 'block';
}

// ─── Render: Summary Cards ─────────────────────────────────

function renderSummary(installments, amount) {
  document.getElementById('s-total').textContent = installments + ' งวด';
  document.getElementById('s-first').textContent = tableData[0].dateTH;
  document.getElementById('s-last').textContent  = tableData[tableData.length - 1].dateTH;

  const totalCard = document.getElementById('s-total-card');
  if (amount > 0) {
    document.getElementById('s-total-amount').textContent = formatCurrency(amount * installments) + ' บาท';
    totalCard.style.display = '';
  } else {
    totalCard.style.display = 'none';
  }
  document.getElementById('summary-section').style.display = 'grid';
}

// ─── Render: Table ─────────────────────────────────────────

function renderTable(amount) {
  const tbody        = document.getElementById('result-body');
  const amountHeader = document.getElementById('amount-header');

  amountHeader.style.display = amount > 0 ? 'table-cell' : 'none';

  tbody.innerHTML = tableData.map(row => `
    <tr>
      <td><span class="badge">${String(row.installment).padStart(2, '0')}</span></td>
      <td class="date-th">${row.dateTH}</td>
      <td class="date-en">${row.dateEN}</td>
      ${amount > 0 ? `<td class="amount-cell">${formatCurrency(row.amount)}</td>` : ''}
    </tr>
  `).join('');
}

// ─── Export to Excel ───────────────────────────────────────

function exportExcel() {
  if (!tableData.length) return;
  const amount  = tableData[0].amount;
  const headers = ['งวดที่', 'วันที่ (พ.ศ.)', 'วันที่ (ค.ศ.)', 'วันที่ (Excel)'];
  if (amount > 0) headers.push('จำนวนเงิน (บาท)');

  const rows = tableData.map(r => {
    const row = [r.installment, r.dateTH, r.dateEN, r.rawDate];
    if (amount > 0) row.push(r.amount);
    return row;
  });
  if (amount > 0) rows.push(['', '', '', 'รวมทั้งหมด', amount * tableData.length]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{wch:8},{wch:18},{wch:18},{wch:18},{wch:18}];
  XLSX.utils.book_append_sheet(wb, ws, 'ตารางงวด');

  const today    = new Date().toISOString().slice(0, 10);
  const filename = `due_dates_${tableData.length}งวด_${today}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ─── Clear All ─────────────────────────────────────────────

function clearAll() {
  const today = new Date();
  document.getElementById('date-display').value  = formatDMY(today);
  document.getElementById('start-date').value    = today.toISOString().slice(0, 10);
  document.getElementById('installments').value  = '12';
  document.getElementById('period-type').value   = 'monthly';
  document.getElementById('amount').value        = '';
  tableData = [];

  document.getElementById('summary-section').style.display = 'none';
  document.getElementById('result-section').style.display  = 'none';
  document.getElementById('export-btn').style.display = 'none';
  document.getElementById('clear-btn').style.display  = 'none';
  document.getElementById('empty-state').style.display = 'block';
}

// ─── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const today      = new Date();
  const hiddenInput = document.getElementById('start-date');
  const display     = document.getElementById('date-display');

  // Set today as default
  hiddenInput.value = today.toISOString().slice(0, 10);
  display.value     = formatDMY(today);

  // Calendar picker → update display box
  hiddenInput.addEventListener('change', function () {
    if (!this.value) return;
    const [y, m, d] = this.value.split('-');
    display.value = `${d}/${m}/${y}`;
  });

  // Manual typing in display box → auto-format as DD/MM/YYYY
  display.addEventListener('input', function () {
    let v = this.value.replace(/[^0-9]/g, '');
    if (v.length > 2)  v = v.slice(0, 2) + '/' + v.slice(2);
    if (v.length > 5)  v = v.slice(0, 5) + '/' + v.slice(5);
    if (v.length > 10) v = v.slice(0, 10);
    this.value = v;

    // Sync hidden date if complete
    const parsed = parseDMY(v);
    if (parsed) {
      hiddenInput.value = parsed.toISOString().slice(0, 10);
    }
  });
});
