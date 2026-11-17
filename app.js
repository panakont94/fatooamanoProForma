/* ===========================================================
   CONFIGURATION
   =========================================================== */
const APP_PASSWORD = "fatto2026"; // ⚠️ Άλλαξε εδώ τον κωδικό σου!

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
/* ===========================================================
   PDF EXPORT - ΜΕ html2canvas (ΧΩΡΙΣ ΓΡΑΜΜΑΤΟΣΕΙΡΑ)
   Τα ελληνικά φαίνονται πάντα σωστά!
   =========================================================== */
function exportPDF() {
    // Δημιουργία προσωρινού element για το PDF
    const pdfContent = createPDFContent();
    document.body.appendChild(pdfContent);
    
    // Χρήση html2canvas για μετατροπή σε εικόνα
    html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        
        let width = pdfWidth;
        let height = width / ratio;
        
        if (height > pdfHeight) {
            height = pdfHeight;
            width = height * ratio;
        }
        
        const x = (pdfWidth - width) / 2;
        const y = 0;
        
        pdf.addImage(imgData, 'PNG', x, y, width, height);
        pdf.save(`Proforma_${document.getElementById('customerName').value || 'Customer'}.pdf`);
        
        // Καθαρισμός
        document.body.removeChild(pdfContent);
    }).catch(error => {
        console.error('PDF Error:', error);
        alert('Σφάλμα κατά την εξαγωγή PDF');
        document.body.removeChild(pdfContent);
    });
}

/* Δημιουργία περιεχομένου για το PDF */
function createPDFContent() {
    const data = collectData();
    const subtotal = data.items.reduce((s, i) => s + i.qty * i.price, 0);
    const discount = parseFloat(data.discount) || 0;
    const vatRate = parseFloat(data.vatRate) || 0;
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    const vatAmount = subtotalAfterDiscount * (vatRate / 100);
    const grandTotal = subtotalAfterDiscount + vatAmount;
    
    const container = document.createElement('div');
    container.style.cssText = `
        width: 800px;
        padding: 40px;
        font-family: Arial, sans-serif;
        background: white;
        color: #333;
        position: absolute;
        left: -9999px;
        top: 0;
    `;
    
    let itemsRows = '';
    data.items.forEach((item, i) => {
        const lineTotal = item.qty * item.price;
        itemsRows += `
            <tr style="background: ${i % 2 === 0 ? '#FFF8F0' : '#FFFFFF'};">
                <td style="padding: 10px; border-bottom: 1px solid #E8D5B8; text-align: center;">${i + 1}</td>
                <td style="padding: 10px; border-bottom: 1px solid #E8D5B8;">${item.name || '-'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #E8D5B8; text-align: center;">${item.qty}</td>
                <td style="padding: 10px; border-bottom: 1px solid #E8D5B8; text-align: right;">€${item.price.toFixed(2).replace('.', ',')}</td>
                <td style="padding: 10px; border-bottom: 1px solid #E8D5B8; text-align: right; font-weight: bold;">€${lineTotal.toFixed(2).replace('.', ',')}</td>
            </tr>
        `;
    });
    
    container.innerHTML = `
        <div style="background: #3D2817; padding: 30px; margin: -40px -40px 30px -40px;">
            <h1 style="color: white; margin: 0; font-size: 32px; letter-spacing: 3px;">FATTO A MANO</h1>
            <p style="color: #C9A961; margin: 5px 0 0 0; font-size: 14px;">Ξυλουργικές Εργασίες - Χειροποίητα Έπιπλα | Κιλκίς</p>
            <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">Τηλ: 23410 27706 | 6980736190 | 6944582862</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #3D2817; font-size: 24px; margin: 0; border-bottom: 3px solid #C9A961; display: inline-block; padding-bottom: 10px;">PROFORMA ΤΙΜΟΛΟΓΙΟ</h2>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="flex: 1;">
                <h3 style="color: #3D2817; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase;">Στοιχεία Πελάτη</h3>
                <table style="font-size: 13px; line-height: 1.8;">
                    <tr><td style="color: #666; width: 100px;">Όνομα:</td><td><strong>${data.customer.name || '-'}</strong></td></tr>
                    <tr><td style="color: #666;">Διεύθυνση:</td><td>${data.customer.address || '-'}</td></tr>
                    <tr><td style="color: #666;">Τηλέφωνο:</td><td>${data.customer.phone || '-'}</td></tr>
                    <tr><td style="color: #666;">Email:</td><td>${data.customer.email || '-'}</td></tr>
                    <tr><td style="color: #666;">ΑΦΜ:</td><td>${data.customer.vat || '-'}</td></tr>
                    <tr><td style="color: #666;">ΔΟΥ:</td><td>${data.customer.doy || '-'}</td></tr>
                </table>
            </div>
            <div style="text-align: right;">
                <p style="margin: 0; color: #666;">Ημερομηνία:</p>
                <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #3D2817;">
                    ${data.date ? new Date(data.date).toLocaleDateString('el-GR') : '-'}
                </p>
            </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
                <tr style="background: #3D2817; color: white;">
                    <th style="padding: 12px; text-align: center; width: 40px;">#</th>
                    <th style="padding: 12px; text-align: left;">Είδος</th>
                    <th style="padding: 12px; text-align: center; width: 60px;">Ποσ.</th>
                    <th style="padding: 12px; text-align: right; width: 90px;">Τιμή</th>
                    <th style="padding: 12px; text-align: right; width: 100px;">Σύνολο</th>
                </tr>
            </thead>
            <tbody>
                ${itemsRows}
            </tbody>
        </table>
        
        <div style="display: flex; justify-content: flex-end;">
            <div style="width: 250px; background: #FAF3E8; padding: 20px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                    <span>Υποσύνολο:</span>
                    <span>€${subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                ${discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #C1272D;">
                    <span>Έκπτωση:</span>
                    <span>-€${discount.toFixed(2).replace('.', ',')}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                    <span>ΦΠΑ (${vatRate}%):</span>
                    <span>€${vatAmount.toFixed(2).replace('.', ',')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #C9A961; font-size: 18px; font-weight: bold; color: #3D2817;">
                    <span>ΣΥΝΟΛΟ:</span>
                    <span>€${grandTotal.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
        </div>
        
        ${data.notes ? `
        <div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-left: 4px solid #C9A961;">
            <h4 style="margin: 0 0 8px 0; color: #3D2817; font-size: 13px;">Σημειώσεις:</h4>
            <p style="margin: 0; font-size: 12px; color: #666; white-space: pre-wrap;">${data.notes}</p>
        </div>
        ` : ''}
        
        <div style="margin-top: 40px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #C9A961; padding-top: 15px;">
            <p style="margin: 0;">FATTO A MANO | Χειροποίητα Έπιπλα από 1987 | Κιλκίς</p>
            <p style="margin: 5px 0 0 0; color: #C9A961;">Ευχαριστούμε για την προτίμησή σας!</p>
        </div>
    `;
    
    return container;
}
