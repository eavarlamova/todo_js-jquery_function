$(() => {
  const MAX_TODO = 5;
  const ENTER = 'Enter';

  const $tabs = $('.tabs');
  const $pages = $('.pages');
  const $todoList = $('.todo__list');
  const $todoCounter = $('.todo_counter');
  const $todoAddInput = $('.todo__add-input');
  const $todoAddButton = $('.todo__add-button');
  const $todoCheckAllTodo = $('.todo__check-all-todo');
  const $todoDeleteCompleted = $('.todo__delete-completed');

  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let currentPage = 1;
  let currentTab = 'all-tab';

  const setLocalStorage = () => localStorage.setItem('todos', JSON.stringify(todos));

  const normolizeText = (text) => (
    text
      .trim()
      .replace(/\u0026/gu, '&amp;')
      .replace(/\u003C/gu, '&lt;')
      .replace(/\u003E/gu, '&gt;')
      .replace(/\u0022/gu, '&quot;')
      .replace(/\u0027/gu, '&#x27;')
      .replace(/\u002F/gu, '&#x2F;')
  );

  const counterTodos = (completedTodosLength) => {
    $todoCounter.html(`you done ${completedTodosLength}/${todos.length}`);
  };

  const normolizeCheckAll = (status = false) => {
    $todoCheckAllTodo.prop('checked', status);
  };

  const normolizeCurrentPage = (lastPage) => {
    currentPage = currentPage > lastPage ? lastPage : currentPage;
    currentPage = currentPage < 1 ? 1 : currentPage;
  };

  const mapArray = (currentId, key, value, array = todos) => array
    .map((item) => (item.id === currentId ? { ...item, [key]: value } : item));

  const filterArray = (value = true, key = 'status', array = todos) => array.filter((item) => item[key] !== value);

  const getParentId = (currentThis) => Number(currentThis.parent().attr('id'));

  const getLastPage = (currentTodos = todos) => Math.ceil(currentTodos.length / MAX_TODO);

  const render = (array = todos) => {
    const stringForRender = array.reduce((str, { text, status, id }) => (`
    ${str}
    <li id="${id}">
      <input type="checkbox" class="todo__check-todo" ${status && 'checked'}/>
      <span class="todo__text-todo"> ${text} </span>
      <button class="todo__delete-todo"> x </button>
    </li>
    `), '');
    $todoList.html(stringForRender);
  };

  const renderTabs = () => {
    const tabs = ['all', 'active', 'completed'];
    const stringForRender = tabs.reduce((str, item) => (
      `${str}
      <button id="${item}-tab" class="tabs__button ${currentTab === `${item}-tab` && 'tabs__button_active'}">${item}</button>`
    ), '');
    $tabs.html(stringForRender);
  };

  const renderPages = (currentTodos) => {
    const maxPages = getLastPage(currentTodos);
    normolizeCurrentPage(maxPages);
    const stringForRender = Array.from({ length: maxPages }, (v, k) => k + 1)
      .reduce((str, item) => `
      ${str}
      <li class='pages__page ${currentPage === item && 'pages__page_active'}'>${item}</li>
      `, '');
    $pages.html(stringForRender);
  };

  const getCurrentTodosForPage = (array) => {
    const start = (currentPage - 1) * MAX_TODO;
    const end = start + MAX_TODO;
    return array.slice(start, end);
  };

  const getCurrentRendersTodos = (activeTodos, completedTodos) => {
    let currentTodos = todos;
    if (currentTab !== 'all-tab') {
      currentTodos = currentTab === 'completed-tab' ? completedTodos : activeTodos;
    }
    renderPages(currentTodos);
    currentTodos = getCurrentTodosForPage(currentTodos);
    render(currentTodos);
  };

  const manageTodoApp = () => {
    setLocalStorage();
    const activeTodos = filterArray(true);
    const completedTodos = filterArray(false);
    counterTodos(completedTodos.length);
    renderTabs();
    getCurrentRendersTodos(activeTodos, completedTodos);
    const currentStatusCheckAll = todos.length === completedTodos.length && todos.length;
    normolizeCheckAll(currentStatusCheckAll);
  };

  const addTodo = () => {
    const newText = normolizeText($todoAddInput.val());
    if (newText) {
      const newTodo = {
        text: newText,
        status: false,
        id: Math.random(),
      };
      todos.push(newTodo);
      currentTab = 'all-tab';
      currentPage = getLastPage();
      $todoAddInput.val('');
      manageTodoApp();
    }
  };

  const checkTodo = function () {
    const currentId = getParentId($(this));
    const currentStatus = $(this).prop('checked');
    todos = mapArray(currentId, 'status', currentStatus);
    manageTodoApp();
  };

  const checkAllTodo = function () {
    const currentStatus = $(this).prop('checked');
    todos = todos.map((item) => ({ ...item, status: currentStatus }));
    manageTodoApp();
  };

  const deleteTodo = function () {
    const currentId = getParentId($(this));
    todos = filterArray(currentId, 'id');
    manageTodoApp();
  };

  const deleteCompletedTodo = () => {
    todos = filterArray();
    manageTodoApp();
  };

  const showEditInput = function () {
    $(this).replaceWith('<input class="todo__edit-todo"/>');
    $('.todo__edit-todo')
      .val($(this).text().trim())
      .focus();
  };

  const saveEditTodo = function (event) {
    if (event.key === ENTER) {
      const currentId = getParentId($(this));
      const newText = normolizeText($(this).val());
      if (newText) {
        todos = mapArray(currentId, 'text', newText);
        manageTodoApp();
      }
    }
  };

  const setCurrentTab = function () {
    currentTab = $(this).attr('id');
    currentPage = 1;
    manageTodoApp();
  };

  const setCurrentPage = function () {
    currentPage = Number($(this).text());
    manageTodoApp();
  };

  $todoAddButton.on('click', addTodo);
  $todoAddInput.on('keypress', (event) => { if (event.key === ENTER) addTodo(); });
  $todoCheckAllTodo.on('change', checkAllTodo);
  $todoDeleteCompleted.on('click', deleteCompletedTodo);
  $tabs.on('click', '.tabs__button', setCurrentTab);
  $pages.on('click', '.pages__page', setCurrentPage);
  $todoList
    .on('change', '.todo__check-todo', checkTodo)
    .on('click', '.todo__delete-todo', deleteTodo)
    .on('dblclick', '.todo__text-todo', showEditInput)
    .on('keypress', '.todo__edit-todo', saveEditTodo)
    .on('blur', '.todo__edit-todo', manageTodoApp);
  $(document).ready(manageTodoApp);
});
