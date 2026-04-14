const STORAGE_KEY = 'shopping-list';

const form = document.getElementById('add-form');
const input = document.getElementById('item-input');
const listEl = document.getElementById('shopping-list');
const summaryEl = document.getElementById('summary');
const summaryText = document.getElementById('summary-text');
const clearCheckedBtn = document.getElementById('clear-checked');

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let items = loadItems();

function render() {
  listEl.innerHTML = '';

  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'list-item' + (item.checked ? ' checked' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => toggleItem(index));

    const span = document.createElement('span');
    span.className = 'item-text';
    span.textContent = item.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.title = '삭제';
    deleteBtn.addEventListener('click', () => deleteItem(index));

    li.append(checkbox, span, deleteBtn);
    listEl.appendChild(li);
  });

  updateSummary();
}

function addItem(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  items.push({ name: trimmed, checked: false });
  saveItems(items);
  render();
}

function deleteItem(index) {
  items.splice(index, 1);
  saveItems(items);
  render();
}

function toggleItem(index) {
  items[index].checked = !items[index].checked;
  saveItems(items);
  render();
}

function clearChecked() {
  items = items.filter(item => !item.checked);
  saveItems(items);
  render();
}

function updateSummary() {
  if (items.length === 0) {
    summaryEl.classList.add('hidden');
    return;
  }

  const checkedCount = items.filter(i => i.checked).length;
  summaryText.textContent = `총 ${items.length}개 중 ${checkedCount}개 완료`;
  summaryEl.classList.remove('hidden');
  clearCheckedBtn.style.display = checkedCount > 0 ? '' : 'none';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  addItem(input.value);
  input.value = '';
  input.focus();
});

clearCheckedBtn.addEventListener('click', clearChecked);

render();
