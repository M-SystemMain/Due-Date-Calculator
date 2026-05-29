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

/**
 * Format date to Thai Buddhist Era string
 * @param {Date} d
 * @returns {string} e.g. "01 ม.ค. 2568"
 */
function formatDateTH(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const mon = THAI_MONTHS[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${day} ${mon} ${year}`;
}

/**
 * Format date to international English string
 * @param {Date} d
 * @returns {string} e.g. "01 Jan 2025"
 */
function formatDateEN(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Add a period to a date based on period type
 * @param {Date} date
 * @param {string} type - 'monthly' | 'weekly' | 'quarterly' | 'bimonthly' | 'yearly'
 * @returns {Date}
 */
function addPeriod(date, type) {
  const d = new Date(date);
  switch (type) {
    case 'monthly':    d.setMonth(d.getMonth() + 1);       break;
    case 'weekly':     d.setDate(d.getDate() + 7);         break;
    case 'quarterly':  d.setMonth(d.getMonth() + 3);       break;
    case 'bimonthly':  d.setMonth(d.getMonth() + 2);       break;
    case 'yearly':     d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}

/**
 * Format number as Thai currency string
 * @param {number} num
 * @returns {string}
 */
function formatCurrency(num) {
  return num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Main Calculate Function ───────────────────────────────

function calculate() {
  const startVal     = document.getElementById('start-date').value;
  const installments = parseInt(document.getElementById('installments').value);
  const periodType   = document.getElementById('period-type').value;
  const amount       = parseFloat(document.getElementById('amount').value) || 0;

  // Validation
  if (!startVal) {
    alert('กรุณาเลือกวันที่ดิวเดทเริ่มต้น');
    return;
  }
  if (!installments || installments < 1 || installments > 360) {
    alert('กรุณากรอกจำนวนงวดระหว่าง 1 – 360');
    return;
  }

  // Build table data
  tableData = [];
  let current = new Date(startVal);

  for (let i = 1; i <= installments; i++) {
    tableData.push({
      installment: i,
      dateTH: formatDateTH(current),
      dateEN: formatDateEN(current),
      rawDate: new Date(current),
      amount: amount,
    });
    current = addPeriod(current, periodType);
  }

  renderSummary(installments, amount);
  renderTable(amount);

  document.getElementById('export-btn').style.display = 'flex';
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('result-section').style.display = 'block';
}

// ─── Render: Summary Cards ─────────────────────────────────

function renderSummary(installments, amount) {
  document.getElementById('s-total').textContent  = installments + ' งวด';
  document.getElementById('s-first').textContent  = tableData[0].dateTH;
  document.getElementById('s-last').textContent   = tableData[tableData.length - 1].dateTH;

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

  const amount = tableData[0].amount;

  // Build worksheet data
  const headers = ['งวดที่', 'วันที่ (พ.ศ.)', 'วันที่ (ค.ศ.)', 'วันที่ (Excel)'];
  if (amount > 0) headers.push('จำนวนเงิน (บาท)');

  const rows = tableData.map(r => {
    const row = [r.installment, r.dateTH, r.dateEN, r.rawDate];
    if (amount > 0) row.push(r.amount);
    return row;
  });

  if (amount > 0) {
    rows.push(['', '', '', 'รวมทั้งหมด', amount * tableData.length]);
  }

  const wsData = [headers, ...rows];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [
    { wch: 8 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'ตารางงวด');

  const today    = new Date().toISOString().slice(0, 10);
  const filename = `due_dates_${tableData.length}งวด_${today}.xlsx`;

  XLSX.writeFile(wb, filename);
}

// ─── Init ──────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('start-date').valueAsDate = new Date();
});
