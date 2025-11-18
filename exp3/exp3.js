// exp3.js — Student Registration (jQuery)
$(function() {
  const STORAGE_KEY = 'exp3_students';
  const $form = $('#studentForm');
  const $name = $('#name');
  const $email = $('#email');
  const $phone = $('#phone');
  const $tbody = $('#studentsTbody');
  const $filter = $('#filterInput');
  const $sortBtn = $('#sortBtn');
  let students = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  let sortAsc = true; // toggle state

  // render table rows (optionally filtered)
  function render(list = students) {
    const q = $filter.val().trim().toLowerCase();
    const filtered = list.filter(s => {
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    });

    $tbody.empty();
    if (filtered.length === 0) {
      $tbody.append('<tr><td colspan="5" style="opacity:.7; padding:12px">No students yet.</td></tr>');
      return;
    }

    filtered.forEach((s, idx) => {
      const row = $(`
        <tr data-index="${s.id}">
          <td>${idx + 1}</td>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(s.email)}</td>
          <td>${escapeHtml(s.phone)}</td>
          <td>
            <button class="action-btn action-edit" data-id="${s.id}">Edit</button>
            <button class="action-btn action-del" data-id="${s.id}">Delete</button>
          </td>
        </tr>
      `);
      $tbody.append(row);
    });
  }

  // simple escape to prevent HTML injection
  function escapeHtml(str) {
    return $('<div>').text(str).html();
  }

  // save to localStorage
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }

  // create unique id
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  }

  // validation
  function validate(name, email, phone) {
    if (!name || !email || !phone) return 'All fields are required.';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return 'Enter a valid email.';
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) return 'Phone must be 10 digits.';
    return null;
  }

  // add or update handler
  $form.on('submit', function(e) {
    e.preventDefault();
    const n = $name.val().trim();
    const em = $email.val().trim();
    const ph = $phone.val().trim();

    const err = validate(n, em, ph);
    if (err) { alert(err); return; }

    // check if currently editing (we use form data attr)
    const editingId = $form.data('editing');
    if (editingId) {
      const idx = students.findIndex(s => s.id === editingId);
      if (idx !== -1) {
        students[idx].name = n;
        students[idx].email = em;
        students[idx].phone = ph;
      }
      $form.removeData('editing');
      $('#addStudent').text('Add Student');
    } else {
      // add new
      students.unshift({ id: uid(), name: n, email: em, phone: ph, created: Date.now() });
    }

    save();
    render();
    $form[0].reset();
    $name.focus();
  });

  // delegate delete & edit
  $tbody.on('click', '.action-del', function() {
    const id = $(this).data('id');
    if (!confirm('Delete this student?')) return;
    students = students.filter(s => s.id !== id);
    save();
    render();
  });

  $tbody.on('click', '.action-edit', function() {
    const id = $(this).data('id');
    const s = students.find(x => x.id === id);
    if (!s) return;
    $name.val(s.name);
    $email.val(s.email);
    $phone.val(s.phone);
    $form.data('editing', id);
    $('#addStudent').text('Update Student');
    $name.focus();
  });

  // sort toggle by name
  $sortBtn.on('click', function() {
    sortAsc = !sortAsc;
    students.sort((a,b) => {
      const n1 = a.name.toLowerCase(), n2 = b.name.toLowerCase();
      return (n1 < n2 ? -1 : n1 > n2 ? 1 : 0) * (sortAsc ? 1 : -1);
    });
    $sortBtn.text(`Sort by Name ${sortAsc ? '▲' : '▼'}`);
    save();
    render();
  });

  // filter input
  $filter.on('input', function() { render(); });

  // export CSV
  $('#exportCsv').on('click', function() {
    if (!students.length) { alert('No students to export.'); return; }
    const rows = [['Name','Email','Phone','CreatedAt']];
    students.slice().reverse().forEach(s => {
      rows.push([s.name, s.email, s.phone, new Date(s.created).toLocaleString()]);
    });
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // initial render
  render();

  // debug helper: print console message to confirm script loaded
  console.log('exp3.js loaded — students:', students.length);
});
