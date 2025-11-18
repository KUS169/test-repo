// exp2.js — To-Do app using jQuery + localStorage
$(function() {
  const $taskForm = $('#taskForm');
  const $taskInput = $('#taskInput');
  const $taskList = $('#taskList');
  const $search = $('#searchInput');

  // load tasks from localStorage or start with empty array
  let tasks = JSON.parse(localStorage.getItem('exp2_tasks') || '[]');

  // helper: render task array
  function render(list = tasks) {
    $taskList.empty();
    if (list.length === 0) {
      $taskList.append('<li class="task-item" style="opacity:.7">No tasks yet — add one above.</li>');
      return;
    }
    list.forEach((t, idx) => {
      const li = $(`
        <li class="task-item ${t.done ? 'completed' : ''}" data-idx="${idx}">
          <button class="btn-small toggle">${t.done ? 'Undo' : 'Done'}</button>
          <div class="text">${escapeHtml(t.text)}</div>
          <button class="btn-small btn-delete">Delete</button>
        </li>`);
      $taskList.append(li);
    });
  }

  // escape text to avoid accidental HTML injection
  function escapeHtml(s) {
    return $('<div>').text(s).html();
  }

  // save helper
  function save() {
    localStorage.setItem('exp2_tasks', JSON.stringify(tasks));
  }

  // initial render
  render();

  // add a task
  $taskForm.on('submit', function(e) {
    e.preventDefault();
    const text = $taskInput.val().trim();
    if (!text) return;
    tasks.unshift({ text, done: false, created: Date.now() }); // newest first
    $taskInput.val('');
    save();
    render();
  });

  // delegate toggle & delete buttons
  $taskList.on('click', '.toggle', function() {
    const idx = $(this).closest('.task-item').data('idx');
    tasks[idx].done = !tasks[idx].done;
    save();
    render();
  });

  $taskList.on('click', '.btn-delete', function() {
    const idx = $(this).closest('.task-item').data('idx');
    tasks.splice(idx, 1);
    save();
    render();
  });

  // search / filter
  $search.on('input', function() {
    const q = $(this).val().trim().toLowerCase();
    if (!q) return render();
    const filtered = tasks.filter(t => t.text.toLowerCase().includes(q));
    render(filtered);
  });

  // clear completed
  $('#clearCompleted').on('click', function() {
    tasks = tasks.filter(t => !t.done);
    save();
    render();
  });

  // clear all (confirmation)
  $('#clearAll').on('click', function() {
    if (!confirm('Remove ALL tasks?')) return;
    tasks = [];
    save();
    render();
  });

  // small UX: keyboard shortcut to focus input (press "n")
  $(document).on('keydown', function(e) {
    if (e.key === 'n' || e.key === 'N') {
      $taskInput.focus();
    }
  });
});
