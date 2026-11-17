/* ===========================================================
   CONFIGURATION
   =========================================================== */
const APP_PASSWORD = "fatto2024"; // ⚠️ Άλλαξε εδώ τον κωδικό σου!

/* Λίστα ειδών - πρόσθεσε/αφαίρεσε εδώ ό,τι θέλεις */
const ITEMS_LIST = [
    "--- Επιλέξτε είδος ---",
    "Κουζίνα MDF",
    "Κουζίνα Λάκα",
    "Ντουλάπα Ανοιγόμενη",
    "Ντουλάπα Συρόμενη",
    "Ντουλάπα Walk-in",
    "Έπιπλο TV",
    "Βιβλιοθήκη",
    "Σύνθετο Σαλονιού",
    "Κρεβάτι Μονό",
    "Κρεβάτι Διπλό",
    "Κομοδίνο",
    "Γραφείο",
    "Τραπέζι Τραπεζαρίας",
    "Καρέκλες (σετ 4)",
    "Πόρτα Εσωτερική",
    "Πόρτα Θωρακισμένη",
    "Έπιπλο Μπάνιου",
    "Ράφια Ξύλινα",
    "Επαγγελματικό Έπιπλο",
    "Έπιπλο Ξενοδοχείου",
    "Ειδική Κατασκευή (Custom)",
    "Άλλο"
];

/* ===========================================================
   SUPABASE SETUP (για μελλοντική χρήση)
   Όταν είσαι έτοιμος, ξεσκέπασε και συμπλήρωσε τα παρακάτω
   =========================================================== */
// const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
// const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
// let supabaseClient = null;

/* ===========================================================
   STATE
   =========================================================== */
let itemCounter = 0;

/* ===========================================================
   PASSWORD PROTECTION
   =========================================================== */
