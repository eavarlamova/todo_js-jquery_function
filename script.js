$(() => {
  const MAX_TODO = 5;
  const ENTER = 'Enter';

  const $todoCheckAllTodo = $('.todo__check-all-todo');
  const $todoAddInput = $('.todo__add-input');
  const $todoAddButton = $('.todo__add-button');
  const $todoList = $('.todo__list');
  const $todoDeleteCompleted = $('.todo__delete-completed');

  let todos = [];
  const currentPage = 1;
  const currentTab = 'all-tab';

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
  const normolizeCheckAll = (status = false) => {
    $todoCheckAllTodo.prop('checked', status);
  };

  const mapArray = (currentId, key, value, array = todos) => array
    .map((item) => (item.id === currentId ? { ...item, [key]: value } : item));

  const filterArray = (value = true, key = 'status', array = todos) => array.filter((item) => item[key] !== value);

  const getParentId = (currentThis) => Number(currentThis.parent().attr('id'));


  const render = (array = todos) => {
    const renderString = array.reduce((str, { text, status, id }) => (`
    ${str}
    <li id="${id}">
      <input type="checkbox" class="todo__check-todo" ${status && 'checked'}/>
      <span class="todo__text-todo"> ${text} </span>
      <button class="todo__delete-todo"> x </button>
    </li>
    `), '');
    $todoList.html(renderString);
  };

  const manageTodoApp = () => {
    const activeTodos = filterArray(true);
    const completedTodos = filterArray(false);
    // counter
    // tab
    // pag
    // render
    const currentStatusCheckAll = todos.length === completedTodos.length && todos.length;
    normolizeCheckAll(currentStatusCheckAll);

    render();
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

  $todoAddButton.on('click', addTodo);
  $todoAddInput.on('keypress', (event) => { if (event.key === ENTER) addTodo(); });
  $todoCheckAllTodo.on('change', checkAllTodo);
  $todoDeleteCompleted.on('click', deleteCompletedTodo);
  $todoList
    .on('change', '.todo__check-todo', checkTodo)
    .on('click', '.todo__delete-todo', deleteTodo)
    .on('dblclick', '.todo__text-todo', showEditInput)
    .on('keypress', '.todo__edit-todo', saveEditTodo)
    .on('blur', '.todo__edit-todo', manageTodoApp);
});