function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    if (input === APP_PASSWORD) {
        document.getElementById('passwordScreen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        sessionStorage.setItem('authenticated', 'true');
        initApp();
    } else {
        document.getElementById('passwordError').style.display = 'block';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

document.getElementById('passwordInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkPassword();
});

function logout() {
    sessionStorage.removeItem('authenticated');
    document.getElementById('app').style.display = 'none';
    document.getElementById('passwordScreen').style.display = 'flex';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordError').style.display = 'none';
}

/* ===========================================================
   INIT
   =========================================================== */
function initApp() {
    document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
    if (document.getElementById('itemsBody').children.length === 0) {
        addItem();
    }
}

window.addEventListener('load', function() {
    if (sessionStorage.getItem('authenticated') === 'true') {
        document.getElementById('passwordScreen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        initApp();
    }
});

/* ===========================================================
   ITEMS MANAGEMENT
   =========================================================== */
function populateItemOptions(select) {
    ITEMS_LIST.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

function addItem() {
    itemCounter++;
    const tbody = document.getElementById('itemsBody');
    const tr = document.createElement('tr');
    tr.id = `item-row-${itemCounter}`;
    
    tr.innerHTML = `
        <td style="color: var(--color-text-light); font-weight:600;">${tbody.children.length + 1}</td>
        <td><select class="item-select" onchange="calculateTotals()"></select></td>
        <td><input type="number" class="item-qty" value="1" min="1" onchange="calculateTotals()" oninput="calculateTotals()"></td>
        <td><input type="number" class="item-price" value="0" min="0" step="0.01" onchange="calculateTotals()" oninput="calculateTotals()"></td>
        <td class="item-total">€0,00</td>
        <td style="text-align:center;">
            <button class="btn-remove" onclick="removeItem(this)" title="Αφαίρεση">✕</button>
        </td>
    `;
    
    tbody.appendChild(tr);
    populateItemOptions(tr.querySelector('.item-select'));
    calculateTotals();
}

function removeItem(btn) {
    const tbody = document.getElementById('itemsBody');
    if (tbody.children.length > 1) {
        btn.closest('tr').remove();
        Array.from(tbody.children).forEach((row, i) => {
            row.children[0].textContent = i + 1;
        });
        calculateTotals();
    }
}

/* ===========================================================
   CALCULATIONS
   =========================================================== */
function calculateTotals() {
    const rows = document.querySelectorAll('#itemsBody tr');
    let subtotal = 0;
    
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        const lineTotal = qty * price;
        
        const totalCell = row.querySelector('.item-total');
        if (totalCell) {
            totalCell.textContent = `€${formatNumber(lineTotal)}`;
        }
        subtotal += lineTotal;
    });
    
    const vatRate = parseFloat(document.getElementById('vatRate').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    const vatAmount = subtotalAfterDiscount * (vatRate / 100);
    const grandTotal = subtotalAfterDiscount + vatAmount;
    
    document.getElementById('subtotal').textContent = `€${formatNumber(subtotal)}`;
    document.getElementById('vatAmount').textContent = `€${formatNumber(vatAmount)}`;
    document.getElementById('grandTotal').textContent = `€${formatNumber(grandTotal)}`;
}

function formatNumber(num) {
    return num.toFixed(2).replace('.', ',');
}

/* ===========================================================
   COLLECT DATA (χρησιμοποιείται από Save & PDF)
   =========================================================== */
function collectData() {
    const items = [];
    document.querySelectorAll('#itemsBody tr').forEach(row => {
        items.push({
            name: row.querySelector('.item-select')?.value || '',
            qty: parseFloat(row.querySelector('.item-qty')?.value) || 0,
            price: parseFloat(row.querySelector('.item-price')?.value) || 0,
        });
    });
    
    return {
        customer: {
            name: document.getElementById('customerName').value,
            phone: document.getElementById('customerPhone').value,
            email: document.getElementById('customerEmail').value,
            vat: document.getElementById('customerVat').value,
            doy: document.getElementById('customerDoy').value,
            address: document.getElementById('customerAddress').value,
        },
        date: document.getElementById('invoiceDate').value,
        items: items,
        vatRate: document.getElementById('vatRate').value,
        discount: document.getElementById('discount').value,
        notes: document.getElementById('notes').value,
    };
}

/* ===========================================================
   SAVE / LOAD (localStorage)
   =========================================================== */
function saveToLocal() {
    const data = collectData();
    localStorage.setItem('fattoProforma', JSON.stringify(data));
    alert('✅ Αποθηκεύτηκε επιτυχώς!');
}

function loadFromLocal() {
    const saved = localStorage.getItem('fattoProforma');
    if (!saved) {
        alert('Δεν βρέθηκαν αποθηκευμένα δεδομένα.');
        return;
    }
    
    const data = JSON.parse(saved);
    document.getElementById('customerName').value = data.customer.name || '';
    document.getElementById('customerPhone').value = data.customer.phone || '';
    document.getElementById('customerEmail').value = data.customer.email || '';
    document.getElementById('customerVat').value = data.customer.vat || '';
    document.getElementById('customerDoy').value = data.customer.doy || '';
    document.getElementById('customerAddress').value = data.customer.address || '';
    document.getElementById('invoiceDate').value = data.date || '';
    document.getElementById('vatRate').value = data.vatRate || 24;
    document.getElementById('discount').value = data.discount || 0;
    document.getElementById('notes').value = data.notes || '';
    
    document.getElementById('itemsBody').innerHTML = '';
    itemCounter = 0;
    data.items.forEach(item => {
        addItem();
        const lastRow = document.querySelector('#itemsBody tr:last-child');
        lastRow.querySelector('.item-select').value = item.name;
        lastRow.querySelector('.item-qty').value = item.qty;
        lastRow.querySelector('.item-price').value = item.price;
    });
    
    calculateTotals();
    alert('✅ Φορτώθηκε επιτυχώς!');
}

function clearAll() {
    if (!confirm('Θέλετε σίγουρα να καθαρίσετε όλα τα πεδία;')) return;
    document.querySelectorAll('input:not([type="date"]), textarea').forEach(el => el.value = '');
    document.getElementById('vatRate').value = 24;
    document.getElementById('discount').value = 0;
    document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('itemsBody').innerHTML = '';
    itemCounter = 0;
    addItem();
    calculateTotals();
}

/* ===========================================================
   PDF EXPORT
   =========================================================== */
function exportPDF() {
    try {
        // Έλεγχος ότι τα libraries έχουν φορτώσει
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
            alert('⏳ Τα PDF libraries φορτώνουν ακόμα. Περιμένετε 2-3 δευτερόλεπτα και δοκιμάστε ξανά.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const data = collectData();
        const margin = 15;
        
        // ---- HEADER ----
        doc.setFillColor(61, 40, 23);
        doc.rect(0, 0, pageWidth, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('FATTO A MANO', margin, 18);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Furniture Manufacturing | Kilkis, Greece', margin, 26);
        doc.text('Tel: 23410 27706 | 6980736190 | 6944582862', margin, 32);
        
        // ---- TITLE ----
        let y = 45;
        doc.setTextColor(61, 40, 23);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('PROFORMA TIMOLOGIO', pageWidth / 2, y, { align: 'center' });
        y += 6;
        doc.setDrawColor(201, 169, 97);
        doc.setLineWidth(0.8);
        doc.line(margin, y, pageWidth - margin, y);
        
        // ---- DATE ----
        y += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        const dateStr = data.date ? new Date(data.date).toLocaleDateString('el-GR') : '-';
        doc.text(`Imerominia: ${dateStr}`, pageWidth - margin, y, { align: 'right' });
        
        // ---- CUSTOMER INFO ----
        y += 14;
        doc.setFillColor(250, 243, 232);
        doc.roundedRect(margin, y - 5, pageWidth - 2 * margin, 32, 3, 3, 'F');
        doc.setTextColor(61, 40, 23);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Stoixeia Pelati', margin + 5, y + 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        const cx = margin + 5;
        y += 8;
        doc.text(`Onoma: ${data.customer.name || '-'}`, cx, y);
        y += 5;
        doc.text(`Dieuthinsi: ${data.customer.address || '-'}`, cx, y);
        y += 5;
        doc.text(`Tilefono: ${data.customer.phone || '-'}   |   Email: ${data.customer.email || '-'}`, cx, y);
        y += 5;
        doc.text(`AFM: ${data.customer.vat || '-'}   |   DOY: ${data.customer.doy || '-'}`, cx, y);
        
        // ---- ITEMS TABLE ----
        y = 90;
        const tableBody = data.items.map((item, i) => {
            const lineTotal = item.qty * item.price;
            return [
                i + 1,
                item.name || '-',
                item.qty.toString(),
                `€${item.price.toFixed(2).replace('.', ',')}`,
                `€${lineTotal.toFixed(2).replace('.', ',')}`,
            ];
        });
        
        if (typeof doc.autoTable !== 'function') {
            alert('Σφάλμα: Το plugin πίνακα δεν φορτώθηκε. Ανανεώστε τη σελίδα (F5).');
            return;
        }
        
        doc.autoTable({
            startY: y,
            head: [['#', 'Eidos', 'Posot.', 'Timi', 'Synolo']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: [61, 40, 23],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10,
                halign: 'center',
            },
            bodyStyles: { fontSize: 10, textColor: [50, 50, 50] },
            alternateRowStyles: { fillColor: [255, 248, 240] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12 },
                1: { cellWidth: 80 },
                2: { halign: 'center', cellWidth: 22 },
                3: { halign: 'right', cellWidth: 28 },
                4: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
            },
            margin: { left: margin, right: margin },
            styles: { lineColor: [232, 213, 184], lineWidth: 0.2 },
        });
        
        // ---- TOTALS ----
        y = doc.lastAutoTable.finalY + 8;
        const subtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0);
        const discount = parseFloat(data.discount) || 0;
        const vatRate = parseFloat(data.vatRate) || 0;
        const subtotalAfterDiscount = Math.max(0, subtotal - discount);
        const vatAmount = subtotalAfterDiscount * (vatRate / 100);
        const grandTotal = subtotalAfterDiscount + vatAmount;
        const totalsX = pageWidth - margin - 70;
        const totalsW = 70;
        
        doc.setFillColor(250, 243, 232);
        doc.roundedRect(totalsX, y - 2, totalsW, 42, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'normal');
        let ty = y + 5;
        doc.text('Yposynolo:', totalsX + 3, ty);
        doc.text(`€${subtotal.toFixed(2).replace('.', ',')}`, totalsX + totalsW - 3, ty, { align: 'right' });
        ty += 6;
        doc.text(`FPA (${vatRate}%):`, totalsX + 3, ty);
        doc.text(`€${vatAmount.toFixed(2).replace('.', ',')}`, totalsX + totalsW - 3, ty, { align: 'right' });
        if (discount > 0) {
            ty += 6;
            doc.text('Ekptosi:', totalsX + 3, ty);
            doc.text(`-€${discount.toFixed(2).replace('.', ',')}`, totalsX + totalsW - 3, ty, { align: 'right' });
        }
        ty += 8;
        doc.setDrawColor(201, 169, 97);
        doc.setLineWidth(0.5);
        doc.line(totalsX + 3, ty - 2, totalsX + totalsW - 3, ty - 2);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(61, 40, 23);
        doc.text('SYNOLO:', totalsX + 3, ty + 3);
        doc.text(`€${grandTotal.toFixed(2).replace('.', ',')}`, totalsX + totalsW - 3, ty + 3, { align: 'right' });
        
        // ---- NOTES ----
        if (data.notes) {
            y = ty + 18;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(61, 40, 23);
            doc.text('Simeioseis:', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 2 * margin);
            doc.text(splitNotes, margin, y + 6);
        }
        
        // ---- FOOTER ----
        doc.setDrawColor(201, 169, 97);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'italic');
        doc.text('FATTO A MANO | Handcrafted Furniture since 1987 | Kilkis, Greece', pageWidth / 2, pageHeight - 14, { align: 'center' });
        doc.text('Efxaristoume gia tin protimisi sas!', pageWidth / 2, pageHeight - 9, { align: 'center' });
        
        // ---- SAVE ----
        const filename = `Proforma_${data.customer.name || 'Customer'}_${data.date || 'draft'}.pdf`;
        doc.save(filename.replace(/[^a-zA-Z0-9_.-]/g, '_'));
        
    } catch (error) {
        console.error('PDF Export Error:', error);
        alert('Σφάλμα κατά την εξαγωγή PDF: ' + error.message);
    }
}
